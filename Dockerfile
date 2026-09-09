FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL dependencies (including dev) for compilation
COPY package.json package-lock.json ./
RUN npm ci

# Copy full source
COPY . .

# Compile backend TypeScript → dist/ (server.ts + backend/src)
RUN npx tsc -p tsconfig.server.json
# Build Vite frontend → dist/frontend
RUN npx vite build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package.json package-lock.json ./
# Install only production dependencies — tsx is intentionally excluded
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

# Copy storage directory structure (without actual files)
RUN mkdir -p ./storage/uploads

EXPOSE 5001 3000

# Run the compiled JS entrypoint — no tsx / ts-node required at runtime
CMD ["node", "dist/server.js"]

