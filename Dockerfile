FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for both frontend and backend
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm ci

# Copy full source
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose API port
EXPOSE 8860

# Serve both backend API and static frontend (needs to be configured in express)
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
