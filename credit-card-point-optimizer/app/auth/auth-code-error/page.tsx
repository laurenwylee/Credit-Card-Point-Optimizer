import { SiteHeader } from "@/components/SiteHeader";

export default function AuthCodeErrorPage() { return <div className="min-h-screen bg-white"><SiteHeader /><main className="flex items-center justify-center px-6 py-24"><section className="text-center"><h1 className="text-2xl font-bold tracking-[-0.01em] text-[#0A0B0D]">Sign-in link expired</h1><p className="mt-3 text-[#5B616E]">Please try signing in again.</p><a className="mt-6 inline-block rounded-full bg-[#0052FF] px-5 py-3 text-white" href="/login">Back to sign in</a></section></main></div>; }
