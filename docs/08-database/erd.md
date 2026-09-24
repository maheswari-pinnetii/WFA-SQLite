# Entity Relationship Diagram

| Field | Value |
|-------|-------|
| Document ID | DAT-002 |
| Version | 1.0 |
| Status | Active |
| Author | Maheswari Pinneti |
| Owner | Data |
| Created | 21 September 2026 |
| Last Updated | 21 September 2026 |
| Target Release | Not specified |
| Related Documents | Not specified |

---

## 1. ERD
```mermaid
erDiagram
    EMPLOYEES ||--o{ ATTENDANCE : logs
    EMPLOYEES ||--o{ LEAVE : requests
```
