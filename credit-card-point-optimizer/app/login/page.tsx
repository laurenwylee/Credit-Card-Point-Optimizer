"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function signIn() {
    setLoading(true); setError(null);
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
    } catch (value) { setLoading(false); setError(value instanceof Error ? value.message : "Unable to sign in."); }
  }
  return <div className="min-h-screen bg-[#F5F6F8]"><SiteHeader /><main className="flex items-center justify-center px-6 py-24"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#EEF0F3]"><h1 className="text-3xl font-bold tracking-[-0.01em] text-[#0A0B0D]">Sign in</h1><p className="mt-3 text-[#5B616E]">Save your cards and personalized recommendations.</p><button onClick={signIn} disabled={loading} className="mt-8 h-12 w-full rounded-full bg-[#0052FF] font-medium text-white disabled:opacity-60">{loading ? "Redirecting…" : "Continue with Google"}</button>{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}</section></main></div>;
}
