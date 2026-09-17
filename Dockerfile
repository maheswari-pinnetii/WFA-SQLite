# Multi-stage production Dockerfile for Stackly Enterprise Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Install native build tools required for C++ native modules like better-sqlite3
RUN apk add --no-dependencies --no-cache python3 make g++

# Copy package manifests
COPY package*.json ./

# Install all project dependencies (including devDependencies required for tsc and vite)
RUN npm ci

# Copy full application source code
COPY . .

# Build frontend assets and compile backend TypeScript server bundle
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for SQLite
RUN apk add --no-cache sqlite

ENV NODE_ENV=production
ENV PORT=5001

# Copy build artifacts and installed node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database
COPY --from=builder /app/backend/database ./backend/database

EXPOSE 5001

CMD ["node", "dist/server.js"]