import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getAccountViewer } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; password?: string }>;
}) {
  const [viewer, params] = await Promise.all([getAccountViewer(), searchParams]);
  if (viewer.authenticated) {
    redirect(params.mode === "signup" ? "/learn?tab=profile" : "/learn");
  }

  return (
    <AuthForm
      configured={viewer.authConfigured}
      initialMode={params.mode === "signup" ? "signup" : "login"}
      callbackError={params.error === "callback" || params.error === "recovery-config"}
      passwordUpdated={params.password === "updated"}
    />
  );
}
