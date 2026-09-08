# Security Operations, Incident Response & Disaster Recovery

This document defines the production security operations, incident response procedures, database integrity verification, and data privacy protocols implemented in the **WFA Workforce Analytics Platform**.

---

## 1. Security Architecture Overview

| Component | Implementation | Location |
| :--- | :--- | :--- |
| **Session Engine** | SQLite-backed `sessions` & `refreshtokens` tables with real-time WebSocket revocation | [`backend/src/modules/auth/auth.repository.ts`](file:///backend/src/modules/auth/auth.repository.ts) |
| **Real-time Disconnect** | Server emits `auth:revoked` and immediately closes user socket connections | [`backend/src/sockets/socketEmitter.ts`](file:///backend/src/sockets/socketEmitter.ts) |
| **Tamper-Evident Audit** | SHA-256 cryptographic hash-chaining across historical audit entries | [`backend/src/config/db.ts`](file:///backend/src/config/db.ts) |
| **Database Integrity** | `PRAGMA integrity_check` and `PRAGMA foreign_key_check` on demand and via Admin API | [`backend/src/controllers/audit.controller.ts`](file:///backend/src/controllers/audit.controller.ts) |
| **GDPR / Privacy** | DSAR full personal record export bundle & right-to-erasure anonymization | [`backend/src/controllers/employee.controller.ts`](file:///backend/src/controllers/employee.controller.ts) |
| **Anti-Fraud Engine** | Server-side timestamps, Haversine geofence verification, idempotency keys | [`backend/src/controllers/attendance.controller.ts`](file:///backend/src/controllers/attendance.controller.ts) |

---

## 2. Active Sessions & Device Management

### 2.1 Viewing Active Sessions
Users can inspect all active devices and client sessions:
- **Endpoint**: `GET /api/v1/auth/sessions`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of active sessions containing `sessionId`, `deviceInfo`, `ipAddress`, `lastActive`, and `createdAt`.

### 2.2 Revoking an Active Session
- **Endpoint**: `DELETE /api/v1/auth/sessions/:sessionId`
- **Access Control**: Users can only revoke their own sessions (enforced via Object-Level Authorization). `ADMIN` users can revoke any session.
- **Real-Time Cascade**:
  1. Session row marked `revoked = 1`.
  2. Associated refresh token deleted.
  3. WebSocket emitter emits `auth:revoked` to the user's room.
  4. Active WebSocket connections for the session are disconnected with code `4401`.
  5. Frontend removes local tokens and redirects to `/login`.

---

## 3. Admin Security Dashboard

The Admin Security Dashboard aggregates security telemetry in real time:

- **Dashboard Endpoint**: `GET /api/v1/admin/security/dashboard` (ADMIN only)
  - `failedLoginsLast24h`: Count of failed authentication attempts in the past 24 hours.
  - `totalActiveSessions`: Current live sessions across the organization.
  - `roleChangeEvents`: Recent privilege modification actions.
  - `recentAuditActions`: Most recent tamper-evident audit logs.
- **Failed Logins Telemetry**: `GET /api/v1/admin/security/failed-logins`
  - Returns raw failed login events, source IPs, and usernames.
- **Database Integrity Check**: `GET /api/v1/admin/security/integrity`
  - Executes `PRAGMA integrity_check(100)` and `PRAGMA foreign_key_check`.
  - Confirms zero B-tree corruption or foreign key orphaned records.

---

## 4. Tamper-Evident Audit Logging

The platform maintains an immutable audit trail using a cryptographic hash chain:
1. Every record calculates its SHA-256 hash:
   $$\text{hash} = \text{SHA-256}(\text{id} + \text{timestamp} + \text{employeeId} + \text{action} + \text{details} + \text{prevHash})$$
2. `prevHash` links each log entry to the preceding entry, forming a cryptographic blockchain-style ledger.
3. Any retroactive modification to an audit row invalidates subsequent row hashes and triggers a database tamper warning.

---

## 5. GDPR / CCPA Data Privacy & Erasure

### 5.1 Data Subject Access Request (DSAR) Export
- **Endpoint**: `GET /api/v1/employees/:id/export-data`
- **Access Control**: Strict Object-Level Authorization (`id === req.user.id` or `ADMIN`/`HR`).
- **Data Classification**: `CONFIDENTIAL_PII`.
- **Payload Bundle**:
  - Full Employee profile
  - Complete historical attendance records (`attendancerecords`)
  - Leave requests and approvals (`leaverequests`)
  - Relevant user audit log trail (`audit_logs`)

### 5.2 Right to Erasure / Anonymization
- **Endpoint**: `POST /api/v1/employees/:id/anonymize-data`
- **Access Control**: `ADMIN` only.
- **Action**:
  - Replaces name with `Anonymized Employee <hash>`.
  - Replaces email with `redacted-<hash>@thestackly.com`.
  - Clears avatars and sensitive personal fields.
  - Redacts authentication records (`password_hash = 'REDACTED'`).
  - Sets employee status to `TERMINATED`.
  - Logs `DATA_ANONYMIZED` action in the audit trail.

---

## 6. Attendance Fraud Prevention & Time Integrity

1. **Server-Side Timestamp Validation**: Client-supplied timestamps are never trusted for attendance calculations. The server computes `new Date().toISOString()` internally.
2. **Clock Drift Tolerance**: Client timestamps differing by more than $\pm 10$ minutes from server time are rejected (`400 Bad Request`).
3. **Geofencing & Spoofing Mitigation**:
   - Haversine distance algorithm calculates exact meters from configured office coordinates.
   - Enforces GPS accuracy thresholds (must be $\le 150$ meters accuracy; fake/coarse GPS rejected).
4. **Idempotency Keys**:
   - Check-in and check-out support an `Idempotency-Key` header.
   - Concurrent or network-retried submissions return the cached original result without creating duplicate punches.

---

## 7. Database Integrity & Disaster Recovery

### 7.1 SQLite WAL Mode Configuration
Production SQLite databases must run with Write-Ahead Logging (WAL) enabled:
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

### 7.2 Database Integrity Verification
Admins can verify SQLite B-tree health via command line or API:
```bash
# Direct CLI verification
sqlite3 database/sqlite/wfa.sqlite "PRAGMA integrity_check;"
sqlite3 database/sqlite/wfa.sqlite "PRAGMA foreign_key_check;"
```

### 7.3 Backup Procedure
1. **Online Non-Blocking Backup**:
   Use SQLite's online backup API or the `sqlite3` CLI `.backup` command to avoid locking writers:
   ```bash
   sqlite3 database/sqlite/wfa.sqlite ".backup 'backups/wfa_backup_$(date +%Y%m%d_%H%M%S).sqlite'"
   ```
2. **Automated Verification**:
   Every backup is verified immediately after creation by opening it in read-only mode and executing `PRAGMA integrity_check`.
3. **Retention**: Daily backups retained for 30 days; weekly backups retained for 1 year.

### 7.4 Disaster Recovery (RTO & RPO)
- **Target RPO (Recovery Point Objective)**: $< 15\text{ minutes}$ (via WAL archiving).
- **Target RTO (Recovery Time Objective)**: $< 5\text{ minutes}$ (SQLite database swap).
- **Restore Protocol**:
  1. Stop application server (`systemctl stop wfa-backend` or container stop).
  2. Move corrupted database file: `mv wfa.sqlite wfa.sqlite.corrupt.$(date +%s)`.
  3. Copy verified backup: `cp backups/wfa_backup_latest.sqlite database/sqlite/wfa.sqlite`.
  4. Run `PRAGMA integrity_check;` to verify restored database.
  5. Start application server: `systemctl start wfa-backend`.
  6. Verify `/health` and `/api/v1/admin/security/integrity`.

---

## 8. Security Incident Response Playbook

```
+-------------------------------------------------------------------------------+
|                       INCIDENT RESPONSE LIFECYCLE                              |
+-------------------------------------------------------------------------------+
  1. DETECT          Alert from /admin/security/dashboard, 429 bursts, or logs
        │
  2. TRIAGE          Classify severity (P1: Data Breach, P2: Abuse, P3: Bug)
        │
  3. CONTAIN         - Invalidate user session: DELETE /api/v1/auth/sessions/:id
                     - Force global user logout via disconnectUserSockets
                     - IP block via reverse proxy (Nginx / Cloudflare)
        │
  4. ERADICATE       Rotate compromised credentials, apply patches
        │
  5. RECOVER         Verify DB integrity (PRAGMA integrity_check), restore service
        │
  6. POST-INCIDENT   Review tamper-evident audit logs, document lessons learned
```

### Emergency Contacts & Escalation
- **Security Lead**: `security@thestackly.com`
- **Infrastructure Lead**: `ops@thestackly.com`
- **Data Protection Officer (DPO)**: `dpo@thestackly.com`
