import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertTrustedMutation,
  readLimitedJson,
  RequestSecurityError,
} from "@/lib/security/request";
import {
  passwordRecoveryCookie,
  verifyPasswordRecoveryProof,
} from "@/lib/security/recovery-proof";
import { consumePasswordRecoveryGrant } from "@/lib/security/recovery-grant";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RecoveryPasswordSchema = z.object({
  password: z.string().min(12).max(128),
}).strict();

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } },
  );
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const parsed = RecoveryPasswordSchema.safeParse(await readLimitedJson(request, 384));
    if (!parsed.success) {
      return errorResponse("invalid_password", "Use a password between 12 and 128 characters.", 400);
    }

    const [cookieStore, supabase] = await Promise.all([
      cookies(),
      createServerSupabaseClient(),
    ]);
    if (!supabase) return errorResponse("not_authenticated", "The recovery link is no longer valid.", 401);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userError ? null : userData.user;
    if (!user) return errorResponse("not_authenticated", "The recovery link is no longer valid.", 401);

    const proof = cookieStore.get(passwordRecoveryCookie)?.value;
    if (!verifyPasswordRecoveryProof(proof, user.id)) {
      return errorResponse("invalid_recovery", "The recovery link is no longer valid.", 403);
    }
    if (!(await consumePasswordRecoveryGrant(user.id, proof!))) {
      return errorResponse("invalid_recovery", "The recovery link is no longer valid.", 403);
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return errorResponse("password_update_failed", "The password could not be updated.", 400);

    const signOutResult = await supabase.auth.signOut({ scope: "global" });
    if (signOutResult.error) {
      console.error("Password recovery session revocation failed", { errorType: signOutResult.error.name });
      await supabase.auth.signOut({ scope: "local" });
    }

    const response = NextResponse.json(
      { updated: true },
      { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } },
    );
    response.cookies.set(passwordRecoveryCookie, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    if (error instanceof RequestSecurityError) {
      return errorResponse(error.code, error.message, error.status);
    }
    console.error("Password recovery failed", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return errorResponse("recovery_unavailable", "Password recovery is temporarily unavailable.", 503);
  }
}
