import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const response = await updateSupabaseSession(request);
  const path = request.nextUrl.pathname;
  if (path === "/learn" || path === "/account" || path.startsWith("/auth")) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  if (path.startsWith("/auth")) {
    response.headers.set("Referrer-Policy", "no-referrer");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
