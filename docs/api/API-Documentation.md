# API Overview - Stackly Workforce Analytics Platform

This directory contains endpoint specifications for the mock and backend API services powering the **Stackly Workforce Analytics Platform**.

---

## 🌐 Endpoints Structure

- 🔑 [Auth API](./Auth-API.md) - `/v1/auth/login`, `/v1/auth/signup`, `/v1/auth/refresh`, `/v1/auth/mfa/verify`
- 📊 [Dashboard API](./Dashboard-API.md) - `/v1/dashboard/scorecards`, `/v1/analytics/workforce`
- 👥 [Employee API](./Employee-API.md) - `/v1/employees`, `/v1/employees/:id`
- ⏱️ **Attendance & Shifts API** - `/v1/attendance/check-in`, `/v1/attendance/check-out`, `/v1/attendance/history`
- 🌴 **Absence & Holidays API** - `/v1/holidays`, `/v1/attendance/holidays`, `/v1/leave/requests`
- 💰 **Payroll & Compensation API** - `/v1/payroll/calculate`, `/v1/payroll/lock`, `/v1/payroll/history`

