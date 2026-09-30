# Multi-stage production Dockerfile for Stackly Enterprise Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all project dependencies (including devDependencies required for tsc and vite)
RUN npm ci --legacy-peer-deps

# Copy full application source code
COPY . .

# Build frontend static assets and compile backend TypeScript server bundle into dist/
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy build artifacts and installed node_modules from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

EXPOSE 5001

CMD ["node", "dist/backend/src/server.js"]