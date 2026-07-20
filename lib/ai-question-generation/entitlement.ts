import "server-only";

export type AiGenerationEntitlement =
  | { allowed: true; userId: string }
  | { allowed: false; reason: "not_authenticated" | "not_premium" | "not_configured" };

export async function getAiGenerationEntitlement(
  _request: Request,
): Promise<AiGenerationEntitlement> {
  // Fail closed. Replace this only after server-verified authentication and
  // subscription state exist. Never trust a client-supplied premium flag.
  return { allowed: false, reason: "not_configured" };
}
