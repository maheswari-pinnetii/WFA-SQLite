# 05. Development Rules

## Coding & Architectural Guidelines

### TypeScript Rules
* Strict mode enabled (`"strict": true` in `tsconfig.json`).
* No implicit `any` types. Explicitly type function parameters, return values, and Express Request/Response extensions.

### API & Backend Rules
* Always validate incoming request body, query, and path params using **Zod schemas**.
* Controllers must delegate pure business logic to Service classes.
* Data access must go through Repository classes utilizing parameterized SQL statements with `better-sqlite3`. Never construct inline concatenated raw SQL strings.

### React & State Management Rules
* Use Redux Toolkit for global session & auth state.
* Use React Query for server-side resource fetching, caching, and invalidation.
* Search existing component primitives (`frontend/src/components/ui`) before writing custom UI components.

### Security & Access Control Rules
* Enforce authentication and RBAC/ABAC authorization middleware on all protected API endpoints.
* Never rely strictly on client-side route guards for security.
