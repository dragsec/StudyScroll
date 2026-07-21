import { NextResponse } from "next/server";
import { readLearningState } from "@/lib/learning/state";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "not_authenticated", message: "Sign in to sync learning progress." } },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const learningState = await readLearningState(user.id);
    return NextResponse.json(
      { learningState },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Account state failed", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { error: { code: "account_state_unavailable", message: "Progress sync is temporarily unavailable." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
