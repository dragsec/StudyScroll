import { StudyApp } from "@/components/StudyApp";
import { getAccountViewer } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const viewer = await getAccountViewer();
  return <StudyApp viewer={viewer} />;
}
