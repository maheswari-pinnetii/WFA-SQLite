# Sprint 2 & 3 API Documentation

## Overview
This document covers the newly implemented API endpoints for Sprint 2 (Placement, Recruitment, Learning Analytics) and Sprint 3 (Predictive Workforce Planning, Skills Analytics).

---

## 1. Analytics & Dashboards (`/api/v1/dashboard`)

### `GET /dashboard/admin`
Retrieves aggregated KPIs and chart data for the Admin overview.
- **Query Parameters**: `department`, `location`, `status`, `team`
- **Response**: `{ success: true, data: { kpis: Object, charts: Object, tables: Object, databaseStats: Array } }`

### `GET /dashboard/hr`
Retrieves specialized HR metrics (e.g. Hiring Velocity, Retention, Pending Workflows).
- **Query Parameters**: `department`, `location`, `status`, `team`
- **Response**: `{ success: true, data: { kpis: Object, charts: Object } }`

---

## 2. Sprint 2: Reports & Exports (`/api/v1/reports`)

### `GET /reports/placement/export`
Exports candidate placement records including offer status and employer details.
- **Query Parameters**: `format` (csv | json)
- **Response**: File download or JSON payload.

### `GET /reports/recruitment/export`
Exports job requisition and application metrics.
- **Query Parameters**: `format` (csv | json)
- **Response**: File download or JSON payload.

### `GET /reports/learning/export`
Exports training enrollments, completion rates, and learning progress.
- **Query Parameters**: `format` (csv | json)
- **Response**: File download or JSON payload.

---

## 3. Sprint 3: Predictive & AI Analytics (`/api/v1/predictive`)

### `GET /predictive/attrition`
Calculates ML-based flight risk metrics for the workforce based on historical exits, tenure, performance, and attendance records.
- **Response**: `{ success: true, data: { highRiskCount: number, averageRisk: string, trends: Array } }`

### `GET /predictive/demand`
Forecasts future hiring demand categorized by department and roles.
- **Query Parameters**: `forecastPeriod` (months)
- **Response**: `{ success: true, data: { demandByDepartment: Array, skillsGap: Array } }`

### `GET /predictive/skills-gap`
Analyzes current workforce skills vs upcoming required skills.
- **Response**: `{ success: true, data: { currentCoverage: number, missingSkills: Array, recommendedTrainings: Array } }`

---

## Error Handling
All APIs enforce robust error handling returning standardized JSON payloads.
```json
{
  "success": false,
  "error": {
    "code": 401,
    "message": "Unauthorized: Invalid or expired token"
  }
}
```
All route handlers use the `handleControllerError` helper to ensure proper auditing and error suppression for secure logs.
