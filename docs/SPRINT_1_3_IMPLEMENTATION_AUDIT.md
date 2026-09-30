# Product 9 — Workforce Analytics Platform
## Sprint 1–3 Completion, Gap & Production Readiness Specification

**Repository:** [maheswari-pinnetii/WFA-SQLite](https://github.com/maheswari-pinnetii/WFA-SQLite)  
**Database:** SQLite / SQLite Cloud  
**Status Objective:** Convert the existing implementation into a fully functional, API-driven, data-driven, secure and production-verifiable Workforce Analytics Platform.

---

### 1. Executive Assessment
The repository already contains substantial implementation across:
- React frontend
- Express backend
- SQLite database
- Authentication & RBAC
- Workforce analytics
- Employee directory
- Skill analytics
- Recruitment & Placement
- Learning & Performance
- Attrition & Workforce planning
- Executive reporting
- Audit infrastructure
- Automated tests

Therefore, Product 9 should not be treated as a greenfield implementation. The remaining work is primarily: **Completing, correcting, integrating, securing, testing and production-hardening the existing implementation.**

The completion target is: 
`Real Data ↓ Validated Pipeline ↓ SQLite ↓ Canonical Analytics Services ↓ Authenticated APIs ↓ RBAC/ABAC ↓ Frontend ↓ Exports/Reports ↓ Audit ↓ Automated Tests`

---

### 2. Critical Rule — Definition of Done
A Sprint 1–3 feature is **NOT COMPLETE** merely because:
- a page exists
- an API endpoint exists
- a database table exists
- a chart renders
- sample data appears
- a test file exists

A feature is complete only when: **Database + Backend + Authorization + Business Calculation + API + Frontend + Error Handling + Testing + Documentation are all functional.**

---

### 3. Implementation Status Classification
Every Product 9 requirement must be classified as exactly one of:
- ✅ **COMPLETE** Implemented, integrated, tested and verified against real SQLite data.
- 🟡 **PARTIAL** Implementation exists but requires correction, integration, security validation or additional testing.
- 🔴 **MISSING** Required functionality does not exist.
- 🔴 **SIMULATED** Functionality exists but uses mock data, synthetic records, hard-coded values, placeholder calculations, fake model metrics, or assumed production results. 

*SIMULATED must not be accepted as COMPLETE.*

---

### 4. Sprint 1 — Workforce & Skill Visibility

**S1.1 Architecture**  
Required: React + TypeScript frontend, Express backend, SQLite database, REST APIs, centralized API layer, authentication, authorization, analytics services, validation, automated testing.  
*Acceptance:* All Sprint 1 pages must retrieve their business data from backend APIs. No dashboard may contain production values unless those values are explicitly configuration/business assumptions and clearly identified as such.

**S1.2 Authentication & RBAC**  
Canonical business roles must be established: `ADMIN`, `HR_MANAGER`, `EXECUTIVE`, `DEPARTMENT_MANAGER`, `TEAM_LEAD`, `EMPLOYEE`. If existing database roles differ, create an explicit mapping.  
Required authorization hierarchy:
- `ADMIN` └── Organization-wide administration
- `HR_MANAGER` └── HR/workforce organization scope
- `EXECUTIVE` └── Executive analytics scope
- `DEPARTMENT_MANAGER` └── Department scope
- `TEAM_LEAD` └── Team scope
- `EMPLOYEE` └── Self scope  
*Authorization must be enforced server-side. Frontend route protection alone is insufficient.*

**S1.3 Workforce Data Model**  
Verify functional relationships between: employees, departments, teams, roles, locations, skills, employee_skills, attendance, performance, training, recruitment, placement, audit_logs.  
*Required:* foreign keys, indexes, uniqueness constraints, validation, deletion/update behavior, organization ownership, timestamps.

**S1.4 Employee APIs**  
Required: `GET employees`, `GET employee/:id`, `POST employee`, `PUT employee/:id`, `PATCH employee/:id`.  
*Search:* name, employee ID, email.  
*Filters:* department, role, location, status.  
*Sorting must use an allowlist:* name, employeeId, joiningDate, department, role, status. Never interpolate arbitrary frontend values into SQL.

**S1.5 Workforce Dashboard**  
Required KPIs: Total Employees, Active Employees, New Employees, Employee Exits, Growth Rate, Attrition Rate, Department Count, Location Count, Open Positions.  
*Every KPI must have:* database source, calculation definition, API field, frontend rendering, test.

**S1.6 KPI Definitions**  
Create a single documented calculation contract (e.g., Growth Rate = `(new employees - exits) / starting workforce × 100`). The exact business definition must be approved and used consistently across dashboard, API, export, executive portal, and tests.

**S1.7 Workforce Charts**  
Required: Employee Growth, Department Distribution, Role Distribution, Location Distribution, Employment Status, Experience Distribution. Charts must use API response data. No static chart datasets.

**S1.8 Dashboard Filters**  
Required: Department, Role, Location, Employment Status, Date From, Date To.  
*Flow:* Filter UI ↓ Query parameters ↓ API ↓ Authorization scope ↓ SQLite query ↓ Analytics calculation ↓ Response ↓ All affected dashboard components. Changing a filter must apply to all KPIs and charts.

**S1.9 Employee Directory**  
Required: pagination, search, filters, sorting, authorization, loading state, empty state, error state, unauthorized state, employee detail. Large datasets must never require loading the entire employee table into the browser.

**S1.10 Skill Analytics**  
Required: Skill Distribution, Required vs Available Skills, Skill Gaps, Department Skill Coverage, Top Skills, Missing Skills, Certification Status, Training Recommendations.  
Skill-gap calculation must use: Employee + Role Requirements + Current Skills + Required Skill Level.

**S1.11 Training Recommendation Flow**  
Required lifecycle: Role ↓ Required Skill ↓ Employee Current Skill ↓ Gap ↓ Gap Severity ↓ Recommended Training ↓ Enrollment ↓ Completion ↓ Assessment ↓ Certification ↓ Skill Reassessment.

---

### 15. Sprint 2 — Placement, Recruitment & Learning

**S2.1 Data Pipeline**  
This is the highest-priority Sprint 2 correction. The existing pipeline contains synthetic/mock generation. Replace synthetic generation with: Source ↓ Ingestion ↓ Schema Validation ↓ Normalization ↓ Identity Matching ↓ Duplicate Detection ↓ Data Quality ↓ Transaction ↓ SQLite.

**S2.2 Pipeline Sources**  
The architecture must support defined source types (e.g. HRIS, ATS, LMS, Attendance, Payroll, Performance). Test fixtures must be isolated from production ingestion logic.

**S2.3 Import Batch Tracking**  
Track: `batchId`, `source`, `startedAt`, `completedAt`, `recordsReceived`, `recordsInserted`, `recordsUpdated`, `recordsRejected`, `duplicates`, `status`, `errorCount`. Statuses: PENDING, RUNNING, COMPLETED, PARTIAL, FAILED.

**S2.4 Data Quality**  
Track: missing employee, duplicate record, invalid email/date/department/skill/salary/status, missing required field. Provide rejected-record information without exposing sensitive data.

**S2.5 Idempotency**  
If the same source data is imported twice, the second import must not duplicate records. Use source record IDs, unique constraints, idempotency keys, transactional processing.

**S2.6 Placement Analytics**  
Required: Candidates Placed, Candidates Placement Rate, Average Placement Time, Salary Analysis, Department, Skill, Location, Employer, Placement Funnel. Every metric needs an explicit denominator and definition.

**S2.7 Recruitment Analytics**  
Required: Open Positions, Applications, Shortlisted, Interviews, Offers, Hires, Time to Hire, Cost per Hire, Offer Acceptance Rate, Recruitment Funnel. Define date boundaries before calculating time metrics.

**S2.8 Learning Analytics**  
Required: Enrollments, Completion Rate, Assessment Scores, Training Hours, Certifications, Learning Plan Progress, Training Effectiveness. Training effectiveness must have an explicit methodology.

**S2.9 Skill-to-Learning Connection**  
Required: Skill Gap ↓ Recommended Course ↓ Enrollment ↓ Completion ↓ Assessment ↓ Skill Improvement. Must be queryable through APIs.

**S2.10 Exports**  
Required formats: CSV, XLSX, PDF. Exports must use the same filters, authorization, organization scope, department scope, team scope, date range as the corresponding dashboard.

**S2.11 Export Security**  
Manager → Department A dashboard must produce Department A export. Every sensitive export must generate an audit event: actor, report format, filters, record count, timestamp, scope.

---

### 26. Sprint 3 — Predictive Workforce Planning

**S3.1 Attrition**  
Required input features: attendance, performance, promotion history, salary progression, experience, tenure, training, engagement. The exact feature set must be documented and validated.

**S3.2 Prediction Output**  
Each prediction should contain: employeeId, riskScore, riskCategory, riskFactors, confidence, modelVersion, predictionTimestamp, recommendedAction.

**S3.3 Distinguish Rule Engine vs ML**  
A manually weighted calculation must be labelled: "Rule-based/statistical risk scoring." It must not be presented as a validated machine-learning model unless the complete model lifecycle is implemented.

**S3.4 Model Lifecycle**  
Required: Historical Dataset ↓ Feature Engineering ↓ Training ↓ Validation ↓ Testing ↓ Evaluation ↓ Model Version ↓ Deployment ↓ Prediction ↓ Monitoring.

**S3.5 Model Evaluation**  
Metrics must be generated from actual evaluation data. Required: Accuracy, Precision, Recall, F1, ROC-AUC, False Positive Rate, False Negative Rate. Never hard-code production metrics.

**S3.6 Prediction History**  
Persist: predictionId, employeeId, modelVersion, runId, riskScore, category, confidence, predictionDate, featureSnapshot.

**S3.7 Model Drift**  
Monitor: feature drift, prediction drift, performance drift, data-quality drift. Alert on thresholds.

**S3.8 Attrition Dashboard**  
Required: Risk Distribution, Department Risk, Risk Trend, High-Risk Employees, Risk Factors, Model Metrics, Model Version, Prediction Date. Employee-level information must respect authorization scope.

**S3.9 Sensitive Prediction Authorization**  
Required strictly scoped access (Employee -> self, Team Lead -> team, etc.). Every employee-level prediction access should be auditable.

**S3.10 Demand Forecasting**  
Remove hard-coded assumptions unless explicitly entered as configuration. Forecast inputs should support historical data and business demand factors.

**S3.11 Forecast Output**  
Required: future period, required headcount, expected headcount, workforce gap, required hiring, required skills, location, confidence interval.

**S3.12 Workforce Planning Scenarios**  
Required scenarios: Business Growth, High Attrition, Department Expansion, New Project, Hiring Freeze, Skill Shortage, Budget Reduction. Persist scenarios.

**S3.13 Performance Analytics**  
Required: Performance Trends, Department Comparison, Role Comparison, High Performers, Low Performers, Performance vs Training, Performance vs Attendance, Promotion Readiness.

**S3.14 Executive Portal**  
Executive reporting should consume canonical analytics services. No separate duplicate calculation logic should exist.

---

### 40. Audit & Security

**S4.1 Audit Logging**  
Audit: authentication, authorization failures, employee-sensitive access, prediction views, model changes, forecast changes, workforce planning changes, exports, administrative changes.

**S4.2 Tamper-Evident Audit**  
For sensitive audit events: `current event + previous event hash = current event hash`. Also prevent ordinary application users from UPDATE or DELETE on audit records.

**S4.3 OWASP Security Coverage**  
Explicitly test: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Authentication Failures, Software/Data Integrity Failures, Logging/Monitoring Failures, Mishandling Exceptional Conditions. 

---

### 43. Analytics Security Test Suite
Add/verify tests for RBAC, ABAC, IDOR, scope, export security, filter security, injection, privacy, authorization, and audit integrity.

### 44. Performance Requirements
Define measurable SLOs. (e.g., standard API < 1s, complex < 2s, export < 10s). Validate against realistic data volumes. Load-test where appropriate.

### 45. Analytics Pagination
Paginate large datasets. Never expose unbounded datasets through a single request.

### 46. Observability
Track request ID, user ID, organization ID, API latency, database latency, pipeline latency, export latency, model execution time, forecast execution time, errors, authorization failures.

### 47. Data Freshness
Analytics should expose last successful sync, last failed sync, source data freshness. 

### 48. Error Handling
Every major feature needs: Loading, Empty, Error, Unauthorized, Timeout, Insufficient data states.

### 49. Canonical Analytics Architecture
Do not maintain multiple implementations of the same calculation. Use canonical services (WorkforceAnalyticsService, etc.) and consume them everywhere.

### 50. Single Source of Truth
The same metric must return the same value everywhere.

### 51. Database Requirements
Verify: `foreign_keys = ON`, WAL mode, transactions, indexes, unique constraints, foreign keys, migration versioning, backup/restore, integrity checks. 

### 52. Testing Requirements
Unit, Integration, Security, and E2E tests are required for all calculation, security, and integration layers.

### 53. CI/CD Quality Gate
The repository should not be considered releasable unless: `npm run typecheck` ↓ `npm run lint` ↓ `npm run test` ↓ integration tests ↓ security tests ↓ E2E tests ↓ `npm run build` all meet thresholds.

---

### 54. P0 — Blocking Completion Items
Data
- Remove production mock/synthetic pipeline.
- Implement real ingestion, validation, duplicate detection, idempotency, import-batch tracking, data-quality reporting.

Analytics
- Remove hard-coded KPI values and forecast growth.
- Establish canonical analytics services.
- Verify every dashboard uses real APIs and filters propagate end-to-end.

Predictive
- Replace hard-coded model metrics.
- Implement model evaluation, versioning, prediction history, drift monitoring.
- Distinguish rule-based scoring from ML.

Exports
- Implement CSV, XLSX, PDF.
- Enforce RBAC/ABAC on exports.
- Audit sensitive exports.

Security
- Verify six-role authorization.
- Verify organization/dept/team scope.
- Run IDOR/injection/export authorization tests.
- Protect sensitive attrition data.
- Implement tamper-evident audit events.

Quality
- Complete integration/E2E/security testing, typecheck, lint, production build.

### 55. P1 — Production Hardening
After P0: Data freshness, Analytics pagination, Query optimization, Caching, Performance testing, Correlation IDs, Observability, Forecast confidence intervals, Scenario persistence, Executive data contract, Advanced audit reporting, Export limits, Large-dataset testing.

### 56. P2 — Enterprise Enhancements
Later: SSO/OIDC, Advanced forecasting, Automated retraining, Advanced explainability, Advanced observability, Alerting, PWA/offline support where justified. 

---

### 57. Final Product 9 Definition of Done
**Product 9 is complete only when:** All Sprint 1–3 requirements are implemented against real SQLite data, exposed through authenticated APIs, protected by server-side RBAC/ABAC, consumed consistently by the frontend and reporting layers, free of production mock/hard-coded analytics values, covered by unit/integration/security/E2E tests, documented, auditable and validated through a production-style demonstration.

The final architecture should therefore be: 
`REAL DATA ↓ INGESTION ↓ VALIDATION ↓ DATA QUALITY ↓ SQLITE ↓ CANONICAL ANALYTICS ↓ AUTHENTICATION ↓ RBAC / ABAC ↓ REST APIs ↓ ┌──────────────────────────────┐ │ React Workforce Platform     │ │ Workforce                    │ │ Skills                       │ │ Recruitment                  │ │ Placement                    │ │ Learning                     │ │ Attrition                    │ │ Forecasting                  │ │ Workforce Planning           │ │ Performance                  │ │ Executive Reporting          │ └──────────────────────────────┘ ↓ CSV / XLSX / PDF ↓ AUDIT ↓ TESTING ↓ PRODUCTION RELEASE`

## Status Correction

> **Important Correction:** The project should **not** be reported as: *"Sprint 1–3 completed because the pages and services exist."*  
> It should be explicitly reported as: **"Sprint 1–3 implementation is substantially established, with remaining completion work focused on eliminating simulated/hard-coded behavior, completing real data ingestion and analytics calculations, enforcing end-to-end authorization and export security, implementing validated predictive/forecasting workflows, strengthening auditability, and passing the complete production-readiness test gate."**
