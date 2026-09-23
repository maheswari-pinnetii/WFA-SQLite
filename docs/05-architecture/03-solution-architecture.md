# 03. Solution Architecture

## Architecture Pattern
Decoupled client-server architecture with an Express Node.js API backend and a React 18 single-page application frontend, communicating over HTTP REST APIs and WebSockets.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            Frontend (React 18 + Vite)                            │
│  - Redux Toolkit (Global/Auth)  - React Query (Server State)  - Tailwind + MUI   │
│  - React Router v6 (Role Guards) - Lucide/MUI Icons           - Socket.IO Client │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTP REST / WebSocket
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                             Backend (Node.js + Express)                          │
│  - JWT/Passkey Auth            - Zod Input Validation    - ABAC / Tenant Scope   │
│  - Security Suite & Helmets    - Socket.IO Gateway       - Express Controllers   │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ SQL Queries (better-sqlite3 / WAL)
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                          Database (SQLite 3 + WAL Mode)                          │
│  - 37 Migration Scripts        - Relational Integrity    - Foreign Keys Enabled  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Pipeline
1. **User Action**: Triggered via React component.
2. **API Layer**: Handled by Axios client sending JWT bearer token.
3. **Middleware Chain**:
   - `helmet` / CORS security suite
   - Rate limiting check
   - Auth verification (`verifyToken`)
   - RBAC/ABAC role & scope validation (`authorizeRoles`, `tenantScope`)
   - Zod request body validation (`validateInput`)
4. **Business Logic**: Controller delegates to domain Service layer.
5. **Data Access**: Repository executes parameterized SQL via `better-sqlite3`.
6. **Real-Time Notification**: Socket.IO gateway emits live updates to connected clients.
