# Backend Architecture & Production Patterns

This document details the production-ready distributed systems and backend patterns for the `WFA-SQLite` project. 

---

## 1. Data Management

### SQLite WAL Mode
Status: **IMPLEMENTED**
* **Reason:** Significantly improves concurrency by allowing readers to operate simultaneously with a single writer.
* **Location:** `backend/src/config/db.ts`

### Database Transactions
Status: **IMPLEMENTED**
* **Reason:** Ensures ACID compliance across multi-table operations (e.g. check-in, payroll).
* **Location:** Utilized throughout repositories via `db.transaction()` blocks.

### Database Indexing
Status: **IMPLEMENTED**
* **Reason:** Critical for speeding up queries on high-throughput tables like `attendancerecords` and `users`.
* **Location:** `database/sqlite/` schemas and migrations.

### Cache-Aside
Status: **RECOMMENDED / FUTURE**
* **Reason:** WFA-SQLite is currently highly performant on SSDs due to SQLite's speed. In-memory caching (like Redis) is not strictly needed yet, but could be useful for `dashboard_summary_mv` in extreme scale.

### Partitioning/Sharding
Status: **NOT APPLICABLE**
* **Reason:** Unnecessary distributed-system complexity for a single-node SQLite application.

---

## 2. Resilience

### Rate Limiting
Status: **IMPLEMENTED**
* **Reason:** Protects against DoS and brute-force logins with tiered thresholds (Sensitive Auth: 5/15m, Password Reset: 3/15m, Public: 30/1m, Authenticated: 300/15m).
* **Location:** `backend/src/middleware/rateLimiter.ts` (Dual-key IP + Account tracking backed by self-healing SQLite `rate_limits` table)

### Circuit Breaker
Status: **IMPLEMENTED**
* **Reason:** Prevents cascading failures when interacting with external/unstable endpoints or heavy internal modules.
* **Location:** `backend/src/utils/circuitBreaker.ts`

### Idempotency
Status: **IMPLEMENTED**
* **Reason:** Prevents duplicate mutation requests (like payroll generation) during network retries.
* **Location:** `backend/src/middleware/idempotency.ts`

### Retry with Exponential Backoff
Status: **IMPLEMENTED**
* **Reason:** Throttles repeated failed authentication attempts using exponential backoff (15s up to 30 minutes with `Retry-After` header), preventing credential stuffing.
* **Location:** `backend/src/middleware/rateLimiter.ts`

### Bulkhead
Status: **FUTURE**
* **Reason:** Route-level thread-pool isolation is complex in single-threaded Node.js without worker threads.

---

## 3. Coordination

### Leader Election & Distributed Locking
Status: **NOT APPLICABLE**
* **Reason:** WFA-SQLite operates as a single-node monolith. Kubernetes-style leader election or distributed Redis locks are unnecessary and counterproductive.

### Saga Pattern
Status: **NOT APPLICABLE**
* **Reason:** Distributed transactions across microservices are not present in this monolith architecture.

---

## 4. API

### API Pagination
Status: **IMPLEMENTED**
* **Reason:** Prevents massive datasets from crashing the server memory.
* **Location:** `backend/src/utils/pagination.ts`

### Centralized Error Handling & Input Validation
Status: **IMPLEMENTED**
* **Reason:** Standardized JSON error formats (`{ success: false, message, errors }`) and guaranteed request sanity. Strict Zod schemas with `.strict()` reject extraneous parameters. Safe error sanitizer (`backend/src/utils/errorHandler.ts`) suppresses database schema details, file paths, and internal stack traces from client responses while retaining Winston file audit logs.
* **Location:** `backend/src/app.ts`, `backend/src/schemas/validation.schemas.ts`, and `backend/src/utils/errorHandler.ts`.

---

## 5. Observability

### Structured Logging
Status: **IMPLEMENTED**
* **Reason:** Emits JSON-formatted logs with automatic PII/Secret redaction for easy parsing by Datadog/ELK.
* **Location:** `backend/src/config/logger.ts`

### Request IDs
Status: **IMPLEMENTED**
* **Reason:** Injects `x-request-id` into headers and logs for tracing API requests.
* **Location:** `backend/src/middleware/resilience.ts`

### Health Checks (Liveness/Readiness)
Status: **IMPLEMENTED**
* **Reason:** Essential for load balancers and orchestrators to know when the node is up or connected to the DB.
* **Location:** `backend/src/app.ts` (`/live`, `/ready`)

---

## 6. Security

### Authentication & RBAC
Status: **IMPLEMENTED**
* **Reason:** Core access control utilizing zero-trust token strategies.
* **Location:** `backend/src/middleware/auth.ts`, `backend/src/middleware/roleGuard.ts`

### Graceful Shutdown
Status: **IMPLEMENTED**
* **Reason:** Safely closes HTTP sockets and the SQLite WAL database on `SIGTERM`.
* **Location:** `server.ts`