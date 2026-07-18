import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  return <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6"><section className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-zinc-200 sm:p-16"><p className="text-sm font-medium text-emerald-700">Cardwise</p><h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-zinc-950">Put every purchase on the right card.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">Personalized credit-card recommendations based on your cards, rewards, and spending.</p><div className="mt-10 flex flex-wrap gap-4"><Link className="rounded-full bg-zinc-950 px-6 py-3 font-medium text-white" href={user ? "/dashboard" : "/login"}>{user ? "Open optimizer" : "Sign in to get started"}</Link>{user && <form action="/logout" method="post"><button className="rounded-full border border-zinc-300 px-6 py-3 font-medium text-zinc-800" type="submit">Log out</button></form>}</div></section></main>;
}
