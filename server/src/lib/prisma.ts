import { PrismaClient } from "@prisma/client";

// One client per process. Under ts-node/nodemon reloads, reuse the existing
// instance instead of opening a new connection pool on every restart.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
