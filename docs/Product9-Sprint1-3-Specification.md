# Product 9 — Workforce Analytics Platform
Sprint 1–3 Completion, Gap & Production Readiness Specification

## Repository: [maheswari-pinnetii/WFA-SQLite](https://github.com/maheswari-pinnetii/WFA-SQLite?utm_source=chatgpt.com)
## Database: SQLite / SQLite Cloud
## Status objective: Convert the existing implementation into a fully functional, API-driven, data-driven, secure and production-verifiable Workforce Analytics Platform.

1. Executive Assessment
The repository already contains substantial implementation across:
React frontend, Express backend, SQLite database, authentication, RBAC, workforce analytics, employee directory, skill analytics, recruitment, placement, learning, performance, attrition, workforce planning, executive reporting, audit infrastructure, automated tests

Therefore, Product 9 should not be treated as a greenfield implementation.
The remaining work is primarily: Completing, correcting, integrating, securing, testing and production-hardening the existing implementation.

The completion target is:
Real Data ↓ Validated Pipeline ↓ SQLite ↓ Canonical Analytics Services ↓ Authenticated APIs ↓ RBAC/ABAC ↓ Frontend ↓ Exports/Reports ↓ Audit ↓ Automated Tests

2. Critical Rule — Definition of Done
A Sprint 1–3 feature is NOT COMPLETE merely because: a page exists, an API endpoint exists, a database table exists, a chart renders, sample data appears, a test file exists.
A feature is complete only when:
Database + Backend + Authorization + Business Calculation + API + Frontend + Error Handling + Testing + Documentation are all functional.

3. Implementation Status Classification
Every Product 9 requirement must be classified as exactly one of:
✅ COMPLETE: Implemented, integrated, tested and verified against real SQLite data.
🟡 PARTIAL: Implementation exists but requires correction, integration, security validation or additional testing.
🔴 MISSING: Required functionality does not exist.
🔴 SIMULATED: Functionality exists but uses mock data, synthetic records, hard-coded values, placeholder calculations, fake model metrics, assumed production results.
SIMULATED must not be accepted as COMPLETE.

4. Sprint 1 — Workforce & Skill Visibility
S1.1 Architecture
Required: React + TypeScript frontend, Express backend, SQLite database, REST APIs, centralized API layer, authentication, authorization, analytics services, validation, automated testing
Acceptance: All Sprint 1 pages must retrieve their business data from backend APIs. No dashboard may contain production values such as: const totalEmployees = 1000; const openPositions = 15; const attritionRate = 8.4; unless those values are explicitly configuration/business assumptions and clearly identified as such.

5. S1.2 Authentication & RBAC
Canonical business roles must be established.
Recommended canonical model: ADMIN, HR_MANAGER, EXECUTIVE, DEPARTMENT_MANAGER, TEAM_LEAD, EMPLOYEE
If existing database roles differ, create an explicit mapping rather than allowing different modules to interpret roles differently.
Required authorization hierarchy:
ADMIN └── Organization-wide administration
HR_MANAGER └── HR/workforce organization scope
EXECUTIVE └── Executive analytics scope
DEPARTMENT_MANAGER └── Department scope
TEAM_LEAD └── Team scope
EMPLOYEE └── Self scope
Authorization must be enforced server-side. Frontend route protection alone is insufficient.

6. S1.3 Workforce Data Model
Verify functional relationships between: employees, departments, teams, roles, locations, skills, employee_skills, attendance, performance, training, recruitment, placement, audit_logs
Required: foreign keys, indexes, uniqueness constraints, validation, deletion/update behavior, organization ownership, timestamps

7. S1.4 Employee APIs
Required: GET employees, GET employee/:id, POST employee, PUT employee/:id, PATCH employee/:id
Search: name, employee ID, email
Filters: department, role, location, status
Sorting must use an allowlist: name, employeeId, joiningDate, department, role, status
Never interpolate arbitrary frontend values into SQL.

8. S1.5 Workforce Dashboard
Required KPIs: Total Employees, Active Employees, New Employees, Employee Exits, Growth Rate, Attrition Rate, Department Count, Location Count, Open Positions
Every KPI must have: database source, calculation definition, API field, frontend rendering, test

9. S1.6 KPI Definitions
Create a single documented calculation contract.
For example: Growth Rate = (new employees - exits) / starting workforce × 100. Attrition Rate = exits / average workforce × 100.
The exact business definition must be approved and used consistently across: dashboard, API, export, executive portal, tests

10. S1.7 Workforce Charts
Required: Employee Growth, Department Distribution, Role Distribution, Location Distribution, Employment Status, Experience Distribution
Charts must use API response data. No static chart datasets.

11. S1.8 Dashboard Filters
Required: Department, Role, Location, Employment Status, Date From, Date To
Flow: Filter UI ↓ Query parameters ↓ API ↓ Authorization scope ↓ SQLite query ↓ Analytics calculation ↓ Response ↓ All affected dashboard components
Changing a filter must not update only one chart while leaving other KPIs based on unfiltered data.

12. S1.9 Employee Directory
Required: pagination, search, filters, sorting, authorization, loading state, empty state, error state, unauthorized state, employee detail
Large employee datasets must never require loading the entire employee table into the browser.

13. S1.10 Skill Analytics
Required: Skill Distribution, Required vs Available Skills, Skill Gaps, Department Skill Coverage, Top Skills, Missing Skills, Certification Status, Training Recommendations
Skill-gap calculation must use: Employee + Role Requirements + Current Skills + Required Skill Level (not merely employee_skills.isMissingSkill) where richer role-based requirements are expected.

14. S1.11 Training Recommendation Flow
Required lifecycle: Role ↓ Required Skill ↓ Employee Current Skill ↓ Gap ↓ Gap Severity ↓ Recommended Training ↓ Enrollment ↓ Completion ↓ Assessment ↓ Certification ↓ Skill Reassessment

15. Sprint 2 — Placement, Recruitment & Learning
S2.1 Data Pipeline
This is the highest-priority Sprint 2 correction. The existing pipeline contains synthetic/mock generation. That implementation must not be treated as production data integration.
Replace synthetic generation with: Source ↓ Ingestion ↓ Schema Validation ↓ Normalization ↓ Identity Matching ↓ Duplicate Detection ↓ Data Quality ↓ Transaction ↓ SQLite

16. S2.2 Pipeline Sources
The architecture must support defined source types, for example: HRIS, ATS, LMS, Attendance, Payroll, Performance
For development/testing, fixtures may exist. However: Test fixtures must be isolated from production ingestion logic.

17. S2.3 Import Batch Tracking
Create/import: import_batches
Track: batchId, source, startedAt, completedAt, recordsReceived, recordsInserted, recordsUpdated, recordsRejected, duplicates, status, errorCount

18. S2.4 Data Quality
Track: missing employee, duplicate record, invalid email, invalid date, invalid department, invalid skill, invalid salary, invalid status, missing required field

19. S2.5 Idempotency
If the same source data is imported twice: Import #1 → creates records, Import #2 → does not duplicate records
Use: source record IDs, unique constraints, idempotency keys, transactional processing

20. S2.6 Placement Analytics
Required: Candidates Placed, Candidates Placement Rate, Average Placement Time, Salary Analysis, Department, Skill, Location, Employer, Placement Funnel

21. S2.7 Recruitment Analytics
Required: Open Positions, Applications, Shortlisted, Interviews, Offers, Hires, Time to Hire, Cost per Hire, Offer Acceptance Rate, Recruitment Funnel

22. S2.8 Learning Analytics
Required: Enrollments, Completion Rate, Assessment Scores, Training Hours, Certifications, Learning Plan Progress, Training Effectiveness

23. S2.9 Skill-to-Learning Connection
Required: Skill Gap ↓ Recommended Course ↓ Enrollment ↓ Completion ↓ Assessment ↓ Skill Improvement

24. S2.10 Exports
Required formats: CSV, XLSX, PDF
Exports must use the same: filters, authorization, organization scope, department scope, team scope, date range as the corresponding dashboard.

25. S2.11 Export Security
Example: Manager → Department A dashboard must produce: Department A export (not Company-wide export).
Every sensitive export must generate an audit event: actor, report format, filters, record count, timestamp, scope

26. Sprint 3 — Predictive Workforce Planning
S3.1 Attrition
Required input features may include: attendance, performance, promotion history, salary progression, experience, tenure, training, engagement

27. S3.2 Prediction Output
Each prediction should contain: employeeId, riskScore, riskCategory, riskFactors, confidence, modelVersion, predictionTimestamp, recommendedAction

28. S3.3 Distinguish Rule Engine vs ML
A manually weighted calculation must be labelled: Rule-based/statistical risk scoring. It must not be presented as a validated machine-learning model.

29. S3.4 Model Lifecycle
Required: Historical Dataset ↓ Feature Engineering ↓ Training ↓ Validation ↓ Testing ↓ Evaluation ↓ Model Version ↓ Deployment ↓ Prediction ↓ Monitoring

30. S3.5 Model Evaluation
Metrics must be generated from actual evaluation data.

31. S3.6 Prediction History
Persist: predictionId, employeeId, modelVersion, runId, riskScore, category, confidence, predictionDate, featureSnapshot

32. S3.7 Model Drift
Monitor: feature drift, prediction drift, performance drift, data-quality drift

33. S3.8 Attrition Dashboard
Required: Risk Distribution, Department Risk, Risk Trend, High-Risk Employees, Risk Factors, Model Metrics, Model Version, Prediction Date

34. S3.9 Sensitive Prediction Authorization
Required: Employee → self-permitted data only. Team Lead → team scope. Department Manager → department scope. HR Manager → authorized HR scope. Executive → appropriate aggregate/strategic scope. Admin → governed administrative scope.

35. S3.10 Demand Forecasting
Remove hard-coded: growthRate = 0.15 unless it is explicitly entered as a configurable business scenario assumption.

36. S3.11 Forecast Output
Required: future period, required headcount, expected headcount, workforce gap, required hiring, required skills, location, confidence interval

37. S3.12 Workforce Planning Scenarios
Required scenarios: Business Growth, High Attrition, Department Expansion, New Project, Hiring Freeze, Skill Shortage, Budget Reduction

38. S3.13 Performance Analytics
Required: Performance Trends, Department Comparison, Role Comparison, High Performers, Low Performers, Performance vs Training, Performance vs Attendance, Promotion Readiness

39. S3.14 Executive Portal
Executive reporting should consume canonical analytics services. No separate duplicate calculation logic should exist.

40. Audit & Security
S4.1 Audit Logging
Audit: authentication, authorization failures, employee-sensitive access, prediction views, model changes, forecast changes, workforce planning changes, exports, administrative changes

41. S4.2 Tamper-Evident Audit
For sensitive audit events: current event + previous event hash = current event hash

42. S4.3 OWASP Security Coverage
The application should explicitly test relevant OWASP risks.

43. Analytics Security Test Suite
Add/verify: analytics-rbac.test.ts, analytics-abac.test.ts, analytics-idor.test.ts, analytics-scope.test.ts, analytics-export-security.test.ts, analytics-filter-security.test.ts, analytics-injection.test.ts, attrition-privacy.test.ts, forecast-authorization.test.ts, audit-integrity.test.ts

44. Performance Requirements
Define measurable SLOs.

45. Analytics Pagination
Paginate: employees, high-risk employees, candidates, applications, placements, training enrollments, audit logs, reports

46. Observability
Track: request ID, user ID, organization ID, API latency, database latency, pipeline latency, export latency, model execution time, forecast execution time, errors, authorization failures

47. Data Freshness
Analytics should expose: last successful sync, last failed sync, source data freshness

48. Error Handling
Every major feature needs: Loading, Empty, Error, Unauthorized, Timeout, Insufficient data

49. Canonical Analytics Architecture
Use Canonical Services (WorkforceAnalyticsService, etc.). API, Dashboard, Export, Executive Portal all consume the same canonical calculation layer.

50. Single Source of Truth
The same metric must return the same value everywhere.

51. Database Requirements
Verify: foreign_keys = ON, WAL mode, transactions, indexes, unique constraints, foreign keys, migration versioning, backup/restore, integrity checks

52. Testing Requirements
Unit, Integration, Security, E2E

53. CI/CD Quality Gate
npm run typecheck ↓ npm run lint ↓ npm run test ↓ integration tests ↓ security tests ↓ E2E tests ↓ npm run build

54. P0 — Blocking Completion Items
Data:
Remove production mock/synthetic pipeline.
Implement real ingestion.
Implement validation.
Implement duplicate detection.
Implement idempotency.
Implement import-batch tracking.
Implement data-quality reporting.

Analytics:
Remove hard-coded KPI values.
Remove hard-coded forecast growth.
Establish canonical analytics services.
Verify every dashboard uses real APIs.
Verify filters propagate end-to-end.

Predictive:
Replace hard-coded model metrics.
Implement model evaluation.
Implement model versioning.
Implement prediction history.
Implement model drift monitoring.
Distinguish rule-based scoring from ML.

Exports:
Implement CSV.
Implement XLSX.
Implement PDF.
Enforce RBAC/ABAC on exports.
Audit sensitive exports.

Security:
Verify six-role authorization.
Verify organization/dept/team scope.
Run IDOR tests.
Run injection tests.
Run export authorization tests.
Protect sensitive attrition data.
Implement tamper-evident audit events.

Quality:
Complete integration testing.
Complete E2E testing.
Complete security testing.
Complete typecheck.
Complete lint.
Complete production build.
