# RBAC Verification
All roles were tested using raw API tokens.
- **Admin**: Has full access.
- **Employee**: Attempted to access `/admin/backups` -> 403 Forbidden. Attempted to access `/recruitment/requisitions` -> 403 Forbidden.
- **Result**: PASS. Strict authorization guards are in place.
