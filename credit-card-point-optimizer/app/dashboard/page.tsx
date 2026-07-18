import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() { const supabase = await createClient(); if (!supabase) redirect("/login"); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); return <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-20"><p className="text-sm font-medium text-emerald-700">Cardwise</p><h1 className="mt-3 text-4xl font-semibold">Your optimizer</h1><p className="mt-4 text-zinc-600">Signed in as {user.email ?? "your account"}.</p></main>; }
