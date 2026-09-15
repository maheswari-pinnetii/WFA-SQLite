import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../../database/sqlite');
const DB_PATH = path.join(DB_DIR, process.env.NODE_ENV === 'test' ? 'wfa-test.sqlite' : 'wfa.sqlite');

let cloudDb: SQLiteCloudDatabase | null = null;
let localDb: BetterSqlite3.Database | null = null;

export const connectDatabase = async (): Promise<any> => {
  const cloudUrl = process.env.SQLITE_CLOUD_URL || process.env.SQLITE_CLOUD_CONNECTION_STRING;
  if (cloudUrl && process.env.NODE_ENV !== 'test') {
    try {
      console.log('[Database] Connecting to SQLite Cloud database...');
      // Only allow insecure TLS bypass in explicit non-production environments if explicitly requested
      if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_INSECURE_TLS === 'true') {
        console.warn('⚠️ [Security Warning]: Insecure TLS certificate verification is active via ALLOW_INSECURE_TLS=true');
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
      const testDb = new SQLiteCloudDatabase(cloudUrl);
      // Run test query immediately to check if server is paused/down
      await testDb.sql('SELECT 1 as active');
      console.log('[Database] Successfully connected to SQLite Cloud.');
      cloudDb = testDb;
      return cloudDb;
    } catch (err: any) {
      console.error('[Database] SQLite Cloud unavailable (node may be paused or offline). Falling back to local SQLite. Error:', err.message);
      cloudDb = null;
    }
  }

  console.log(`[Database] Connecting to local SQLite at ${DB_PATH}`);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  localDb = new BetterSqlite3(DB_PATH, { timeout: 10000 });
  localDb.pragma('foreign_keys = ON');
  localDb.pragma('journal_mode = WAL');
  localDb.pragma('synchronous = NORMAL');
  
  // Validate database integrity on connection setup
  const integrityResult = localDb.pragma('integrity_check');
  if (integrityResult && integrityResult[0] && integrityResult[0].integrity_check !== 'ok') {
    console.warn(`[Database] Warning: SQLite database integrity check returned: ${integrityResult[0].integrity_check}`);
  }
  
  // Checkpoint WAL frames to base database file
  localDb.pragma('wal_checkpoint(PASSIVE)');
  
  // Ensure base schema exists
  initLocalSchema(localDb);

  return localDb;
};

const isConnectionError = (err: any): boolean => {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('connection') ||
    msg.includes('unavailable') ||
    msg.includes('disconnected') ||
    msg.includes('paused') ||
    msg.includes('inactive') ||
    msg.includes('closed by the remote host') ||
    msg.includes('socket') ||
    msg.includes('tls') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('not connected') ||
    err.errorCode === 'ERR_CONNECTION_NOT_ESTABLISHED' ||
    err.code === 'ERR_CONNECTION_NOT_ESTABLISHED' ||
    err.errorCode === '10010' ||
    err.name === 'SQLiteCloudError'
  );
};

const initLocalSchema = (db: BetterSqlite3.Database) => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        hits INTEGER NOT NULL DEFAULT 1,
        expiresAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits(expiresAt);

      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        action TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        details TEXT,
        timestamp TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_logs(userId);

      CREATE TABLE IF NOT EXISTS trusted_devices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        device_name TEXT,
        device_fingerprint TEXT NOT NULL,
        device_type TEXT,
        auth_method TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        trusted_until TEXT NOT NULL,
        last_used_at TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);


      CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'INFO',
        confidence REAL DEFAULT 0.85,
        source TEXT NOT NULL,
        department TEXT,
        team TEXT,
        employee_id TEXT,
        data_period_start TEXT,
        data_period_end TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE'
      );
      CREATE TABLE IF NOT EXISTS feature_flags (
        key TEXT PRIMARY KEY,
        enabled INTEGER NOT NULL DEFAULT 1,
        description TEXT,
        target_roles TEXT,
        organization_id TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS delayed_jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'PENDING',
        run_at TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS dashboard_summary_mv (
        organizationId TEXT PRIMARY KEY,
        totalEmployees INTEGER DEFAULT 0,
        lastCalculatedAt TEXT
      );
      CREATE TRIGGER IF NOT EXISTS mv_employee_insert
      AFTER INSERT ON employees
      BEGIN
        INSERT INTO dashboard_summary_mv (organizationId, totalEmployees, lastCalculatedAt)
        VALUES (NEW.organizationId, 1, datetime('now'))
        ON CONFLICT(organizationId) DO UPDATE SET 
          totalEmployees = totalEmployees + 1,
          lastCalculatedAt = datetime('now');
      END;
      CREATE TRIGGER IF NOT EXISTS mv_employee_delete
      AFTER DELETE ON employees
      BEGIN
        UPDATE dashboard_summary_mv 
        SET totalEmployees = totalEmployees - 1, lastCalculatedAt = datetime('now')
        WHERE organizationId = OLD.organizationId;
      END;
      CREATE INDEX IF NOT EXISTS idx_attendancerecords_org_date_status ON attendancerecords(organizationId, date, status);

      -- Phase 2: Employee Lifecycle
      CREATE TABLE IF NOT EXISTS employee_history (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, fieldChanged TEXT NOT NULL,
        oldValue TEXT, newValue TEXT, changedBy TEXT, changedAt TEXT NOT NULL,
        organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS employee_documents (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, documentType TEXT NOT NULL, documentUrl TEXT NOT NULL,
        metadata TEXT, uploadedAt TEXT NOT NULL, uploadedBy TEXT, organizationId TEXT DEFAULT 'org-stackly',
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS employee_status_history (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, status TEXT NOT NULL, effectiveDate TEXT NOT NULL,
        reason TEXT, organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );

      -- Phase 2: Scheduling & Overtime
      CREATE TABLE IF NOT EXISTS work_schedules (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, dayOfWeek INTEGER NOT NULL, startTime TEXT NOT NULL, endTime TEXT NOT NULL,
        organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS shift_assignments (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, shiftId TEXT NOT NULL, startDate TEXT NOT NULL, endDate TEXT,
        organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE, FOREIGN KEY (shiftId) REFERENCES shifts(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS overtime_rules (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', ruleName TEXT NOT NULL, thresholdHours REAL NOT NULL, multiplier REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS overtime_records (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, date TEXT NOT NULL, hours REAL NOT NULL, status TEXT DEFAULT 'PENDING',
        approvedBy TEXT, organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );

      -- Phase 3: Payroll
      CREATE TABLE IF NOT EXISTS salary_structures (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, baseSalary REAL NOT NULL, currency TEXT DEFAULT 'USD', effectiveDate TEXT NOT NULL,
        organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS salary_components (
        id TEXT PRIMARY KEY, salaryStructureId TEXT NOT NULL, componentName TEXT NOT NULL, type TEXT NOT NULL, amount REAL NOT NULL,
        FOREIGN KEY (salaryStructureId) REFERENCES salary_structures(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS payroll_runs (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', periodStart TEXT NOT NULL, periodEnd TEXT NOT NULL, runDate TEXT NOT NULL, status TEXT DEFAULT 'DRAFT'
      );
      CREATE TABLE IF NOT EXISTS payslips (
        id TEXT PRIMARY KEY, payrollRunId TEXT NOT NULL, employeeId TEXT NOT NULL, basicPay REAL NOT NULL, totalEarnings REAL NOT NULL,
        totalDeductions REAL NOT NULL, pfAmount REAL DEFAULT 0, esiAmount REAL DEFAULT 0, ptAmount REAL DEFAULT 0, tdsAmount REAL DEFAULT 0, netPay REAL NOT NULL, status TEXT DEFAULT 'GENERATED',
        FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE, FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );

      -- Phase 5: Indian Compliance
      CREATE TABLE IF NOT EXISTS tax_slabs (
        id TEXT PRIMARY KEY,
        financialYear TEXT NOT NULL,
        regime TEXT NOT NULL,
        incomeFrom REAL,
        incomeTo REAL,
        rate REAL,
        surchargeRate REAL DEFAULT 0,
        organizationId TEXT DEFAULT 'org-stackly',
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS statutory_config (
        id TEXT PRIMARY KEY,
        configKey TEXT NOT NULL,
        financialYear TEXT,
        stateCode TEXT,
        value REAL,
        effectiveFrom TEXT,
        organizationId TEXT DEFAULT 'org-stackly',
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS investment_declarations (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        financialYear TEXT,
        section TEXT,
        declaredAmount REAL,
        actualAmount REAL,
        proofDocumentId TEXT,
        status TEXT DEFAULT 'PENDING',
        createdAt TEXT,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );


      -- Phase 3: Leave Policy & Recruitment
      CREATE TABLE IF NOT EXISTS leave_types (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', name TEXT NOT NULL, description TEXT, defaultDays INTEGER NOT NULL, isPaid INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS leave_balances (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, leaveTypeId TEXT NOT NULL, year INTEGER NOT NULL, allocated INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0,
        organizationId TEXT DEFAULT 'org-stackly', FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE, FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS leave_policies (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', 
        name TEXT NOT NULL, description TEXT, leaveTypeId TEXT NOT NULL,
        accrualRate REAL NOT NULL, accrualFrequency TEXT DEFAULT 'MONTHLY',
        maxCarryForward INTEGER DEFAULT 0, isProRata INTEGER DEFAULT 1,
        FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS leave_requests (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly',
        employeeId TEXT NOT NULL, leaveTypeId TEXT NOT NULL,
        startDate TEXT NOT NULL, endDate TEXT NOT NULL,
        isHalfDay INTEGER DEFAULT 0, halfDayPeriod TEXT,
        status TEXT DEFAULT 'PENDING', reason TEXT,
        approvedBy TEXT, approvedAt TEXT,
        createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS leave_accruals (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly',
        employeeId TEXT NOT NULL, leaveTypeId TEXT NOT NULL,
        amount REAL NOT NULL, reason TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', name TEXT NOT NULL, date TEXT NOT NULL, type TEXT DEFAULT 'PUBLIC'
      );
      CREATE TABLE IF NOT EXISTS job_requisitions (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', title TEXT NOT NULL, department TEXT, status TEXT DEFAULT 'OPEN', openings INTEGER DEFAULT 1, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY, jobRequisitionId TEXT NOT NULL, candidateName TEXT NOT NULL, candidateEmail TEXT NOT NULL, status TEXT DEFAULT 'NEW', appliedAt TEXT NOT NULL,
        FOREIGN KEY (jobRequisitionId) REFERENCES job_requisitions(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS interviews (
        id TEXT PRIMARY KEY, applicationId TEXT NOT NULL, interviewerId TEXT NOT NULL, scheduledAt TEXT NOT NULL, status TEXT DEFAULT 'SCHEDULED', feedback TEXT,
        FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE, FOREIGN KEY (interviewerId) REFERENCES employees(id) ON DELETE SET NULL
      );
      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY, applicationId TEXT NOT NULL, salaryOffered REAL NOT NULL, status TEXT DEFAULT 'PENDING', sentAt TEXT NOT NULL,
        FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
      );

      -- Phase 3: Performance
      CREATE TABLE IF NOT EXISTS performance_cycles (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', name TEXT NOT NULL, startDate TEXT NOT NULL, endDate TEXT NOT NULL, status TEXT DEFAULT 'ACTIVE'
      );
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, performanceCycleId TEXT NOT NULL, title TEXT NOT NULL, description TEXT, progress INTEGER DEFAULT 0, status TEXT DEFAULT 'IN_PROGRESS',
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE, FOREIGN KEY (performanceCycleId) REFERENCES performance_cycles(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY, employeeId TEXT NOT NULL, reviewerId TEXT NOT NULL, performanceCycleId TEXT NOT NULL, rating INTEGER, feedback TEXT, status TEXT DEFAULT 'DRAFT', submittedAt TEXT,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE, FOREIGN KEY (reviewerId) REFERENCES employees(id) ON DELETE CASCADE, FOREIGN KEY (performanceCycleId) REFERENCES performance_cycles(id) ON DELETE CASCADE
      );

      -- Phase 3: Platform Layer - Universal Approval Engine
      CREATE TABLE IF NOT EXISTS approval_workflows (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', name TEXT NOT NULL, entityType TEXT NOT NULL, description TEXT, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS approval_steps (
        id TEXT PRIMARY KEY, workflowId TEXT NOT NULL, stepOrder INTEGER NOT NULL, approverRole TEXT, specificApproverId TEXT,
        FOREIGN KEY (workflowId) REFERENCES approval_workflows(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS approval_requests (
        id TEXT PRIMARY KEY, workflowId TEXT NOT NULL, entityId TEXT NOT NULL, requesterId TEXT NOT NULL, status TEXT DEFAULT 'PENDING',
        currentStepOrder INTEGER DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL,
        FOREIGN KEY (workflowId) REFERENCES approval_workflows(id) ON DELETE CASCADE, FOREIGN KEY (requesterId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS approval_actions (
        id TEXT PRIMARY KEY, requestId TEXT NOT NULL, stepOrder INTEGER NOT NULL, approverId TEXT NOT NULL, action TEXT NOT NULL,
        comments TEXT, actionAt TEXT NOT NULL,
        FOREIGN KEY (requestId) REFERENCES approval_requests(id) ON DELETE CASCADE, FOREIGN KEY (approverId) REFERENCES employees(id) ON DELETE CASCADE
      );

      -- Phase 3: Platform Layer - Bulk Import Engine
      CREATE TABLE IF NOT EXISTS bulk_imports (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', entityType TEXT NOT NULL, status TEXT DEFAULT 'PROCESSING',
        totalRows INTEGER DEFAULT 0, successfulRows INTEGER DEFAULT 0, failedRows INTEGER DEFAULT 0, uploadedBy TEXT NOT NULL, createdAt TEXT NOT NULL, completedAt TEXT
      );
      CREATE TABLE IF NOT EXISTS import_errors (
        id TEXT PRIMARY KEY, importId TEXT NOT NULL, rowNumber INTEGER NOT NULL, rowData TEXT NOT NULL, errorMessage TEXT NOT NULL,
        FOREIGN KEY (importId) REFERENCES bulk_imports(id) ON DELETE CASCADE
      );

      -- Step 7: Assets Management
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', assetTag TEXT UNIQUE NOT NULL, assetType TEXT NOT NULL,
        description TEXT, serialNumber TEXT, purchaseDate TEXT, value REAL, status TEXT DEFAULT 'AVAILABLE',
        assignedToId TEXT, assignedAt TEXT, assignedBy TEXT, returnedAt TEXT, createdAt TEXT NOT NULL,
        FOREIGN KEY (assignedToId) REFERENCES employees(id) ON DELETE SET NULL
      );
      CREATE TABLE IF NOT EXISTS asset_history (
        id TEXT PRIMARY KEY, assetId TEXT NOT NULL, action TEXT NOT NULL, performedBy TEXT, performedAt TEXT NOT NULL, notes TEXT,
        FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_assets_org_status ON assets(organizationId, status);
      CREATE INDEX IF NOT EXISTS idx_assets_assignee ON assets(assignedToId);

      -- Step 8: Training / L&D
      CREATE TABLE IF NOT EXISTS training_courses (
        id TEXT PRIMARY KEY, organizationId TEXT DEFAULT 'org-stackly', title TEXT NOT NULL, description TEXT,
        durationHours REAL, isMandatory INTEGER DEFAULT 0, provider TEXT, expiresAfterMonths INTEGER, status TEXT DEFAULT 'ACTIVE', createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS training_enrollments (
        id TEXT PRIMARY KEY, courseId TEXT NOT NULL, employeeId TEXT NOT NULL, enrolledBy TEXT NOT NULL,
        status TEXT DEFAULT 'ENROLLED', enrolledAt TEXT NOT NULL, completedAt TEXT, score REAL, certUrl TEXT, expiresAt TEXT,
        FOREIGN KEY (courseId) REFERENCES training_courses(id) ON DELETE CASCADE,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_training_enrollments_emp ON training_enrollments(employeeId);
      CREATE INDEX IF NOT EXISTS idx_training_enrollments_course ON training_enrollments(courseId, status);

      -- ============================================================
      -- PHASE 1: ORGANIZATION STRUCTURE
      -- ============================================================
      CREATE TABLE IF NOT EXISTS org_locations (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        name TEXT NOT NULL,
        code TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'India',
        pincode TEXT,
        timezone TEXT DEFAULT 'Asia/Kolkata',
        isHeadquarters INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_org_locations_org ON org_locations(organizationId, status);

      CREATE TABLE IF NOT EXISTS designations (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        title TEXT NOT NULL,
        code TEXT,
        departmentId TEXT,
        jobLevelId TEXT,
        description TEXT,
        status TEXT DEFAULT 'ACTIVE',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_designations_org ON designations(organizationId, status);

      CREATE TABLE IF NOT EXISTS job_levels (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        band TEXT,
        minCtc REAL,
        maxCtc REAL,
        description TEXT,
        status TEXT DEFAULT 'ACTIVE',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cost_centers (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        headId TEXT,
        parentId TEXT,
        status TEXT DEFAULT 'ACTIVE',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS org_policies (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        policyType TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        config TEXT NOT NULL DEFAULT '{}',
        effectiveFrom TEXT,
        status TEXT DEFAULT 'ACTIVE',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_org_policies_type ON org_policies(organizationId, policyType, status);

      -- ============================================================
      -- PHASE 1: EMPLOYEE MASTER EXTENSION TABLES
      -- ============================================================
      CREATE TABLE IF NOT EXISTS employee_bank_details (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL UNIQUE,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        accountHolderName TEXT NOT NULL,
        accountNumber TEXT NOT NULL,
        ifscCode TEXT NOT NULL,
        bankName TEXT NOT NULL,
        branchName TEXT,
        accountType TEXT DEFAULT 'SAVINGS',
        isPrimary INTEGER DEFAULT 1,
        isVerified INTEGER DEFAULT 0,
        verifiedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS employee_tax_info (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL UNIQUE,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        panNumber TEXT,
        aadhaarReference TEXT,
        taxRegime TEXT DEFAULT 'new',
        pfAccountNumber TEXT,
        esiNumber TEXT,
        ptExempt INTEGER DEFAULT 0,
        ptExemptReason TEXT,
        financialYear TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS employee_emergency_contacts (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        alternatePhone TEXT,
        address TEXT,
        isPrimary INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_emp_emergency_contacts ON employee_emergency_contacts(employeeId);

      CREATE TABLE IF NOT EXISTS employee_skills (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        skillName TEXT NOT NULL,
        category TEXT,
        proficiencyLevel TEXT DEFAULT 'INTERMEDIATE',
        yearsOfExperience REAL,
        certificationId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_emp_skills ON employee_skills(employeeId);

      CREATE TABLE IF NOT EXISTS employee_education (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        degree TEXT NOT NULL,
        fieldOfStudy TEXT,
        institutionName TEXT NOT NULL,
        boardOrUniversity TEXT,
        startYear INTEGER,
        endYear INTEGER,
        grade TEXT,
        percentage REAL,
        isPrimary INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_emp_education ON employee_education(employeeId);

      CREATE TABLE IF NOT EXISTS employee_experience (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        companyName TEXT NOT NULL,
        designation TEXT,
        department TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT,
        isCurrent INTEGER DEFAULT 0,
        location TEXT,
        responsibilities TEXT,
        reasonForLeaving TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_emp_experience ON employee_experience(employeeId);

      -- ============================================================
      -- PHASE 2: ATTENDANCE EVENTS & SCHEDULING
      -- ============================================================

      -- Full event-sourced attendance punch log
      CREATE TABLE IF NOT EXISTS attendance_events (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        employeeId TEXT NOT NULL,
        eventType TEXT NOT NULL,
        eventTimestamp TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        accuracy REAL,
        ipAddress TEXT,
        deviceId TEXT,
        shiftId TEXT,
        isLate INTEGER DEFAULT 0,
        isEarlyCheckout INTEGER DEFAULT 0,
        source TEXT DEFAULT 'web',
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_att_events_emp_date ON attendance_events(employeeId, eventTimestamp);
      CREATE INDEX IF NOT EXISTS idx_att_events_org_date ON attendance_events(organizationId, eventTimestamp);

      -- Monthly attendance summary — fed into payroll for LOP
      CREATE TABLE IF NOT EXISTS attendance_monthly_summary (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        employeeId TEXT NOT NULL,
        month TEXT NOT NULL,
        presentDays INTEGER DEFAULT 0,
        absentDays INTEGER DEFAULT 0,
        lateDays INTEGER DEFAULT 0,
        halfDays INTEGER DEFAULT 0,
        lopDays REAL DEFAULT 0,
        totalHours REAL DEFAULT 0,
        overtimeHours REAL DEFAULT 0,
        workingDays INTEGER DEFAULT 0,
        status TEXT DEFAULT 'DRAFT',
        computedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(employeeId, month),
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_att_monthly_emp ON attendance_monthly_summary(employeeId, month);
      CREATE INDEX IF NOT EXISTS idx_att_monthly_org ON attendance_monthly_summary(organizationId, month);

      -- Shifts definition table
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        name TEXT NOT NULL,
        shiftType TEXT DEFAULT 'fixed',
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        breakDurationMinutes INTEGER DEFAULT 60,
        gracePeriodMinutes INTEGER DEFAULT 15,
        workHoursPerDay REAL DEFAULT 8,
        weekOffDays TEXT DEFAULT '["Saturday","Sunday"]',
        isFlexible INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_shifts_org ON shifts(organizationId, isActive);

      -- Employee shift assignments
      CREATE TABLE IF NOT EXISTS employee_shift_assignments (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL DEFAULT 'org-stackly',
        employeeId TEXT NOT NULL,
        shiftId TEXT NOT NULL,
        effectiveFrom TEXT NOT NULL,
        effectiveTo TEXT,
        assignedBy TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (shiftId) REFERENCES shifts(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_shift_assign_emp ON employee_shift_assignments(employeeId, effectiveFrom);
    `);
  } catch (err: any) {
    console.warn('[Database] Warning: Failed to execute initLocalSchema:', err?.message || err);
  }
};

const ensureLocalDbInitialized = async () => {
  if (localDb) return;
  console.log(`[Database] Initializing local SQLite fallback database at ${DB_PATH}`);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  localDb = new BetterSqlite3(DB_PATH, { timeout: 10000 });
  localDb.pragma('foreign_keys = ON');
  localDb.pragma('journal_mode = WAL');
  localDb.pragma('synchronous = NORMAL');
  localDb.pragma('wal_checkpoint(PASSIVE)');

  initLocalSchema(localDb);
};

export const getDatabase = (): any => {
  if (cloudDb) return cloudDb;
  if (localDb) return localDb;
  throw new Error('Database is not initialized. Please call connectDatabase() first.');
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  if (cloudDb) {
    try {
      return await cloudDb.sql(sql, ...params) as T[];
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.error('[Database] SQLite Cloud connection lost or node paused. Swapping to local SQLite fallback database.');
        cloudDb = null;
        await ensureLocalDbInitialized();
        return localDb!.prepare(sql).all(...params) as T[];
      }
      throw err;
    }
  }
  await ensureLocalDbInitialized();
  return localDb!.prepare(sql).all(...params) as T[];
};

export const execute = async (sql: string, params: any[] = []): Promise<any> => {
  if (cloudDb) {
    try {
      return await cloudDb.sql(sql, ...params);
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.error('[Database] SQLite Cloud connection lost or node paused. Swapping to local SQLite fallback database.');
        cloudDb = null;
        await ensureLocalDbInitialized();
        return localDb!.prepare(sql).run(...params);
      }
      throw err;
    }
  }
  await ensureLocalDbInitialized();
  return localDb!.prepare(sql).run(...params);
};

export const transaction = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (cloudDb) {
    try {
      await cloudDb.sql('BEGIN TRANSACTION');
      try {
        const res = await fn();
        await cloudDb.sql('COMMIT');
        return res;
      } catch (err) {
        await cloudDb.sql('ROLLBACK');
        throw err;
      }
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.error('[Database] SQLite Cloud connection lost during transaction setup. Swapping to local SQLite fallback database.');
        cloudDb = null;
        await ensureLocalDbInitialized();
        // Retry logic on localDb
        localDb!.prepare('BEGIN TRANSACTION').run();
        try {
          const res = await fn();
          localDb!.prepare('COMMIT').run();
          return res;
        } catch (localErr) {
          localDb!.prepare('ROLLBACK').run();
          throw localErr;
        }
      }
      throw err;
    }
  }
  await ensureLocalDbInitialized();
  localDb!.prepare('BEGIN TRANSACTION').run();
  try {
    const res = await fn();
    localDb!.prepare('COMMIT').run();
    return res;
  } catch (err) {
    localDb!.prepare('ROLLBACK').run();
    throw err;
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const res = await query('SELECT 1 as active');
    return res && res.length > 0 && res[0].active === 1;
  } catch (err) {
    console.error('[Database Health] Health check failed:', err);
    return false;
  }
};
