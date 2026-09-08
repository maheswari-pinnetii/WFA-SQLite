FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies from root
COPY package.json package-lock.json ./
RUN npm ci

# Copy full source
COPY . .

# Build application (tsc && vite build)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built frontend and backend artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/database ./database
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 5001 3000

CMD ["npx", "tsx", "server.ts"]

