import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuestionForGrading } from "@/lib/questions/repository";
import { setSavedQuestion } from "@/lib/learning/state";
import { assertTrustedMutation, RequestSecurityError } from "@/lib/security/request";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuestionIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,159}$/u);

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: { code: "saved_question_failed", message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function mutateSaved(
  request: Request,
  context: { params: Promise<{ questionId: string }> },
  saved: boolean,
) {
  try {
    assertTrustedMutation(request);
    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("Sign in to sync saved questions.", 401);

    const { questionId: rawQuestionId } = await context.params;
    const questionId = QuestionIdSchema.safeParse(rawQuestionId);
    if (!questionId.success) return errorResponse("Question identifier is invalid.", 400);
    if (!(await getQuestionForGrading(questionId.data))) {
      return errorResponse("Question was not found.", 404);
    }

    await setSavedQuestion(user.id, questionId.data, saved);
    return NextResponse.json(
      { questionId: questionId.data, saved },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RequestSecurityError) return errorResponse(error.message, error.status);
    console.error("Saved question mutation failed", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return errorResponse("Saved questions are temporarily unavailable.", 503);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  return mutateSaved(request, context, true);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  return mutateSaved(request, context, false);
}
