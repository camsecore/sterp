"use client";

import Image from "next/image";
import type { Profile, Product } from "../lib/types";

interface DashboardHeaderProps {
  profile: Profile | null;
  currentProducts: Product[];
  copied: boolean;
  onEditProfile: () => void;
  onCopyLink: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  profile,
  currentProducts,
  copied,
  onEditProfile,
  onCopyLink,
  onLogout,
}: DashboardHeaderProps) {
  const statusBadge = currentProducts.length >= 3 ? (
    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 flex-shrink-0">Live</span>
  ) : (
    <span className="text-[10px] font-medium text-white bg-[#555] rounded-full px-2 py-0.5 flex-shrink-0">Draft</span>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:pt-10 pb-4">
      {/* Desktop: single row */}
      <div className="hidden md:flex items-center justify-between">
        <div className="mt-1">
          <Image
            src="/logo-charcoal.png"
            alt="Sterp"
            width={150}
            height={50}
            className="h-[50px] w-auto"
          />
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name || profile.username}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xs">—</div>
              )}
            </div>
            <div className="min-w-0 max-w-[300px]">
              <span className="text-[14px] font-medium text-neutral-900 truncate block leading-none max-w-[300px]">
                {profile.name || profile.username}
              </span>
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] leading-none mt-1 block p-0 text-left ml-[1px] truncate max-w-[300px] transition-colors ${copied ? "text-emerald-600" : "text-neutral-400 hover:text-neutral-600 hover:underline"}`}
              >
                {copied ? "Copied!" : `sterp.com/${profile.username}`}
              </a>
            </div>
            {statusBadge}
            <button onClick={onEditProfile} className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors flex-shrink-0 cursor-pointer">Edit</button>
            <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors flex-shrink-0 cursor-pointer">View</a>
            <button onClick={onLogout} className="text-[13px] text-neutral-300 hover:text-neutral-500 transition-colors flex-shrink-0 cursor-pointer">Log out</button>
          </div>
        )}
      </div>

      {/* Mobile: logo centered + two-row profile */}
      <div className="md:hidden space-y-3">
        <div className="text-center">
          <Image
            src="/logo-charcoal.png"
            alt="Sterp"
            width={120}
            height={40}
            className="h-[40px] w-auto inline-block"
          />
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name || profile.username}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-neutral-400 text-[10px]">—</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-neutral-900 truncate leading-none">
                  {profile.name || profile.username}
                </span>
                {statusBadge}
              </div>
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] leading-none mt-1 block transition-colors ${copied ? "text-emerald-600" : "text-neutral-400 hover:text-neutral-600 hover:underline"}`}
              >
                {copied ? "Copied!" : `sterp.com/${profile.username}`}
              </a>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={onEditProfile} className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer">Edit</button>
              <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer">View</a>
              <button onClick={onLogout} className="text-[12px] text-neutral-300 hover:text-neutral-500 transition-colors cursor-pointer">Log out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
