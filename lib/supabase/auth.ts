import "server-only";

import type { User } from "@supabase/supabase-js";
import type { AccountViewer } from "@/data/account-types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getAccountViewer(): Promise<AccountViewer> {
  const authConfigured = Boolean(getSupabasePublicConfig());
  if (!authConfigured) {
    return { authConfigured: false, authenticated: false, email: null, provider: null };
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return { authConfigured: true, authenticated: false, email: null, provider: null };
  }

  return {
    authConfigured: true,
    authenticated: true,
    email: user.email ?? null,
    provider: typeof user.app_metadata.provider === "string" ? user.app_metadata.provider : null,
  };
}
