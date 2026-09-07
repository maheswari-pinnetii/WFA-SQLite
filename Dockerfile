FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Build frontend
RUN npm run build

# Production Stage
FROM node:20-alpine
WORKDIR /app

RUN addgroup -g 1001 stacklygroup && adduser -u 1001 -G stacklygroup -S stacklyuser

COPY package*.json ./
# In production, we still need tsx to run the server.ts file, so we keep dev dependencies or just copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/server.ts ./server.ts

RUN mkdir -p /app/database && chown -R stacklyuser:stacklygroup /app/database
RUN mkdir -p /app/backend/database/sqlite && chown -R stacklyuser:stacklygroup /app/backend/database/sqlite

USER stacklyuser
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
