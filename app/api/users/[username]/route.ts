import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/users/[username]
 * Public endpoint — fetches a user's full page data (profile, collections, products, obsessions).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, username, name, bio, avatar_url, twitter_url, instagram_url, youtube_url")
    .eq("username", username)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch collections, products, and obsessions in parallel
  const [collectionsRes, productsRes, obsessionsRes] = await Promise.all([
    supabase
      .from("collections")
      .select("id, name, sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),

    supabase
      .from("products")
      .select("id, collection_id, name, photo_url, one_liner, affiliate_url, status, sort_order, created_at, archived_at, archive_note")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),

    supabase
      .from("obsessions")
      .select("id, product_id, sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
  ]);

  // Check page go-live threshold: minimum 2 current products
  const currentProducts = (productsRes.data ?? []).filter(p => p.status === "current");
  if (currentProducts.length < 2) {
    return NextResponse.json({ error: "Page not yet live" }, { status: 404 });
  }

  return NextResponse.json({
    user,
    collections: collectionsRes.data ?? [],
    products: productsRes.data ?? [],
    obsessions: obsessionsRes.data ?? [],
  });
}
