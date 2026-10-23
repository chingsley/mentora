import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaHash: string | undefined;
};

const PRISMA_SCHEMA_HASH = "teacher-subject-years-taught-v1";

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db =
  process.env.NODE_ENV === "production" ||
  globalForPrisma.prismaSchemaHash === PRISMA_SCHEMA_HASH
    ? (globalForPrisma.prisma ?? createPrismaClient())
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaSchemaHash = PRISMA_SCHEMA_HASH;
}
