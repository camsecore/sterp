"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"magic" | "password">("magic");

  async function handleGoogleSignup() {
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/auth/callback`,
      },
    });

    if (error) setError(error.message);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  }

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    if (data.user?.identities?.length === 0) {
      setError("An account with this email already exists.");
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)]">
            Check your email
          </h1>
          <p className="text-sm text-neutral-600">
            We sent a link to <strong>{email}</strong>. Click it to get started.
          </p>
          <button
            onClick={() => { setMagicLinkSent(false); setEmail(""); }}
            className="text-sm text-neutral-900 underline"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7] flex flex-col items-center justify-center px-6">
      {/* ── Floating phone frames (desktop only) ── */}
      <PhoneFrame
        side="right"
        name="Cam Scofield"
        url="sterp.com/cam"
        avatarClass="bg-gradient-to-br from-[#C9B8A8] to-[#A89888]"
        tabs={["Top 4", "Desk", "Supps"]}
        products={[
          { name: "Herman Miller Aeron", desc: "Best office purchase I've made.", color: "from-[#E2D8CE] to-[#CFC0B0]" },
          { name: 'LG 27" 4K Monitor', desc: "Solid for the price.", color: "from-[#D0D8E2] to-[#B0C0CF]" },
          { name: "Hatch Restore 2", desc: "Sunrise alarm is legit.", color: "from-[#D8E2D0] to-[#C0CFB0]" },
          { name: "Oura Ring Gen 3", desc: "Best sleep tracker I've tried.", color: "from-[#E2D0D8] to-[#CFB0C0]" },
        ]}
      />
      <PhoneFrame
        side="left"
        name="Alex Rivera"
        url="sterp.com/alex"
        avatarClass="bg-gradient-to-br from-[#A8B8C9] to-[#8898A8]"
        tabs={["Top 3", "Kitchen", "Fitness"]}
        products={[
          { name: 'Weber Kettle 22"', desc: "Everything you need, nothing you don't.", color: "from-[#D8E2D0] to-[#C0CFB0]" },
          { name: "Baratza Encore", desc: "Entry-level grinder that punches up.", color: "from-[#E2D8CE] to-[#CFC0B0]" },
          { name: "Rogue Echo Bike", desc: "Humbling. Best cardio investment.", color: "from-[#E2D0D8] to-[#CFB0C0]" },
          { name: "AeroPress", desc: "Unbeatable for the price.", color: "from-[#D0D8E2] to-[#B0C0CF]" },
        ]}
      />

      {/* ── Center content ── */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-8 animate-[fadeUp_0.5s_ease-out]">
        {/* Logo */}
        <Image
          src="/logo-black.png"
          alt="Sterp"
          width={120}
          height={40}
          className="h-8 w-auto"
          priority
        />

        {/* Auth card */}
        <div className="w-full bg-white border border-[#DDE3EB] rounded-[18px] px-9 py-10 flex flex-col items-center shadow-[0_8px_40px_rgba(0,0,0,0.05)] max-[420px]:px-6 max-[420px]:py-8">
          <h1 className="text-[26px] font-semibold tracking-tight text-[#1A1D21] mb-1.5">
            Create your Sterp
          </h1>
          <p className="text-[14.5px] text-[#6B7280] mb-7 text-center leading-relaxed">
            Your products. Your photos. Your honest take. One page.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2.5 py-3 border border-[#DDE3EB] rounded-[10px] text-[15px] font-medium text-[#1A1D21] bg-white hover:border-[#B0B8C4] hover:bg-[#F8FAFC] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3.5 my-5">
            <div className="flex-1 h-px bg-[#DDE3EB]" />
            <span className="text-[13px] text-[#9CA3AF]">or</span>
            <div className="flex-1 h-px bg-[#DDE3EB]" />
          </div>

          {error && (
            <p className="w-full text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          {mode === "magic" ? (
            <>
              <form onSubmit={handleMagicLink} className="w-full space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[14px] font-medium text-[#6B7280]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="w-full px-3.5 py-2.5 border border-[#DDE3EB] rounded-[10px] text-[15px] text-[#1A1D21] outline-none focus:border-[#D4594F] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-[15px] font-medium text-white bg-[#D4594F] rounded-[10px] hover:bg-[#C04840] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Sending link..." : "Send magic link"}
                </button>
              </form>

              <button
                onClick={() => setMode("password")}
                className="mt-3.5 text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                Use password instead
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handlePasswordSignup} className="w-full space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[14px] font-medium text-[#6B7280]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="w-full px-3.5 py-2.5 border border-[#DDE3EB] rounded-[10px] text-[15px] text-[#1A1D21] outline-none focus:border-[#D4594F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-[14px] font-medium text-[#6B7280]">
                    Password (min 6 characters)
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 border border-[#DDE3EB] rounded-[10px] text-[15px] text-[#1A1D21] outline-none focus:border-[#D4594F] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-[15px] font-medium text-white bg-[#D4594F] rounded-[10px] hover:bg-[#C04840] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>

              <button
                onClick={() => setMode("magic")}
                className="mt-3.5 text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                Use magic link instead
              </button>
            </>
          )}
        </div>

        <p className="text-[14px] text-[#6B7280] -mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1A1D21] font-medium underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>

      {/* ── Mobile preview strip (phones hidden on mobile) ── */}
      <div className="hidden max-[640px]:flex w-full max-w-[420px] flex-col items-start gap-3.5 mt-7 animate-[fadeUp_0.5s_ease-out_0.15s_both]">
        <span className="text-[15px] font-medium text-[#1A1D21] tracking-tight">
          See what a Sterp page looks like
        </span>
        <div className="flex gap-2.5 w-full">
          <MiniCard
            name="Herman Miller Aeron"
            liner="Best purchase I've made for my home office. 10 years in."
            color="from-[#E8DDD4] to-[#D4C4B0]"
            iconStroke="#8B7355"
            iconPath="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
          <MiniCard
            name='LG 27" 4K Monitor'
            liner="Solid for the price. Colors are accurate enough for me."
            color="from-[#D4DDE8] to-[#B0C4D4]"
            iconStroke="#556B8B"
            iconPath="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
          <MiniCard
            name="Hatch Restore 2"
            liner="My wife loves it. I think it's fine. Sunrise alarm is legit though."
            color="from-[#DDE8D4] to-[#C4D4B0]"
            iconStroke="#5B8B55"
            iconPath="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            hideOnSmall
          />
        </div>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        html { overflow-x: hidden; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatRight {
          from { opacity: 0; transform: translateY(-50%) rotate(-4deg) translateX(40px); }
          to { opacity: 0.7; transform: translateY(-50%) rotate(-4deg) translateX(0); }
        }
        @keyframes floatLeft {
          from { opacity: 0; transform: translateY(-45%) rotate(6deg) translateX(-40px); }
          to { opacity: 0.55; transform: translateY(-45%) rotate(6deg) translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Phone Frame Component ── */

function PhoneFrame({
  side,
  name,
  url,
  avatarClass,
  tabs,
  products,
}: {
  side: "left" | "right";
  name: string;
  url: string;
  avatarClass: string;
  tabs: string[];
  products: { name: string; desc: string; color: string }[];
}) {
  const positionClass =
    side === "right"
      ? "right-[-30px] top-1/2 -translate-y-1/2 -rotate-[4deg] animate-[floatRight_0.8s_ease-out_0.3s_forwards] max-[1100px]:right-[-60px] max-[900px]:right-[-80px] max-[900px]:w-[220px] max-[900px]:h-[460px] max-[900px]:rounded-3xl max-[900px]:p-3"
      : "left-[-50px] top-1/2 -translate-y-[45%] rotate-[6deg] animate-[floatLeft_0.8s_ease-out_0.5s_forwards] max-[1100px]:left-[-70px] max-[900px]:left-[-90px] max-[900px]:w-[220px] max-[900px]:h-[460px] max-[900px]:rounded-3xl max-[900px]:p-3";

  return (
    <div
      className={`fixed w-[290px] h-[600px] bg-white border border-[#DDE3EB] rounded-[32px] p-4 overflow-hidden pointer-events-none shadow-[0_20px_60px_rgba(0,0,0,0.06)] opacity-0 hidden min-[641px]:block ${positionClass}`}
    >
      {/* Header */}
      <div className="text-center mb-3 pt-2">
        <div className={`w-9 h-9 rounded-full mx-auto mb-1.5 ${avatarClass}`} />
        <div className="text-[12px] font-semibold">{name}</div>
        <div className="text-[9px] text-[#9CA3AF]">{url}</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2.5 px-0.5">
        {tabs.map((tab, i) => (
          <div
            key={tab}
            className={`px-2.5 py-1 rounded-full text-[9px] font-medium ${
              i === 0 ? "bg-[#E8D5D0] text-[#8B4840]" : "text-[#6B7280]"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-1.5 px-0.5">
        {products.map((p) => (
          <div key={p.name} className="bg-[#EEF2F7] rounded-lg overflow-hidden">
            <div className={`w-full aspect-[4/3] bg-gradient-to-br ${p.color}`} />
            <div className="p-1.5">
              <div className="text-[8px] font-semibold mb-0.5">{p.name}</div>
              <div className="text-[7px] text-[#6B7280] leading-snug">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mini Card Component (mobile preview) ── */

function MiniCard({
  name,
  liner,
  color,
  iconStroke,
  iconPath,
  hideOnSmall = false,
}: {
  name: string;
  liner: string;
  color: string;
  iconStroke: string;
  iconPath: string;
  hideOnSmall?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-0 bg-white border border-[#DDE3EB] rounded-[10px] overflow-hidden opacity-60 hover:opacity-80 transition-opacity ${
        hideOnSmall ? "max-[420px]:hidden" : ""
      }`}
    >
      <div className={`w-full aspect-[4/3] bg-gradient-to-br ${color} flex items-center justify-center`}>
        <svg fill="none" viewBox="0 0 24 24" stroke={iconStroke} strokeWidth="1.5" className="w-5 h-5 opacity-30">
          <path d={iconPath} />
        </svg>
      </div>
      <div className="px-2.5 py-2">
        <div className="text-[11px] font-medium truncate mb-0.5">{name}</div>
        <div className="text-[10px] text-[#6B7280] leading-snug line-clamp-2">{liner}</div>
      </div>
    </div>
  );
}
