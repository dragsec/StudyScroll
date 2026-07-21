import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLearnerData } from "@/lib/learning/state";
import {
  assertTrustedMutation,
  readLimitedJson,
  RequestSecurityError,
} from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DeleteAccountSchema = z.object({ confirmation: z.literal("DELETE") }).strict();
const RECENT_SIGN_IN_MS = 15 * 60_000;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(request: Request) {
  try {
    assertTrustedMutation(request);
    const body = DeleteAccountSchema.safeParse(await readLimitedJson(request, 128));
    if (!body.success) return errorResponse("confirmation_required", "Type DELETE to confirm.", 400);

    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("not_authenticated", "Sign in before deleting your account.", 401);
    const signedInAt = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : Number.NaN;
    if (!Number.isFinite(signedInAt) || Date.now() - signedInAt > RECENT_SIGN_IN_MS) {
      return errorResponse(
        "reauthentication_required",
        "Log out and sign in again before deleting your account.",
        403,
      );
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return errorResponse(
        "account_deletion_unavailable",
        "Account deletion is not configured on this deployment.",
        503,
      );
    }

    await deleteLearnerData(user.id);
    const { error } = await admin.auth.admin.deleteUser(user.id, false);
    if (error) throw error;

    return NextResponse.json(
      { deleted: true },
      { headers: { "Cache-Control": "no-store", "Clear-Site-Data": '"cache", "cookies", "storage"' } },
    );
  } catch (error) {
    if (error instanceof RequestSecurityError) {
      return errorResponse(error.code, error.message, error.status);
    }
    console.error("Account deletion failed", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return errorResponse("account_deletion_failed", "Your account could not be deleted.", 503);
  }
}
