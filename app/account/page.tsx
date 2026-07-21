import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/AccountSettings";
import { getAccountViewer } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await getAccountViewer();
  if (!viewer.authConfigured) redirect("/auth");
  if (!viewer.authenticated || !viewer.email) redirect("/auth?next=/account");
  return <AccountSettings email={viewer.email} provider={viewer.provider} />;
}
