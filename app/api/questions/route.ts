import { NextRequest, NextResponse } from "next/server";
import { getQuestionFeed, getQuestionFeedPage } from "@/lib/questions/repository";
import { toPublicQuestion, type Question } from "@/data/question-types";
import { databaseUrl } from "@/lib/db/prisma";
import { personalizeQuestionOrder } from "@/lib/learning/state";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 24;

function pageNumber(value: string | null, fallback: number, maximum: number) {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  return Math.min(Number(value), maximum);
}

export async function GET(request: NextRequest) {
  try {
    const offset = pageNumber(request.nextUrl.searchParams.get("cursor"), 0, 100_000);
    const limit = Math.max(
      1,
      pageNumber(request.nextUrl.searchParams.get("limit"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    );
    const user = await getAuthenticatedUser();
    const personalized = Boolean(user && databaseUrl());
    let pageQuestions: Question[];
    let total: number;
    let topicCounts: Record<string, number>;
    let datasetVersion: string;

    if (user && databaseUrl()) {
      const result = await getQuestionFeed();
      const personalizedQuestions = await personalizeQuestionOrder(user.id, result.questions);
      pageQuestions = personalizedQuestions.slice(offset, offset + limit);
      total = personalizedQuestions.length;
      topicCounts = personalizedQuestions.reduce<Record<string, number>>((counts, question) => {
        counts[question.topic] = (counts[question.topic] ?? 0) + 1;
        return counts;
      }, {});
      datasetVersion = result.datasetVersion;
    } else {
      const page = await getQuestionFeedPage({ offset, limit });
      pageQuestions = page.questions;
      total = page.total;
      topicCounts = page.topicCounts;
      datasetVersion = page.datasetVersion;
    }

    const end = Math.min(offset + pageQuestions.length, total);
    const publicQuestions = pageQuestions.map(toPublicQuestion);
    return NextResponse.json(
      {
        questions: publicQuestions,
        meta: {
          count: publicQuestions.length,
          total,
          next_cursor: end < total ? String(end) : null,
          topic_counts: topicCounts,
          dataset_version: datasetVersion,
          personalized,
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
