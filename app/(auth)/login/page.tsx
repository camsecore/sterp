"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Login failed — please try again.");
    }
  }, [searchParams]);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"magic" | "password">("magic");

  async function handleGoogleLogin() {
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

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
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

    setLoading(false);
    window.location.href = "/dashboard";
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)]">
            Check your email
          </h1>
          <p className="text-sm text-neutral-600">
            We sent a login link to <strong>{email}</strong>.
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 [font-family:var(--font-space-grotesk)]">
            Log in to Sterp
          </h1>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-2 border border-neutral-300 rounded text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            {error}
          </p>
        )}

        {mode === "magic" ? (
          <>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-neutral-600 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-sm font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending link..." : "Send magic link"}
              </button>
            </form>

            <button
              onClick={() => setMode("password")}
              className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Use password instead
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-neutral-600 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-neutral-600 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-sm font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <button
              onClick={() => setMode("magic")}
              className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Use magic link instead
            </button>
          </>
        )}

        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-neutral-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
