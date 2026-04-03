import { getAuthenticatedUser } from "@/lib/auth-guard";
import { rewriteAffiliateUrl } from "@/lib/affiliate";
import { NextResponse } from "next/server";

/**
 * GET /api/products
 * Fetch all products for the authenticated user.
 * Query params: ?status=current|archived (optional, defaults to all)
 */
export async function GET(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("products")
    .select("*")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true });

  if (status === "current" || status === "archived") {
    query = query.eq("status", status);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/products
 * Create a new product.
 * Body: { collection_id, name, photo_url, one_liner, original_url }
 */
export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { collection_id, name, photo_url, one_liner, original_url } = body;

  if (!collection_id || !name) {
    return NextResponse.json({ error: "collection_id and name are required" }, { status: 400 });
  }

  if (one_liner && one_liner.length > 160) {
    return NextResponse.json({ error: "One-liner must be 160 characters or fewer" }, { status: 400 });
  }

  // Verify the collection belongs to this user
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collection_id)
    .eq("user_id", user!.id)
    .single();

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  // Get the next sort_order within this collection
  const { data: existing } = await supabase
    .from("products")
    .select("sort_order")
    .eq("collection_id", collection_id)
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  // Rewrite affiliate URL
  const affiliate_url = original_url ? rewriteAffiliateUrl(original_url) : null;

  const { data, error: dbError } = await supabase
    .from("products")
    .insert({
      user_id: user!.id,
      collection_id,
      name: name.trim(),
      photo_url: photo_url || null,
      one_liner: one_liner?.trim() || null,
      original_url: original_url || null,
      affiliate_url,
      status: photo_url ? "current" : "draft",
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Auto-populate obsessions if user has fewer than 5 (only for current products)
  if (data.status === "current") {
    const { count } = await supabase
      .from("obsessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id);

    if ((count ?? 0) < 5) {
      await supabase.from("obsessions").insert({
        user_id: user!.id,
        product_id: data.id,
        sort_order: (count ?? 0) + 1,
      });
    }
  }

  return NextResponse.json(data, { status: 201 });
}
