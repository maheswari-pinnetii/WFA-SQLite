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
