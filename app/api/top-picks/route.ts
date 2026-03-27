import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * GET /api/top-picks
 * Fetch the authenticated user's top picks with product data.
 */
export async function GET() {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("top_picks")
    .select("id, product_id, sort_order, products(id, name, photo_url, one_liner, affiliate_url)")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/top-picks
 * Add a product to top picks.
 * Body: { product_id: string }
 */
export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { product_id } = await request.json();

  if (!product_id) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  // Check the 5-item cap
  const { count } = await supabase
    .from("top_picks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Maximum 5 top picks allowed. Remove one first." }, { status: 400 });
  }

  // Verify the product belongs to this user and is current
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", product_id)
    .eq("user_id", user!.id)
    .eq("status", "current")
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found or is archived" }, { status: 404 });
  }

  // Check if already in top picks
  const { data: existing } = await supabase
    .from("top_picks")
    .select("id")
    .eq("user_id", user!.id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Product is already in top picks" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("top_picks")
    .insert({
      user_id: user!.id,
      product_id,
      sort_order: (count ?? 0) + 1,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
