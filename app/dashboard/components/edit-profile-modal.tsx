"use client";

import { useRef } from "react";
import Image from "next/image";
import { inputClass } from "../lib/utils";
import type { Profile } from "../lib/types";

interface EditProfileModalProps {
  profile: Profile;
  profileName: string;
  setProfileName: (v: string) => void;
  profileBio: string;
  setProfileBio: (v: string) => void;
  profileTwitter: string;
  setProfileTwitter: (v: string) => void;
  profileInstagram: string;
  setProfileInstagram: (v: string) => void;
  profileYoutube: string;
  setProfileYoutube: (v: string) => void;
  socialOrder: ("twitter" | "instagram" | "youtube")[];
  avatarUploading: boolean;
  avatarError: string | null;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  profileSaved: boolean;
  onAvatarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveField: (field: string, value: string) => void;
  onSaveAll: () => void;
  onClose: () => void;
}

export function EditProfileModal({
  profile,
  profileName,
  setProfileName,
  profileBio,
  setProfileBio,
  profileTwitter,
  setProfileTwitter,
  profileInstagram,
  setProfileInstagram,
  profileYoutube,
  setProfileYoutube,
  socialOrder,
  avatarUploading,
  avatarError,
  avatarInputRef,
  profileSaved,
  onAvatarFileSelect,
  onSaveField,
  onSaveAll,
  onClose,
}: EditProfileModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 bg-white w-full h-full sm:h-auto sm:max-w-lg sm:mx-auto sm:mt-20 sm:rounded-xl sm:max-h-[calc(100vh-10rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-[17px] font-semibold text-neutral-900">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 space-y-3">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative h-16 w-16 rounded-full overflow-hidden bg-neutral-200 group cursor-pointer"
            >
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name || profile.username}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">
                  Add
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[11px] font-medium">
                  {avatarUploading ? "..." : "Edit"}
                </span>
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={onAvatarFileSelect}
              className="hidden"
            />
            {avatarError && (
              <p className="text-[12px] text-[#C0392B]">{avatarError}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onBlur={() => onSaveField("name", profileName)}
              className={inputClass}
              placeholder="Your name"
            />
            <p className="text-[12px] text-neutral-400 mt-1">sterp.com/{profile.username}</p>
          </div>

          {/* Bio */}
          <div>
            <textarea
              value={profileBio}
              onChange={(e) => {
                if (e.target.value.length <= 160) {
                  setProfileBio(e.target.value);
                }
              }}
              onBlur={() => onSaveField("bio", profileBio)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="A short bio"
            />
            <p
              className={`text-[12px] mt-0.5 ${
                profileBio.length >= 140 ? "text-[#C0392B]" : "text-neutral-400"
              }`}
            >
              {profileBio.length}/160
            </p>
          </div>

          {/* Social handles */}
          <div className="space-y-2">
            {socialOrder.map((platform) => {
              const config = {
                twitter: {
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-neutral-400 flex-shrink-0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>,
                  value: profileTwitter, set: setProfileTwitter, field: "twitter_url" as const,
                },
                instagram: {
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-neutral-400 flex-shrink-0"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
                  value: profileInstagram, set: setProfileInstagram, field: "instagram_url" as const,
                },
                youtube: {
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-neutral-400 flex-shrink-0"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
                  value: profileYoutube, set: setProfileYoutube, field: "youtube_url" as const,
                },
              }[platform];
              return (
                <div key={platform} className="flex items-center gap-2">
                  {config.icon}
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[14px]">@</span>
                    <input
                      type="text"
                      value={config.value}
                      onChange={(e) => config.set(e.target.value)}
                      onBlur={() => onSaveField(config.field, config.value)}
                      className={`${inputClass} w-full pl-7`}
                      placeholder="handle"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => { onSaveAll(); onClose(); }}
              className="text-[14px] font-medium text-white px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#C0392B" }}
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="text-[13px] text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              Cancel
            </button>
            {profileSaved && (
              <span className="text-[13px] text-emerald-600 font-medium">Saved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
