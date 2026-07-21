import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PasswordResetForm } from "@/components/PasswordResetForm";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import {
  passwordRecoveryCookie,
  verifyPasswordRecoveryProof,
} from "@/lib/security/recovery-proof";

export const dynamic = "force-dynamic";

export default async function PasswordResetPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const [user, params, cookieStore] = await Promise.all([
    getAuthenticatedUser(),
    searchParams,
    cookies(),
  ]);
  const configured = Boolean(getSupabasePublicConfig());
  const updateRequested = params.mode === "update";
  const recoveryProof = cookieStore.get(passwordRecoveryCookie)?.value;
  const updateMode = Boolean(
    updateRequested &&
    user &&
    verifyPasswordRecoveryProof(recoveryProof, user.id),
  );

  if (updateRequested && !updateMode) redirect("/auth/reset?error=invalid-link");
  return (
    <PasswordResetForm
      configured={configured}
      initialError={params.error === "invalid-link" ? "That recovery link is invalid or has expired." : ""}
      updateMode={updateMode}
    />
  );
}
