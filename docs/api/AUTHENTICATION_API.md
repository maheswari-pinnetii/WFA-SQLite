<!-- Content from api/Auth-API.md -->

# Authentication API Specification

Endpoint specifications for authenticating users, managing JWT tokens, biometric WebAuthn/Passkey workflows, and switching security role scopes.

---

## 🔑 Modern & Standard Auth Endpoints (`/api/auth`)

Default prefilled credentials:
- **Email**: `admin@thestackly.com`
- **Password**: `StacklyWFA2026!`

### 1. `POST /api/auth/register`
Registers a new user in SQLite `users` and `employees` tables and issues a JWT token.

### 2. `POST /api/auth/login`
Authenticates user with corporate email and password hash verification. Returns JWT token and standardized user profile with permissions.

### 3. `GET /api/auth/me`
Fetches authenticated user profile and passkey registration status using `Authorization: Bearer <token>`.

### 4. `POST /api/auth/passkey/register-options`
Generates WebAuthn cryptographic challenge and public key creation options.

### 5. `POST /api/auth/passkey/register-verify`
Validates biometric attestation response and stores credential in `passkey_credentials`.

### 6. `POST /api/auth/passkey/login-options`
Generates assertion challenge and lists registered credentials for the user.

### 7. `POST /api/auth/passkey/login-verify`
Verifies WebAuthn assertion signature, increments use counter, and issues JWT session.

---

## 🛡️ Enterprise Versioned Auth Endpoints (`/v1/auth`)

### 1. `POST /v1/auth/login`
Enterprise login endpoint supporting password credentials and OTP challenge dispatch when `mfa_enabled = 1`.

### 2. `POST /v1/auth/mfa/verify`
Verifies 6-digit TOTP / email OTP challenge and issues session JWT.


### 3. `POST /v1/auth/mfa/resend`
Resends OTP challenge code.

### 4. `GET /v1/auth/me`
Retrieves authenticated user details.

### 5. `POST /v1/auth/refresh`
Rotates refresh tokens and issues fresh access token.

### 6. `POST /v1/auth/logout`
Revokes active session tokens.

---

## 🔒 Security Hardening & Gateway Protection

### 1. Strict Schema Validation
All authentication requests pass through strict Zod middleware (`.strict()`):
- **Email Validation**: Must match corporate domain `@thestackly.com`.
- **Password Complexity**: Minimum 10 characters with uppercase, lowercase, number, and special symbol.
- **Employee ID**: Must match format `STK-YYYY-NNNN`.
- **Unknown Properties**: Any extraneous property sent in body or query causes instant `400 Bad Request` rejection with parameter whitelist error.

### 2. Dual-Key Tiered Rate Limiting & Exponential Backoff
- **Per-IP and Per-Account**: Authenticated and unauthenticated attempts track both client IP address and the account identifier (email/username).
- **Thresholds**:
  - Sensitive Auth (`/api/auth/login`, `/api/auth/register`, `/v1/auth/login`): **5 attempts / 15 minutes**.
  - Password Reset (`/api/auth/password-reset`): **3 attempts / 15 minutes**.
- **Exponential Backoff**: Successive failures trigger progressive backoff headers (`Retry-After: <seconds>`) ranging from 15 seconds up to 30 minutes, preventing brute-force and credential stuffing without permanent account lockouts.
- **Storage**: Backed by high-concurrency SQLite table `rate_limits` with automatic expired key purging.

### 3. Safe Error Handling
- Internal database details, SQL statements, and stack traces are never leaked in API responses.
- Standardized error format:
```json
{
  "success": false,
  "message": "Invalid credentials provided.",
  "errors": []
}
```