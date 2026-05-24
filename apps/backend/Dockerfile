# Production Stage 1: Build the backend and monorepo packages
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root configs
COPY package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Install dependencies and build shared packages + backend
RUN npm install
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma
RUN npx turbo run build --filter=@interviewmirror/backend

# Production Stage 2: Runtime image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist/ ./apps/backend/dist/
COPY --from=builder /app/apps/backend/node_modules/ ./apps/backend/node_modules/

EXPOSE 5001
CMD ["node", "apps/backend/dist/index.js"]
