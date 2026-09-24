# Request Lifecycle

This document traces the exact path of a single HTTP request as it traverses the WFA-SQLite backend architecture. Understanding this lifecycle is critical for debugging middleware, authentication, and error propagation.

---

## 1. The Express Middleware Chain

When a request arrives at `http://localhost:5001`, it immediately hits a gauntlet of global middleware defined in `src/app.ts` before it ever reaches a specific route.

```text
Incoming HTTP Request
      ↓
[1] Security Headers (Helmet)
      ↓
[2] CORS Configuration
      ↓
[3] Request ID Injection
      ↓
[4] Rate Limiting
      ↓
[5] Body Parsing (JSON/UrlEncoded)
      ↓
[6] Idempotency Check (for Mutations)
      ↓
[7] Router / Authentication
```

### Detailed Breakdown

1. **Security Headers (`helmet`)**: Injects critical headers (HSTS, NoSniff, X-Frame-Options) to prevent XSS and clickjacking.
2. **CORS**: Enforces that only requests originating from the whitelisted frontend domain (e.g., `http://localhost:3000`) are accepted.
3. **Request ID (`src/middleware/resilience.ts`)**: Injects a unique UUID into `req.headers['x-request-id']` for distributed tracing in the structured logs.
4. **Rate Limiting (`src/middleware/resilience.ts`)**: Tracks the IP. If the limit (e.g., 100 reqs/15 min) is exceeded, immediately returns `429 Too Many Requests`.
5. **Body Parser**: Parses the incoming JSON payload so it is accessible on `req.body`.
6. **Idempotency (`src/middleware/idempotency.ts`)**: For `POST/PUT/PATCH` requests, checks if the `Idempotency-Key` header exists and has been seen recently. If it has, it short-circuits the entire request and immediately returns the cached response.

---

## 2. Route & Business Logic Execution

If the request survives the global middleware, it is passed to the specific Route handler.

```text
[8] Route Definition
      ↓
[9] Authentication Middleware
      ↓
[10] Authorization (RBAC) Guard
      ↓
[11] Input Validation
      ↓
[12] Controller
      ↓
[13] Service
      ↓
[14] Repository
      ↓
[15] SQLite Execution
```

### Detailed Breakdown

8. **Route (`src/routes/*.ts`)**: The router identifies the correct path (e.g., `POST /v1/leave/apply`).
9. **Authentication (`src/middleware/auth.ts`)**: Extracts the JWT from the `HttpOnly` cookie or Authorization header. If invalid or expired, returns `401 Unauthorized`. If valid, attaches the decoded payload to `req.user`.
10. **RBAC Guard (`src/middleware/roleGuard.ts`)**: Verifies `req.user.role` against the allowed roles for the route. If insufficient, returns `403 Forbidden`.
11. **Input Validation**: Ensures the `req.body` matches the required schema (e.g., date ranges are valid, strings aren't empty). Returns `400 Bad Request` if it fails.
12. **Controller (`src/controllers/*.ts`)**: Acts as the orchestrator. It extracts the sanitized inputs from `req` and passes them to the Service.
13. **Service (`src/services/*.ts`)**: Executes core business logic (e.g., "Does this employee have enough leave balance?"). It relies heavily on Repositories to fetch needed data.
14. **Repository (`src/repositories/*.ts`)**: Constructs the SQL queries.
15. **SQLite**: The database executes the transaction using the WAL journal mode and returns the result.

---

## 3. The Response Phase

Once the database finishes, the data bubbles back up to the user.

```text
Database Result
      ↓
Repository Returns Entity
      ↓
Service Applies Transformations
      ↓
Controller Formats JSON Payload
      ↓
[16] Idempotency Middleware Caches Response (if applicable)
      ↓
[17] Express sends HTTP Response
      ↓
[18] Global Error Handler (if an exception was thrown)
```

### Detailed Breakdown

16. **Caching**: If this was a successful mutation with an Idempotency-Key, the response payload is cached in memory for 24 hours.
17. **Response**: Express sends the final JSON payload and `2xx` HTTP status code to the client.
18. **Global Error Handler (`src/app.ts`)**: If ANY component (Service, Repository, etc.) threw an Error during this entire lifecycle, execution immediately jumps here. The Error Handler suppresses stack traces in production, logs the failure via the structured logger (including the Request ID), and sends a standardized `{ error: { message, code } }` response to the client.
