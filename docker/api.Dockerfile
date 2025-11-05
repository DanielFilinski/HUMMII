# Backend API Dockerfile (NestJS)
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat openssl openssl-dev python3 make g++

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Development stage
FROM base AS development
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy entrypoint script first
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start development server
CMD ["npm", "run", "start:dev"]

# Test stage
FROM development AS test
WORKDIR /app

# Copy everything
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild bcryptjs (no native modules)
RUN npm install bcryptjs @types/bcryptjs

# Generate Prisma Client
RUN npx prisma generate

# Run tests
CMD ["npm", "run", "test:all"]

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
RUN apk add --no-cache openssl openssl-dev wget curl
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application and Prisma schema
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy entrypoint script for production
COPY --chown=nestjs:nodejs api-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/main"]

