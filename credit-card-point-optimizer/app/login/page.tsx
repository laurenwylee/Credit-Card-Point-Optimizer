"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
  return <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200"><p className="text-sm font-medium text-emerald-700">Cardwise</p><h1 className="mt-3 text-3xl font-semibold text-zinc-950">Sign in</h1><p className="mt-3 text-zinc-600">Save your cards and personalized recommendations.</p><button onClick={signIn} disabled={loading} className="mt-8 h-12 w-full rounded-full bg-zinc-950 font-medium text-white disabled:opacity-60">{loading ? "Redirecting…" : "Continue with Google"}</button>{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}</section></main>;
}
