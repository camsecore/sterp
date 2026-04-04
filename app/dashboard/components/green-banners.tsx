"use client";

import type { Product } from "../lib/types";

interface GreenBannersProps {
  username: string;
  currentProducts: Product[];
  productCount: number;
  phase: number;
  copied: boolean;
  nudgeDismissed: boolean | null;
  liveBannerDismissed: boolean | null;
  onCopyLink: () => void;
  onDismissLiveBanner: () => void;
  onDismissNudge: () => void;
  onCreateCollection: () => void;
}

export function GreenBanners({
  username,
  currentProducts,
  productCount,
  phase,
  copied,
  nudgeDismissed,
  liveBannerDismissed,
  onCopyLink,
  onDismissLiveBanner,
  onDismissNudge,
  onCreateCollection,
}: GreenBannersProps) {
  // Priority 1: Celebration card (page just went live, 3+ products, not dismissed)
  if (currentProducts.length >= 3 && liveBannerDismissed === false) {
    return (
      <div className="relative rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-5 mx-auto w-full sm:max-w-[600px] text-center animate-[celebrationIn_0.4s_ease-out]">
        <button
          onClick={onDismissLiveBanner}
          className="absolute top-3 right-3 text-neutral-300 hover:text-neutral-500 transition-colors text-[18px] leading-none p-1 cursor-pointer"
          aria-label="Dismiss"
        >
          ×
        </button>
        <a
          href={`/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[17px] font-medium text-neutral-900 hover:opacity-70 transition-opacity"
        >
          sterp.com/{username}
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h7v7" /><path d="M13 3L6 10" /></svg>
        </a>
        <p className="text-[13px] text-neutral-500 mt-1.5">
          Send your link to the group chat. Add it to your bio.
        </p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCopyLink}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-medium py-2 rounded-md transition-colors ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-[#1D9E75] text-white hover:opacity-90"
            }`}
          >
            {copied ? "Copied!" : (<>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V3.5a1.5 1.5 0 00-1.5-1.5H3.5A1.5 1.5 0 002 3.5V9a1.5 1.5 0 001.5 1.5h2" /></svg>
              Copy link
            </>)}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my Sterp — the stuff I actually own and use: sterp.com/${username}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-medium py-2 rounded-md bg-white border border-gray-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Share on
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
        </div>
        <a
          href="https://sterp.com/cam"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          See a fully built Sterp →
        </a>
      </div>
    );
  }

  // Priority 2: Phase-specific green banner messages
  if (phase === 1 && productCount >= 1 && productCount < 3) {
    return (
      <div className="relative rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-3">
        <p className="text-[14px] text-emerald-800">
          {productCount} down, {3 - productCount} to go to make your page live.
        </p>
      </div>
    );
  }

  if (phase === 2) {
    return (
      <div className="relative rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-3">
        <p className="text-[14px] text-emerald-800">
          Your Obsessions are set. Keep adding products — you&apos;ll be able to organize them into collections.
        </p>
      </div>
    );
  }

  if (phase === 3 && nudgeDismissed === false) {
    return (
      <div className="relative rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-4">
        <button
          onClick={onDismissNudge}
          className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-600 transition-colors text-[16px] leading-none cursor-pointer"
          aria-label="Dismiss"
        >
          ×
        </button>
        <p className="text-[14px] font-medium text-emerald-800 pr-6">
          You&apos;ve got {productCount} products — group similar ones into a collection.
        </p>
        <p className="text-[13px] text-emerald-700 mt-1">
          Try something like &ldquo;Home Office&rdquo; or &ldquo;Gym Setup.&rdquo;
        </p>
        <button
          onClick={onCreateCollection}
          className="mt-3 text-[13px] font-medium text-[#C0392B] hover:opacity-70 transition-opacity"
        >
          + Create Collection
        </button>
      </div>
    );
  }

  return null;
}
