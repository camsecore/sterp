"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
      <>
        <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
        <div className="signup-body">
          <div className="center-content">
            <div className="auth-card" style={{ textAlign: "center" }}>
              <h1>Check your email</h1>
              <p className="subtitle">
                We sent a link to <strong>{email}</strong>. Click it to get started.
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(""); }}
                className="alt-action"
                style={{ textDecoration: "underline", color: "#1A1D21" }}
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      {/* Center content */}
      <div className="signup-body">
        {/* Floating page previews — desktop only */}
        <div className="preview-frame preview-right">
          <div className="ph-header">
            <div className="ph-avatar a1" />
            <div className="ph-name">Cam Scofield</div>
            <div className="ph-url">sterp.com/cam</div>
          </div>
          <div className="ph-tabs">
            <div className="ph-tab active">Top 4</div>
            <div className="ph-tab">Desk</div>
            <div className="ph-tab">Supps</div>
          </div>
          <div className="ph-grid">
            <div className="ph-card"><div className="ph-card-img c1" /><div className="ph-card-body"><div className="ph-card-title">Herman Miller Aeron</div><div className="ph-card-desc">Best office purchase I&apos;ve made.</div></div></div>
            <div className="ph-card"><div className="ph-card-img c2" /><div className="ph-card-body"><div className="ph-card-title">LG 27&quot; 4K Monitor</div><div className="ph-card-desc">Solid for the price.</div></div></div>
            <div className="ph-card"><div className="ph-card-img c3" /><div className="ph-card-body"><div className="ph-card-title">Hatch Restore 2</div><div className="ph-card-desc">Sunrise alarm is legit.</div></div></div>
            <div className="ph-card"><div className="ph-card-img c4" /><div className="ph-card-body"><div className="ph-card-title">Oura Ring Gen 3</div><div className="ph-card-desc">Best sleep tracker I&apos;ve tried.</div></div></div>
          </div>
        </div>

        <div className="preview-frame preview-left">
          <div className="ph-header">
            <div className="ph-avatar a2" />
            <div className="ph-name">Alex Rivera</div>
            <div className="ph-url">sterp.com/alex</div>
          </div>
          <div className="ph-tabs">
            <div className="ph-tab active">Top 3</div>
            <div className="ph-tab">Kitchen</div>
            <div className="ph-tab">Fitness</div>
          </div>
          <div className="ph-grid">
            <div className="ph-card"><div className="ph-card-img c3" /><div className="ph-card-body"><div className="ph-card-title">Weber Kettle 22&quot;</div><div className="ph-card-desc">Everything you need, nothing you don&apos;t.</div></div></div>
            <div className="ph-card"><div className="ph-card-img c1" /><div className="ph-card-body"><div className="ph-card-title">Baratza Encore</div><div className="ph-card-desc">Entry-level grinder that punches up.</div></div></div>
            <div className="ph-card"><div className="ph-card-img c4" /><div className="ph-card-body"><div className="ph-card-title">Rogue Echo Bike</div><div className="ph-card-desc">Humbling. Best cardio investment.</div></div></div>
            <div className="ph-card"><div className="ph-card-img c2" /><div className="ph-card-body"><div className="ph-card-title">AeroPress</div><div className="ph-card-desc">Unbeatable for the price.</div></div></div>
          </div>
        </div>

        <div className="center-content">
          <Image
            src="/logo-black.png"
            alt="Sterp"
            width={120}
            height={40}
            style={{ height: 32, width: "auto" }}
            priority
          />

          <div className="auth-card">
            <h1>Create your Sterp</h1>
            <p className="subtitle">Your products. Your photos. Your honest take. One page.</p>

            <button type="button" onClick={handleGoogleSignup} className="google-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="divider">or</div>

            {error && <p className="error-msg">{error}</p>}

            {mode === "magic" ? (
              <>
                <form onSubmit={handleMagicLink} style={{ width: "100%" }}>
                  <div className="field-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Sending link..." : "Send magic link"}
                  </button>
                </form>
                <button type="button" onClick={() => setMode("password")} className="alt-action">
                  Use password instead
                </button>
              </>
            ) : (
              <>
                <form onSubmit={handlePasswordSignup} style={{ width: "100%" }}>
                  <div className="field-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
                  </div>
                  <div className="field-group">
                    <label htmlFor="password">Password (min 6 characters)</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Creating account..." : "Sign up"}
                  </button>
                </form>
                <button type="button" onClick={() => setMode("magic")} className="alt-action">
                  Use magic link instead
                </button>
              </>
            )}
          </div>

          <p className="switch-mode">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>

        {/* Mobile card strip */}
        <div className="mobile-preview">
          <span className="preview-label">See what a Sterp page looks like</span>
          <div className="preview-cards">
            <div className="mini-card">
              <div className="mini-card-placeholder mc1">
                <svg fill="none" viewBox="0 0 24 24" stroke="#8B7355" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div className="mini-card-body">
                <div className="mini-card-name">Herman Miller Aeron</div>
                <div className="mini-card-liner">Best purchase I&apos;ve made for my home office. 10 years in.</div>
              </div>
            </div>
            <div className="mini-card">
              <div className="mini-card-placeholder mc2">
                <svg fill="none" viewBox="0 0 24 24" stroke="#556B8B" strokeWidth="1.5"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="mini-card-body">
                <div className="mini-card-name">LG 27&quot; 4K Monitor</div>
                <div className="mini-card-liner">Solid for the price. Colors are accurate enough for me.</div>
              </div>
            </div>
            <div className="mini-card mini-card-third">
              <div className="mini-card-placeholder mc3">
                <svg fill="none" viewBox="0 0 24 24" stroke="#5B8B55" strokeWidth="1.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
              </div>
              <div className="mini-card-body">
                <div className="mini-card-name">Hatch Restore 2</div>
                <div className="mini-card-liner">My wife loves it. Sunrise alarm is legit though.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html { overflow-x: hidden; }

  .signup-body {
    font-family: 'DM Sans', sans-serif;
    background: #EEF2F7;
    color: #1A1D21;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  /* ===== FLOATING PAGE PREVIEWS (desktop only) ===== */
  .preview-frame {
    position: fixed;
    width: 290px;
    height: 600px;
    background: #FFFFFF;
    border: 1px solid #DDE3EB;
    border-radius: 32px;
    padding: 16px 12px;
    overflow: hidden;
    pointer-events: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
    font-family: 'DM Sans', sans-serif;
  }

  .preview-right {
    right: -30px;
    top: 50%;
    transform: translateY(-50%) rotate(-4deg);
    opacity: 0.42;
  }

  .preview-left {
    left: -50px;
    top: 50%;
    transform: translateY(-45%) rotate(6deg);
    opacity: 0.28;
  }

  /* Phone internals */
  .ph-header { text-align: center; margin-bottom: 12px; padding-top: 8px; }
  .ph-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    margin: 0 auto 6px;
  }
  .ph-avatar.a1 { background: linear-gradient(135deg, #C9B8A8, #A89888); }
  .ph-avatar.a2 { background: linear-gradient(135deg, #A8B8C9, #8898A8); }
  .ph-name { font-size: 12px; font-weight: 600; }
  .ph-url { font-size: 9px; color: #9CA3AF; }

  .ph-tabs { display: flex; gap: 4px; margin-bottom: 10px; padding: 0 2px; }
  .ph-tab {
    padding: 4px 10px; border-radius: 14px;
    font-size: 9px; font-weight: 500; color: #6B7280;
  }
  .ph-tab.active { background: #E8D5D0; color: #8B4840; }

  .ph-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6px; padding: 0 2px;
  }
  .ph-card { background: #EEF2F7; border-radius: 8px; overflow: hidden; }
  .ph-card-img { width: 100%; aspect-ratio: 4/3; }
  .ph-card-img.c1 { background: linear-gradient(135deg, #E2D8CE, #CFC0B0); }
  .ph-card-img.c2 { background: linear-gradient(135deg, #D0D8E2, #B0C0CF); }
  .ph-card-img.c3 { background: linear-gradient(135deg, #D8E2D0, #C0CFB0); }
  .ph-card-img.c4 { background: linear-gradient(135deg, #E2D0D8, #CFB0C0); }
  .ph-card-body { padding: 5px 6px 6px; }
  .ph-card-title { font-size: 8px; font-weight: 600; margin-bottom: 2px; }
  .ph-card-desc { font-size: 7px; color: #6B7280; line-height: 1.3; }

  /* Hide previews on small screens */
  @media (max-width: 640px) {
    .preview-frame { display: none; }
  }
  @media (max-width: 900px) and (min-width: 641px) {
    .preview-frame {
      width: 220px;
      height: 460px;
      border-radius: 24px;
      padding: 12px 10px;
    }
    .preview-right { right: -80px; }
    .preview-left { left: -90px; }
  }
  @media (max-width: 1100px) and (min-width: 901px) {
    .preview-right { right: -60px; }
    .preview-left { left: -70px; }
  }

  /* ===== CENTER CONTENT ===== */
  .center-content {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    animation: fadeUp 0.5s ease-out;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .auth-card {
    width: 100%;
    background: #FFFFFF;
    border: 1px solid #DDE3EB;
    border-radius: 18px;
    padding: 40px 36px 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8px 40px rgba(0,0,0,0.05);
  }

  .auth-card h1 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.4px;
    margin-bottom: 6px;
  }

  .auth-card .subtitle {
    font-size: 14.5px;
    color: #6B7280;
    margin-bottom: 30px;
    text-align: center;
    line-height: 1.5;
  }

  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    border: 1px solid #DDE3EB;
    border-radius: 10px;
    background: #FFFFFF;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #1A1D21;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .google-btn:hover { border-color: #B0B8C4; background: #F8FAFC; }

  .divider {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 22px 0;
    color: #9CA3AF;
    font-size: 13px;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #DDE3EB;
  }

  .error-msg {
    width: 100%;
    font-size: 14px;
    color: #DC2626;
    background: #FEF2F2;
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .field-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .field-group label {
    font-size: 14px;
    font-weight: 500;
    color: #6B7280;
  }
  .field-group input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #DDE3EB;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s;
    color: #1A1D21;
  }
  .field-group input:focus { border-color: #D4594F; }

  .submit-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: #D4594F;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .submit-btn:hover { background: #C04840; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .alt-action {
    font-size: 13px;
    color: #9CA3AF;
    margin-top: 14px;
    cursor: pointer;
    transition: color 0.15s;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
  }
  .alt-action:hover { color: #6B7280; }

  .switch-mode {
    font-size: 14px;
    color: #6B7280;
    margin-top: -12px;
  }
  .switch-mode a {
    color: #1A1D21;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* ===== MOBILE CARD STRIP ===== */
  .mobile-preview {
    display: none;
    width: 100%;
    max-width: 420px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    margin-top: 28px;
    animation: fadeUp 0.5s ease-out 0.15s both;
  }

  .preview-label {
    font-size: 15px;
    font-weight: 500;
    color: #1A1D21;
    letter-spacing: -0.2px;
  }

  .preview-cards {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .mini-card {
    flex: 1;
    min-width: 0;
    background: #FFFFFF;
    border: 1px solid #DDE3EB;
    border-radius: 10px;
    overflow: hidden;
    opacity: 0.6;
  }

  .mini-card-placeholder {
    width: 100%;
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mini-card-placeholder svg { width: 20px; height: 20px; opacity: 0.3; }
  .mini-card-placeholder.mc1 { background: linear-gradient(135deg, #E8DDD4, #D4C4B0); }
  .mini-card-placeholder.mc2 { background: linear-gradient(135deg, #D4DDE8, #B0C4D4); }
  .mini-card-placeholder.mc3 { background: linear-gradient(135deg, #DDE8D4, #C4D4B0); }

  .mini-card-body { padding: 8px 10px 10px; }
  .mini-card-name {
    font-size: 11px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .mini-card-liner {
    font-size: 10px; color: #6B7280; line-height: 1.35;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }

  @media (max-width: 640px) {
    .mobile-preview { display: flex; }
  }

  @media (max-width: 420px) {
    .mini-card-third { display: none; }
    .auth-card { padding: 32px 24px 28px; }
  }
`;
