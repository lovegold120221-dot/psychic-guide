"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const HERO_IMG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80";
// To use your own image: drop hero.png into public/images/ and change to "/images/hero.png"
const FEAT_IMG_1 = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80";
const FEAT_IMG_2 = "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80";
const FEAT_IMG_3 = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80";

export default function LandingClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (loading || !mounted) return null;
  if (user) { router.replace("/dashboard"); return null; }

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain bg-[#f5f5f7] dark:bg-black text-black dark:text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Orbit Logo" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-sm tracking-tight text-white">Orbit</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-xs font-medium text-zinc-300 hover:text-white transition">Sign In</Link>
            <Link href="/auth/signup" className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition active:scale-95 shadow-lg shadow-blue-500/20">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            Video meetings.<br/><span className="text-blue-500">Reimagined.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-light">
            Crystal-clear video, real-time chat, and enterprise-grade security<br className="hidden sm:block" />
            — all in a beautifully simple interface.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-3.5 rounded-full transition-all active:scale-[0.97] shadow-lg shadow-blue-600/30"
            >
              Try Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium text-base px-8 py-3.5 rounded-full border border-white/20 hover:border-white/40 transition active:scale-[0.97]"
            >
              Create Account
            </Link>
          </div>
          <p className="mt-6 text-xs text-zinc-500">No credit card required · Free for up to 100 participants</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need.</h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">Professional video conferencing, built for teams of every size.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { img: FEAT_IMG_1, title: "Real-time Chat", desc: "Built-in messaging powered by Stream. Send global messages or DM participants directly." },
            { img: FEAT_IMG_2, title: "Screen Sharing", desc: "Share your screen with audio. Present documents, code, or designs in crystal clarity." },
            { img: FEAT_IMG_3, title: "Virtual Backgrounds", desc: "Blur your background, use custom images, or apply Studio Touch beautification." },
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="overflow-hidden rounded-2xl mb-5 bg-zinc-100 dark:bg-zinc-900">
                <img src={f.img} alt={f.title} className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition duration-700" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-black text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Start meeting in seconds.</h2>
          <p className="mt-4 text-base text-zinc-400 max-w-md mx-auto">No downloads, no setup. Just click and join.</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-3.5 rounded-full transition active:scale-[0.97]">Get Started Free</Link>
            <Link href="/auth/login" className="text-zinc-300 hover:text-white font-medium text-base px-8 py-3.5 rounded-full border border-zinc-700 hover:border-zinc-500 transition">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/[0.04] dark:border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>Orbit Meeting — built by Eburon AI</span>
          <span>Powered by Stream &amp; Supabase</span>
        </div>
      </footer>
    </div>
  );
}
