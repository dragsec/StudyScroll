import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuestionForGrading } from "@/lib/questions/repository";
import {
  assertTrustedMutation,
  readLimitedJson,
  RequestSecurityError,
} from "@/lib/security/request";
import { VerdictSchema } from "@/lib/ai-question-generation/schemas";
import type { QuestionGrade, Verdict } from "@/data/question-types";
import { databaseUrl } from "@/lib/db/prisma";
import { recordQuestionAttempt } from "@/lib/learning/state";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 512;
const QuestionIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,159}$/u);
const GradeRequestSchema = z.object({
  decisions: z.record(z.string().min(1).max(20), VerdictSchema),
  timezone: z.string().max(64).optional(),
}).strict();

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: { code: "invalid_submission", message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  try {
    assertTrustedMutation(request);
    const { questionId: rawQuestionId } = await context.params;
    const parsedId = QuestionIdSchema.safeParse(rawQuestionId);
    if (!parsedId.success) return errorResponse("Question identifier is invalid.", 400);

    const body = await readLimitedJson(request, MAX_REQUEST_BYTES);
    const parsedBody = GradeRequestSchema.safeParse(body);
    if (!parsedBody.success) return errorResponse("Submit one Legit or Sus vote per answer.", 400);

    const question = await getQuestionForGrading(parsedId.data);
    if (!question) return errorResponse("Question was not found.", 404);

    const expectedIds = question.answers.map((answer) => answer.id);
    const submittedIds = Object.keys(parsedBody.data.decisions);
    if (
      submittedIds.length !== expectedIds.length ||
      submittedIds.some((id) => !expectedIds.includes(id)) ||
      expectedIds.some((id) => !(id in parsedBody.data.decisions))
    ) {
      return errorResponse("Submit exactly one vote for every answer.", 400);
    }

    const grade: QuestionGrade = {
      questionId: question.id,
      score: 0,
      total: question.answers.length,
      answers: {},
    };

    for (const answer of question.answers) {
      const selected = parsedBody.data.decisions[answer.id] as Verdict;
      const correct = selected === answer.verdict;
      if (correct) grade.score += 1;
      grade.answers[answer.id] = {
        correct,
        verdict: answer.verdict,
        feedback: answer.feedback[selected],
      };
    }

    const user = await getAuthenticatedUser();
    if (user) {
      if (!databaseUrl()) {
        return NextResponse.json(
          { error: { code: "progress_unavailable", message: "Account progress needs PostgreSQL." } },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
      grade.learningState = await recordQuestionAttempt({
        userId: user.id,
        question,
        decisions: parsedBody.data.decisions as Record<string, Verdict>,
        score: grade.score,
        total: grade.total,
        timeZone: parsedBody.data.timezone ?? "UTC",
      });
    }

    return NextResponse.json(grade, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof RequestSecurityError) {
      return errorResponse(error.message, error.status);
    }
    console.error("Question grading failed", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: { code: "grading_unavailable", message: "This question cannot be checked right now." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
