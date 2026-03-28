import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, username, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!user) {
    return { title: "Not Found — Sterp" };
  }

  // Get the user's #1 top pick photo for the OG image
  const { data: topPick } = await supabase
    .from("top_picks")
    .select("products(photo_url)")
    .eq("user_id", user.id)
    .order("sort_order")
    .limit(1)
    .single();

  const topPickPhoto = (topPick?.products as unknown as { photo_url: string } | null)?.photo_url;
  const ogImage = topPickPhoto || user.avatar_url;

  const title = `${user.name || user.username} — Sterp`;
  const description = user.bio || `Check out ${user.name || user.username}'s favorite products on Sterp.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://sterp.com/${user.username}`,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch user by username
  const { data: user } = await supabase
    .from("users")
    .select("id, username, name, bio, avatar_url, twitter_url, instagram_url, youtube_url")
    .eq("username", username)
    .single();

  if (!user) notFound();

  // Fetch collections, products, and top picks in parallel
  const [collectionsRes, productsRes, topPicksRes] = await Promise.all([
    supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("top_picks")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
  ]);

  return (
    <ProfileClient
      user={user}
      collections={collectionsRes.data ?? []}
      products={productsRes.data ?? []}
      topPicks={topPicksRes.data ?? []}
    />
  );
}
