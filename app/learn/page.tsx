import { StudyApp } from "@/components/StudyApp";
import { getAccountViewer } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [viewer, params] = await Promise.all([getAccountViewer(), searchParams]);
  return <StudyApp viewer={viewer} initialTab={params.tab === "profile" ? "profile" : "scroll"} />;
}
