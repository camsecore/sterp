import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";

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
    .select("*")
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
