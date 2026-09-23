# 17. Changelog

All notable changes to the WFA-SQLite project will be documented in this file.

## [1.0.0] - 2026-09-20

### Added
- Reusable, enterprise-grade `ActionMenu` component ([`ActionMenu.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/components/common/ActionMenu.tsx)) built with MUI `Menu`/`MenuItem`/`Dialog` and Lucide icons.
- Integrated `ActionMenu` with Stackly RBAC (`usePermission`), dynamic row context, destructive action confirmation dialogs, keyboard navigation, and theme compatibility.
- Integrated `ActionMenu` into `EmployeeTable` with real routing & Redux dispatch actions.
- Added comprehensive unit tests in [`action-menu.test.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/tests/unit/action-menu.test.tsx).
- Standardized documentation suite comprising 17 root markdown files in `docs/` (`01-project-overview.md` to `17-changelog.md`).
- Integrated Rare UI visualization card primitives (`MeteorCard`, `SpotlightCard`) in design system showcase (`frontend/src/components/ui/rare-cards.tsx`).
- Enforced exact 8-KPI card schema per dashboard (ADMIN, HR, MANAGER, TEAM_LEAD, EMPLOYEE - 40 total cards) in `backend/src/services/dashboards/employee-dashboard.service.ts`.

### Fixed & Hardened
- Resolved `POST /employees` route authorization, Zod schema validation, duplicate email detection (409 Conflict), and hard deletion logic in `employeeRepository.softDelete`.
- Standardized error fallback response for 404 routes in Express application pipeline (`backend/src/app.ts`).
- Added missing `work_configurations` table DDL, missing shift columns, and implemented fallback queries in `attendance-phase2.service.ts`.

### Audited & Verified
- Completed Phase 3 Module Audit covering Expenses, Timesheets, HR Service Desk, Documents, and updated `docs/12-feature-matrix.md`.
- **Phase 4 Quality Gate**:
  - `npm run typecheck`: **PASSED** (0 compilation errors).
  - `npm run build`: **PASSED** (Vite frontend bundle + TypeScript server build).
  - `npm run test:unit`: **PASSED** (60/60 unit tests passed).
  - `npx vitest run tests/integration/shift-workflow.test.ts`: **PASSED** (20/20 tests passed).
  - `npx vitest run tests/integration/employee-crud.test.ts`: **PASSED** (25/25 tests passed).

### Phase 5 — Final Handover & Operations Sign-Off
- Verified production build outputs (`dist/index.html` and compiled server bundle).
- Confirmed database integrity, WAL journal mode configuration, and RBAC authorization matrix enforcement.
- Finalized enterprise master project execution plan across documentation, core services, 40 KPI dashboard cards, and security pipelines.

### Phase 6 — Continuous Monitoring & Maintenance Mode
- Verified live development server execution (`npm run dev`) and real-time backend API endpoints.
- Validated runtime database connection in WAL mode with active WebSocket event emitters (`SOCKET_EVENTS.EMPLOYEE_UPDATED`, `SOCKET_EVENTS.EMPLOYEE_STATUS_CHANGED`).
- Maintained zero type-error guarantee across all 11 core application modules.
