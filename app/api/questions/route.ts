import { NextResponse } from "next/server";
import { getQuestionFeed } from "@/lib/questions/repository";
import { toPublicQuestion } from "@/data/question-types";
import { databaseUrl } from "@/lib/db/prisma";
import { personalizeQuestionOrder } from "@/lib/learning/state";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getQuestionFeed();
    const user = await getAuthenticatedUser();
    const personalizedQuestions =
      user && databaseUrl()
        ? await personalizeQuestionOrder(user.id, result.questions)
        : result.questions;
    const publicQuestions = personalizedQuestions.map(toPublicQuestion);
    return NextResponse.json(
      {
        questions: publicQuestions,
        meta: {
          count: publicQuestions.length,
          dataset_version: result.datasetVersion,
          personalized: Boolean(user && databaseUrl()),
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Question feed failed", { errorType: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json(
      { error: { code: "question_feed_unavailable", message: "Questions are temporarily unavailable." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
