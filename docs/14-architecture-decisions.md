# 14. Architecture Decision Records (ADRs)

## ADR-001: Selection of SQLite in WAL Mode as Primary Database Engine
* **Status**: Accepted
* **Context**: Workforce management application requires local file simplicity, fast transactions, zero-config deployment, and resilient crash recovery.
* **Decision**: Implement SQLite 3 with Write-Ahead Logging (WAL) enabled (`PRAGMA journal_mode = WAL;`) and a busy timeout of 10,000ms.
* **Consequences**: Enables concurrent multi-reader and single-writer access without lock contention errors.

## ADR-002: Dual-State Management Strategy (Redux + React Query)
* **Status**: Accepted
* **Context**: Application manages client-side authentication/session state alongside server-side resource caching (employees, attendance, payroll).
* **Decision**: Use Redux Toolkit exclusively for client session and global UI states; use React Query for server data fetching, mutations, and cache invalidation.
* **Consequences**: Prevents server-data duplication in global Redux store while ensuring seamless cache updates upon mutation.
