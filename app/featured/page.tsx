import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// ─── Curated list — add usernames here to feature them ───────────
const FEATURED_USERNAMES = ["cam"];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Featured Sterps",
  description: "Real people. Real products. Real takes.",
};

interface FeaturedProfile {
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  productCount: number;
  productPhotos: string[];
}

async function getFeaturedProfiles(): Promise<FeaturedProfile[]> {
  const supabase = await createClient();

  const results = await Promise.all(
    FEATURED_USERNAMES.map(async (username) => {
      const { data: user } = await supabase
        .from("users")
        .select("id, username, name, bio, avatar_url")
        .eq("username", username)
        .single();

      if (!user) return null;

      const [{ count }, { data: photos }] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "current"),
        supabase
          .from("products")
          .select("photo_url")
          .eq("user_id", user.id)
          .eq("status", "current")
          .not("photo_url", "is", null)
          .order("sort_order")
          .limit(4),
      ]);

      const productCount = count ?? 0;
      if (productCount < 3) return null;

      return {
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        productCount,
        productPhotos: (photos ?? []).map((p) => p.photo_url).filter(Boolean) as string[],
      } as FeaturedProfile;
    })
  );

  return results.filter((p): p is FeaturedProfile => p !== null);
}

export default async function FeaturedPage() {
  const profiles = await getFeaturedProfiles();

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      <div className="mx-auto max-w-2xl px-4 pt-10 pb-16">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/logo-charcoal.png"
            alt="Sterp"
            width={150}
            height={50}
            className="h-[50px] w-auto"
            priority
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-semibold text-neutral-900 tracking-tight [font-family:var(--font-space-grotesk)]">
            Featured Sterps
          </h1>
          <p className="text-[15px] text-neutral-400 mt-2">
            Real people. Real products. Real takes.
          </p>
        </div>

        {/* Profile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <Link
              key={profile.username}
              href={`/${profile.username}`}
              className="block rounded-xl border border-gray-200 bg-white px-5 py-5 hover:border-gray-300 transition-colors"
            >
              {/* Avatar + name + bio */}
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name || profile.username}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-neutral-900 truncate">
                    {profile.name || profile.username}
                  </p>
                  {profile.bio && (
                    <p className="text-[13px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Product count + photo stack */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-neutral-400">
                  {profile.productCount} product{profile.productCount !== 1 ? "s" : ""}
                </span>

                {/* Overlapping product photo thumbnails */}
                {profile.productPhotos.length > 0 && (
                  <div className="flex -space-x-2">
                    {profile.productPhotos.map((url, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-neutral-200"
                        style={{ zIndex: profile.productPhotos.length - i }}
                      >
                        <Image
                          src={url}
                          alt=""
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View link */}
              <p className="mt-3 text-[13px] font-medium text-neutral-400">
                View Page →
              </p>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
