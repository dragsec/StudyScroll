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
    const adapter = new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000,
      max: 10,
    });
    globalForPrisma.studyScrollPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.studyScrollPrisma;
}
