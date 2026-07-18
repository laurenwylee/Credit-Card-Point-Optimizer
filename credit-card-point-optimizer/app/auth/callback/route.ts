import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

  const supabase = await createClient();
  if (!supabase) {
    console.error("[auth/callback] Supabase client is null — NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.");
    return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  }

  const code = url.searchParams.get("code");
  if (!code) {
    console.error("[auth/callback] No ?code param on the callback URL:", url.toString());
    return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message, error);
    return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
