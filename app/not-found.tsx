import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#EEF2F7] px-4 text-center">
      <h1
        className="text-[48px] font-bold text-neutral-900 leading-tight"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        404
      </h1>
      <p className="mt-2 text-[17px] text-neutral-500 max-w-sm">
        This page doesn&apos;t exist yet. Maybe it&apos;s a typo, or maybe this person hasn&apos;t gone live.
      </p>
      <Link
        href="/signup"
        className="mt-6 inline-block text-[15px] font-medium text-white px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "#C0392B" }}
      >
        Create your Sterp
      </Link>
      <Link
        href="/featured"
        className="mt-3 text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        See featured Sterps →
      </Link>
      <Link
        href="/"
        className="mt-2 text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
