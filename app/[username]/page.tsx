import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";

// Deduplicate user + product count queries across generateMetadata and page render
const getProfileData = cache(async (username: string) => {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, username, name, bio, avatar_url, twitter_url, instagram_url, youtube_url")
    .eq("username", username)
    .single();

  if (!user) return null;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "current");

  if ((count ?? 0) < 3) return null;

  return user;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getProfileData(username);

  if (!user) {
    return { title: "Not Found — Sterp" };
  }

  // Get the user's #1 obsession photo for the OG image
  const supabase = await createClient();
  const { data: obsession } = await supabase
    .from("obsessions")
    .select("products(photo_url)")
    .eq("user_id", user.id)
    .order("sort_order")
    .limit(1)
    .single();

  const obsessionPhoto = (obsession?.products as unknown as { photo_url: string } | null)?.photo_url;
  const ogImage = obsessionPhoto || user.avatar_url;

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
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
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
  const user = await getProfileData(username);

  if (!user) notFound();

  const supabase = await createClient();

  // Fetch collections, products, and obsessions in parallel
  const [collectionsRes, productsRes, obsessionsRes] = await Promise.all([
    supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "draft")
      .order("sort_order"),
    supabase
      .from("obsessions")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
  ]);

  return (
    <ProfileClient
      user={user}
      collections={collectionsRes.data ?? []}
      products={productsRes.data ?? []}
      obsessions={obsessionsRes.data ?? []}
    />
  );
}
