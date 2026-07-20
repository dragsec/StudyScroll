import "server-only";

import OpenAI from "openai";
import { AiGenerationError } from "./errors";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiGenerationError(
      "provider_failure",
      "AI question generation is not configured.",
      503,
    );
  }

  client = new OpenAI({
    apiKey,
    maxRetries: 2,
    timeout: 90_000,
  });
  return client;
}
