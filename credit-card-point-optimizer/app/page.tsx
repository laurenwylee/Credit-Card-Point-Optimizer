import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  return <div className="min-h-screen bg-white"><SiteHeader /><main className="mx-auto flex max-w-6xl flex-col items-start px-6 py-24 sm:py-32"><h1 className="max-w-2xl text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0A0B0D] sm:text-6xl">Put every purchase on the right card.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#5B616E]">Personalized credit-card recommendations based on your cards, rewards, and spending.</p><div className="mt-10 flex flex-wrap gap-4"><Link className="rounded-full bg-[#16A34A] px-6 py-3 font-medium text-white" href={user ? "/dashboard" : "/login"}>{user ? "Open optimizer" : "Sign in to get started"}</Link>{user && <form action="/logout" method="post"><button className="rounded-full border border-[#D0D5DD] px-6 py-3 font-medium text-[#0A0B0D]" type="submit">Log out</button></form>}</div></main></div>;
}
