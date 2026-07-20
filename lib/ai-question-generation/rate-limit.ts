import "server-only";

export type QuotaDecision =
  | { allowed: true }
  | { allowed: false; reason: "limit_reached" | "not_configured"; retryAfterSeconds?: number };

export async function consumeAiGenerationQuota(
  _userId: string,
): Promise<QuotaDecision> {
  // Fail closed until a distributed limiter such as Redis is connected.
  // A per-process Map is not sufficient on Vercel or a multi-instance backend.
  return { allowed: false, reason: "not_configured" };
}
