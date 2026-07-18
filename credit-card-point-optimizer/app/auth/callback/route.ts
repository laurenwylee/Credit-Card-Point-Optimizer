import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";
  const supabase = await createClient();
  const code = url.searchParams.get("code");
  if (!supabase || !code || (await supabase.auth.exchangeCodeForSession(code)).error) return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  return NextResponse.redirect(new URL(destination, url.origin));
}
