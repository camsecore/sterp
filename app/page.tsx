import Link from "next/link";
import { Camera, MessageCircle, Share2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#C0392B] text-white relative overflow-hidden">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.22]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 w-full max-w-5xl mx-auto px-5 py-5 flex items-center justify-between">
        <span
          className="text-[30px] font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          sterp
        </span>
        <div className="flex items-center gap-5 text-[15px]">
          <Link href="/login" className="text-white/80 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-[#C0392B] font-medium px-4 py-1.5 rounded-md hover:bg-white/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex items-center w-full max-w-5xl mx-auto px-5 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Left — copy */}
          <div className="flex-1 max-w-xl">
            <h1
              className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              You're the friend everyone texts before they buy anything.
            </h1>
            <p className="mt-4 text-[18px] sm:text-[20px] text-white/75 leading-relaxed">
              Your products. Your photos. Your honest take. One page.
            </p>
            <Link
              href="/signup"
              className="inline-block mt-6 w-full sm:w-auto text-center bg-white text-[#C0392B] text-[17px] font-semibold tracking-tight px-9 py-4 rounded-xl shadow-lg hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Create Your Page
            </Link>
          </div>

          {/* Right — phone mockup */}
          <div className="flex-1 flex justify-center mt-10 lg:mt-0">
            <div className="relative w-[295px] sm:w-[315px]">
              {/* Phone frame */}
              <div
                className="rounded-[50px] bg-[#1a1a1a] p-[10px] shadow-2xl"
                style={{
                  transform: "perspective(1200px) rotateY(-8deg) rotateX(2deg)",
                }}
              >
                {/* Screen */}
                <div className="rounded-[42px] overflow-hidden bg-[#F0F4F8] relative">
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[72px] h-[22px] bg-[#1a1a1a] rounded-full z-20" />
                  <img
                    src="/cam-phone-real.png"
                    alt="Sterp profile page"
                    className="w-full block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ── Value props ── */}
      <section className="relative z-10 w-full py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-12 sm:gap-0">
            <div className="flex-1 flex flex-col items-start text-left px-4">
              <Camera size={24} className="text-white/90 mb-4" strokeWidth={1.5} />
              <p className="text-[18px] sm:text-[20px] text-white font-semibold leading-snug mb-1">Real photos, not stock images.</p>
              <p className="text-[18px] sm:text-[20px] text-white/80 font-normal leading-snug">Your stuff in your life.</p>
            </div>

            <div className="flex-1 flex flex-col items-start text-left px-4">
              <MessageCircle size={24} className="text-white/90 mb-4" strokeWidth={1.5} />
              <p className="text-[18px] sm:text-[20px] text-white font-semibold leading-snug mb-1">Honest takes, not sponsored reviews.</p>
              <p className="text-[18px] sm:text-[20px] text-white/80 font-normal leading-snug">Say what you'd say to a friend.</p>
            </div>

            <div className="flex-1 flex flex-col items-start text-left px-4">
              <Share2 size={24} className="text-white/90 mb-4" strokeWidth={1.5} />
              <p className="text-[18px] sm:text-[20px] text-white font-semibold leading-snug mb-1">Drop it in your bio, text it to a friend.</p>
              <p className="text-[18px] sm:text-[20px] text-white/80 font-normal leading-snug">Your page works everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-5 py-6 text-[13px] text-white/40">
        <span>&copy; Sterp 2026 &middot; Terms &middot; Privacy</span>
      </footer>
    </div>
  );
}
