import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

// Global PrismaClient instance for hot-reloads in local development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
