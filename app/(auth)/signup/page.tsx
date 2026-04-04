"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import styles from "./signup.module.css";

export default function SignupPage() {
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
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/auth/callback?next=/onboarding/username`,
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
      body: JSON.stringify({ email, next: "/onboarding/username" }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
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
    if (!res.ok) { setError(data.error); setLoading(false); return; }
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
      <div className={styles.signupBody}>
        <div className={styles.centerContent}>
          <div className={styles.authCard} style={{ textAlign: "center" }}>
            <h1>Check your email</h1>
            <p className={styles.subtitle}>
              We sent a link to <strong>{email}</strong>. Click it to get started.
            </p>
            <button
              onClick={() => { setMagicLinkSent(false); setEmail(""); }}
              className={styles.altAction}
              style={{ textDecoration: "underline", color: "#1A1D21" }}
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.signupBody}>
      {/* Floating page previews — desktop only */}
      <div className={`${styles.previewFrame} ${styles.previewRight}`}>
        <div className={styles.phHeader}>
          <div className={`${styles.phAvatar} ${styles.phAvatarA1}`} />
          <div className={styles.phName}>Cam Scofield</div>
          <div className={styles.phUrl}>sterp.com/cam</div>
        </div>
        <div className={styles.phTabs}>
          <div className={`${styles.phTab} ${styles.phTabActive}`}>Top 4</div>
          <div className={styles.phTab}>Desk</div>
          <div className={styles.phTab}>Supps</div>
        </div>
        <div className={styles.phGrid}>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC1}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>Herman Miller Aeron</div><div className={styles.phCardDesc}>Best office purchase I&apos;ve made.</div></div></div>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC2}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>LG 27&quot; 4K Monitor</div><div className={styles.phCardDesc}>Solid for the price.</div></div></div>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC3}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>Hatch Restore 2</div><div className={styles.phCardDesc}>Sunrise alarm is legit.</div></div></div>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC4}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>Oura Ring Gen 3</div><div className={styles.phCardDesc}>Best sleep tracker I&apos;ve tried.</div></div></div>
        </div>
      </div>

      <div className={`${styles.previewFrame} ${styles.previewLeft}`}>
        <div className={styles.phHeader}>
          <div className={`${styles.phAvatar} ${styles.phAvatarA2}`} />
          <div className={styles.phName}>Alex Rivera</div>
          <div className={styles.phUrl}>sterp.com/alex</div>
        </div>
        <div className={styles.phTabs}>
          <div className={`${styles.phTab} ${styles.phTabActive}`}>Top 3</div>
          <div className={styles.phTab}>Kitchen</div>
          <div className={styles.phTab}>Fitness</div>
        </div>
        <div className={styles.phGrid}>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC3}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>Weber Kettle 22&quot;</div><div className={styles.phCardDesc}>Everything you need, nothing you don&apos;t.</div></div></div>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC1}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>Baratza Encore</div><div className={styles.phCardDesc}>Entry-level grinder that punches up.</div></div></div>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC4}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>Rogue Echo Bike</div><div className={styles.phCardDesc}>Humbling. Best cardio investment.</div></div></div>
          <div className={styles.phCard}><div className={`${styles.phCardImg} ${styles.phCardImgC2}`} /><div className={styles.phCardBody}><div className={styles.phCardTitle}>AeroPress</div><div className={styles.phCardDesc}>Unbeatable for the price.</div></div></div>
        </div>
      </div>

      <div className={styles.centerContent}>
        <Image
          src="/logo-charcoal.png"
          alt="Sterp"
          width={120}
          height={40}
          style={{ height: 32, width: "auto" }}
          priority
        />

        <div className={styles.authCard}>
          <h1>Create your Sterp</h1>
          <p className={styles.subtitle}>Your products. Your photos. Your honest take. One page.</p>

          <button type="button" onClick={handleGoogleSignup} className={styles.googleBtn}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className={styles.divider}>or</div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          {mode === "magic" ? (
            <>
              <form onSubmit={handleMagicLink} style={{ width: "100%" }}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Sending link..." : "Send magic link"}
                </button>
              </form>
              <button type="button" onClick={() => setMode("password")} className={styles.altAction}>
                Use password instead
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handlePasswordSignup} style={{ width: "100%" }}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="password">Password (min 8 characters)</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>
              <button type="button" onClick={() => setMode("magic")} className={styles.altAction}>
                Use magic link instead
              </button>
            </>
          )}
        </div>

        <p className={styles.switchMode}>
          Already have an account?{" "}
          <Link href="/login">Log in</Link>
        </p>
      </div>

      {/* Mobile card strip */}
      <div className={styles.mobilePreview}>
        <span className={styles.previewLabel}>See what a Sterp page looks like</span>
        <div className={styles.previewCards}>
          <div className={styles.miniCard}>
            <div className={`${styles.miniCardPlaceholder} ${styles.miniCardPlaceholderMc1}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="#8B7355" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div className={styles.miniCardBody}>
              <div className={styles.miniCardName}>Herman Miller Aeron</div>
              <div className={styles.miniCardLiner}>Best purchase I&apos;ve made for my home office. 10 years in.</div>
            </div>
          </div>
          <div className={styles.miniCard}>
            <div className={`${styles.miniCardPlaceholder} ${styles.miniCardPlaceholderMc2}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="#556B8B" strokeWidth="1.5"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className={styles.miniCardBody}>
              <div className={styles.miniCardName}>LG 27&quot; 4K Monitor</div>
              <div className={styles.miniCardLiner}>Solid for the price. Colors are accurate enough for me.</div>
            </div>
          </div>
          <div className={`${styles.miniCard} ${styles.miniCardThird}`}>
            <div className={`${styles.miniCardPlaceholder} ${styles.miniCardPlaceholderMc3}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="#5B8B55" strokeWidth="1.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
            </div>
            <div className={styles.miniCardBody}>
              <div className={styles.miniCardName}>Hatch Restore 2</div>
              <div className={styles.miniCardLiner}>My wife loves it. Sunrise alarm is legit though.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
