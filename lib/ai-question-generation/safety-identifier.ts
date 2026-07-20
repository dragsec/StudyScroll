import "server-only";

import { createHmac } from "node:crypto";
import { AiGenerationError } from "./errors";

export function createSafetyIdentifier(userId: string) {
  const secret = process.env.AI_SAFETY_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new AiGenerationError(
      "provider_failure",
      "AI safety identifiers are not configured.",
      503,
    );
  }

  const digest = createHmac("sha256", secret).update(userId).digest("hex");
  return `studyscroll_${digest.slice(0, 32)}`;
}
