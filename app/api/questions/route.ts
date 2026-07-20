import { NextResponse } from "next/server";
import { getQuestionFeed } from "@/lib/questions/repository";
import { toPublicQuestion } from "@/data/question-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getQuestionFeed();
    const publicQuestions = result.questions.map(toPublicQuestion);
    return NextResponse.json(
      {
        questions: publicQuestions,
        meta: {
          count: publicQuestions.length,
          dataset_version: result.datasetVersion,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
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
