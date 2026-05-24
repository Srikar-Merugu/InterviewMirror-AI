# Production Stage 1: Build Next.js within monorepo workspace
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

RUN npm install
RUN npx turbo run build --filter=@interviewmirror/frontend

# Production Stage 2: Next runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder /app/apps/frontend/.next/ ./apps/frontend/.next/
COPY --from=builder /app/apps/frontend/public/ ./apps/frontend/public/
COPY --from=builder /app/apps/frontend/node_modules/ ./apps/frontend/node_modules/

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@interviewmirror/frontend"]
