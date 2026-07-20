import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { aiGenerationConfig } from "@/lib/ai-question-generation/config";
import { getAiGenerationEntitlement } from "@/lib/ai-question-generation/entitlement";
import { AiGenerationError } from "@/lib/ai-question-generation/errors";
import { generateQuestionSet } from "@/lib/ai-question-generation/pipeline";
import { consumeAiGenerationQuota } from "@/lib/ai-question-generation/rate-limit";
import { AiGenerationRequestSchema } from "@/lib/ai-question-generation/schemas";
import {
  assertTrustedMutation,
  readLimitedJson,
  RequestSecurityError,
} from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 512;

function errorResponse(code: string, message: string, status: number, requestId: string) {
  return NextResponse.json(
    { error: { code, message }, request_id: requestId },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const requestId = randomUUID();

  try {
    assertTrustedMutation(request);
  } catch (error) {
    if (error instanceof RequestSecurityError) {
      return errorResponse(error.code, error.message, error.status, requestId);
    }
    return errorResponse("invalid_request", "Request verification failed.", 403, requestId);
  }

  if (!aiGenerationConfig.enabled) {
    return errorResponse("feature_disabled", "AI question generation is not available yet.", 404, requestId);
  }

  const entitlement = await getAiGenerationEntitlement(request);
  if (!entitlement.allowed) {
    return errorResponse("premium_required", "A premium account is required.", 403, requestId);
  }

  const quota = await consumeAiGenerationQuota(entitlement.userId);
  if (!quota.allowed) {
    const status = quota.reason === "limit_reached" ? 429 : 503;
    return errorResponse("generation_unavailable", "AI generation is temporarily unavailable.", status, requestId);
  }

  try {
    const json = await readLimitedJson(request, MAX_REQUEST_BYTES);

    const parsed = AiGenerationRequestSchema.safeParse(json);
    if (!parsed.success) {
      return errorResponse("invalid_request", "Provide a topic string.", 400, requestId);
    }

    const questionSet = await generateQuestionSet({
      rawTopic: parsed.data.topic,
      requestId,
      userId: entitlement.userId,
    });

    return NextResponse.json(
      { request_id: requestId, question_set: questionSet },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RequestSecurityError) {
      return errorResponse(error.code, error.message, error.status, requestId);
    }
    if (error instanceof AiGenerationError) {
      return errorResponse(error.code, error.message, error.status, requestId);
    }

    console.error("AI question generation failed", { requestId });
    return errorResponse("provider_failure", "Question generation failed safely.", 502, requestId);
  }
}
