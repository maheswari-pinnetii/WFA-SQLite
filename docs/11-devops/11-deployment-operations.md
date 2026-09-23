# 11. Deployment Operations

## Infrastructure Topology
* **Containerization**: Single container multi-stage Docker build or orchestrated Compose setup (`docker-compose.yml`).
* **Reverse Proxy**: NGINX routing `/` to Vite dist static assets and `/api` to Express Node.js server.
* **Database Engine**: Persistent volume mount for SQLite file (`/app/database/sqlite/wfa.sqlite`).

## Environment Configuration (`.env`)
```env
PORT=5000
NODE_ENV=production
DATABASE_PATH=database/sqlite/wfa.sqlite
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Maintenance & Backups
* SQLite Online Backup API integrated into backup controller (`/api/admin/backup`).
* Automated PRAGMA WAL checkpoints configured to preserve storage efficiency.
