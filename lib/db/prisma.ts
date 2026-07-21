import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  studyScrollPrisma?: PrismaClient;
};

export function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  return value || null;
}

export function getPrisma() {
  const connectionString = databaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required when QUESTION_DATA_SOURCE is postgres.");
  }

  if (!globalForPrisma.studyScrollPrisma) {
    const configuredPoolMax = Number(process.env.DATABASE_POOL_MAX ?? "1");
    const poolMax = Number.isSafeInteger(configuredPoolMax)
      ? Math.min(Math.max(configuredPoolMax, 1), 10)
      : 1;
    const adapter = new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000,
      max: poolMax,
    });
    globalForPrisma.studyScrollPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.studyScrollPrisma;
}
