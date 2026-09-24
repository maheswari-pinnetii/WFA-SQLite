# System Data Flows

This document maps out the specific paths data takes through the WFA-SQLite application for the most critical user journeys.

---

## 1. Login Flow (Authentication)

The login flow utilizes a dual-card system on the frontend (Email vs Passkey) and issues secure HttpOnly cookies on the backend.

```text
Login Page (React)
 ↓
User submits email & password (or Passkey biometric challenge)
 ↓
POST /v1/auth/login API Request
 ↓
Express Route Handler
 ↓
Validation Middleware (Zod schema checking)
 ↓
Authentication Service
 ↓
Argon2id Password Verification (against `users` table)
 ↓
JWT Generation (Access Token & Refresh Token)
 ↓
Response formatting
 ↓
Express sets `HttpOnly` Secure Cookies
 ↓
React Client receives 200 OK
 ↓
Zustand Auth State updates (`isAuthenticated: true`)
 ↓
React Router redirects to Protected Dashboard (`/employee/dashboard`)
```

---

## 2. Signup / Registration Flow

The registration flow ensures that only employees with valid corporate IDs and `@thestackly.com` emails can join.

```text
Registration Page (React)
 ↓
User submits Corporate Email, Employee ID, and Password
 ↓
POST /v1/auth/signup API Request
 ↓
Input Validation (Enforces @thestackly.com domain)
 ↓
Authentication Service
 ↓
Argon2id Hash Generation
 ↓
SQLite Transaction BEGIN
 ↓
Insert into `users` table (Credentials)
 ↓
Insert into `employees` table (Profile data linked by user_id)
 ↓
SQLite Transaction COMMIT
 ↓
Account Activation & JWT Issuance
 ↓
React Client routes to Dashboard
```

---

## 3. General Employee Data Flow (Read Operation)

When an HR admin wishes to view an employee's details, the flow relies heavily on the Repository pattern for database abstraction.

```text
HR Dashboard (React)
 ↓
GET /v1/employee/:id
 ↓
Express Route
 ↓
RBAC Middleware (Requires `HR` or `ADMIN` role)
 ↓
Employee Controller
 ↓
Employee Service
 ↓
Employee Repository
 ↓
SQLite `SELECT * FROM employees WHERE id = ?`
 ↓
Controller formats response removing sensitive PII
 ↓
React Query caches result
 ↓
React Component renders Employee Profile Card
```

---

## 4. Attendance Flow

The attendance flow manages the daily punch-in/punch-out lifecycle, including geofencing validation and offline sync safeguards.

### 4.1 Check-In
```text
Dashboard Widget
 ↓
Browser Geolocation API captures Lat/Lng
 ↓
POST /v1/attendance/check-in
 ↓
Attendance Service validates coordinates against `locations` table radius
 ↓
SQLite INSERT INTO `attendancerecords` (check_in_time)
 ↓
Response triggers UI live timer
```

### 4.2 Check-Out & Hours Calculation
```text
Dashboard Widget
 ↓
POST /v1/attendance/check-out
 ↓
Attendance Service calculates total duration (Checkout - Checkin)
 ↓
Deducts standard Break Allowance (1 hour)
 ↓
Calculates Overtime (if duration > 8 hours)
 ↓
SQLite UPDATE `attendancerecords` SET check_out_time, total_hours, overtime
 ↓
Response triggers UI summary modal
```

### 4.3 History & Corrections
```text
Employee Audit Page
 ↓
GET /v1/attendance/history (Read from DB)
 ↓
Employee identifies incorrect punch
 ↓
POST /v1/attendance/corrections (Submit reason for edit)
 ↓
Manager/HR Dashboard (Correction appears in queue)
 ↓
PUT /v1/attendance/corrections/:id/approve
 ↓
Original record is overwritten in DB with audit trail
```
