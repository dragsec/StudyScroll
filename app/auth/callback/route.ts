import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authDestination, authRedirectOrigin } from "@/lib/security/auth-redirect";
import {
  createPasswordRecoveryProof,
  passwordRecoveryCookie,
  passwordRecoveryLifetimeSeconds,
} from "@/lib/security/recovery-proof";
import { registerPasswordRecoveryGrant } from "@/lib/security/recovery-grant";

const privateHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const origin = authRedirectOrigin(request.url, process.env);
  if (!origin) {
    return NextResponse.json(
      { error: { code: "auth_origin_unavailable", message: "Authentication is not configured correctly." } },
      { status: 503, headers: privateHeaders },
    );
  }
  const supabase = await createServerSupabaseClient();

  if (code && supabase) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const redirectType =
        (data as typeof data & { redirectType?: unknown }).redirectType === "recovery"
          ? "recovery"
          : null;
      const destination = authDestination(requestedNext, redirectType);
      const response = NextResponse.redirect(`${origin}${destination}`, { headers: privateHeaders });
      if (redirectType === "recovery") {
        const proof = createPasswordRecoveryProof(data.user.id);
        if (!proof) {
          return NextResponse.redirect(`${origin}/auth?error=recovery-config`, { headers: privateHeaders });
        }
        try {
          if (!(await registerPasswordRecoveryGrant(data.user.id, proof))) {
            return NextResponse.redirect(`${origin}/auth?error=recovery-config`, { headers: privateHeaders });
          }
        } catch (grantError) {
          console.error("Password recovery grant creation failed", {
            errorType: grantError instanceof Error ? grantError.name : "unknown",
          });
          return NextResponse.redirect(`${origin}/auth?error=recovery-config`, { headers: privateHeaders });
        }
        response.cookies.set(passwordRecoveryCookie, proof, {
          httpOnly: true,
          maxAge: passwordRecoveryLifetimeSeconds,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback`, { headers: privateHeaders });
}
