# Backend Architecture Patterns

This document provides a strict audit and classification of the distributed system and backend architectural patterns within the WFA-SQLite application. 

Every pattern is classified into one of five statuses:
- **IMPLEMENTED**: Fully active in the codebase.
- **PARTIALLY IMPLEMENTED**: Exists but is not used universally.
- **RECOMMENDED**: A good idea for future scale, but not yet required.
- **NOT APPLICABLE**: Incompatible or unnecessarily complex for a single-node SQLite architecture.
- **FUTURE**: Slated for upcoming development phases.

---

## 1. Data Management

### Write-Ahead Log (WAL)
Status: **IMPLEMENTED**
* **Reason**: SQLite WAL mode allows concurrent readers while a single writer is active, massively boosting throughput.
* **Location**: SQLite connection pragmas.

### Database Transactions
Status: **IMPLEMENTED**
* **Reason**: Ensures ACID compliance.
* **Location**: Repositories (e.g., Attendance and Payroll multi-row updates).

### Database Indexing
Status: **IMPLEMENTED**
* **Reason**: O(1) or O(log N) lookups on highly accessed tables.
* **Location**: `database/sqlite/` schemas.

### Cache-Aside
Status: **RECOMMENDED**
* **Reason**: High-speed memory caching (like Redis) could reduce load for `dashboard_summary_mv`, but currently SQLite's local SSD speed is sufficient.

### Change Data Capture (CDC) / CQRS / Event Sourcing
Status: **NOT APPLICABLE**
* **Reason**: The monolith relies on a single relational schema. Event streams and separate read/write models add unjustified complexity for this scale.

### Partitioning / Sharding
Status: **NOT APPLICABLE**
* **Reason**: A single-node SQLite database cannot be sharded across instances without moving to a distributed database engine like PostgreSQL or Turso.

---

## 2. Resilience

### Rate Limiting
Status: **IMPLEMENTED**
* **Reason**: Protects against DoS and brute-force login attempts.
* **Location**: `src/middleware/resilience.ts`

### Circuit Breaker
Status: **IMPLEMENTED**
* **Reason**: Prevents cascading failures when waiting on slow operations.
* **Location**: `src/utils/circuitBreaker.ts`

### Idempotency
Status: **IMPLEMENTED**
* **Reason**: Prevents duplicate mutation requests (like "Approve Leave") during network retries.
* **Location**: `src/middleware/idempotency.ts`

### Retry with Exponential Backoff
Status: **PARTIALLY IMPLEMENTED**
* **Reason**: Present in utility functions but not uniformly enforced across all database queries.

### Bulkhead
Status: **FUTURE**
* **Reason**: Route-level thread-pool isolation is difficult in Node.js without specific worker thread implementation.

---

## 3. Coordination

### Leader Election / Distributed Locking
Status: **NOT APPLICABLE**
* **Reason**: Operates on a single node. There are no competing instances requiring a distributed lock (e.g., via Redis/Zookeeper) to coordinate cron jobs.

### Distributed Transactions / Saga Pattern
Status: **NOT APPLICABLE**
* **Reason**: There are no microservices. All data resides in one database, so standard local transactions are sufficient.

---

## 4. API

### API Pagination
Status: **IMPLEMENTED**
* **Reason**: Restricts massive payload sizes (e.g., retrieving thousands of historical attendance records).
* **Location**: `src/utils/pagination.ts`

### API Versioning
Status: **IMPLEMENTED**
* **Reason**: Ensures backward compatibility (e.g., `/v1/auth/login`).
* **Location**: Express routers.

### Webhooks
Status: **FUTURE**
* **Reason**: Currently, there are no external integrations (like Slack or Workday) that require outward-bound event notifications.

---

## 5. Observability

### Structured Logging
Status: **IMPLEMENTED**
* **Reason**: JSON logs with PII redaction for easy parsing.
* **Location**: `src/config/logger.ts`

### Request IDs
Status: **IMPLEMENTED**
* **Reason**: Injects `x-request-id` into headers and logs to trace the lifecycle of a request.
* **Location**: `src/middleware/resilience.ts`

### Health Checks (Liveness & Readiness)
Status: **IMPLEMENTED**
* **Reason**: Ping endpoints for external orchestrators/load balancers to verify service health.
* **Location**: `src/app.ts` (`/live`, `/ready`)

### Distributed Tracing (e.g., OpenTelemetry)
Status: **FUTURE**
* **Reason**: Tracing spans across multiple services is not yet needed for a monolith, but could be added for deep performance insights.
