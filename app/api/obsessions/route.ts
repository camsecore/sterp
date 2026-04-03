import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * GET /api/obsessions
 * Fetch the authenticated user's obsessions with product data.
 */
export async function GET() {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("obsessions")
    .select("id, product_id, sort_order, products(id, name, photo_url, one_liner, affiliate_url)")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/obsessions
 * Add a product to obsessions.
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
    .from("obsessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Maximum 5 obsessions allowed. Remove one first." }, { status: 400 });
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
    return NextResponse.json({ error: "Product must be active (not archived or draft)" }, { status: 404 });
  }

  // Check if already in obsessions
  const { data: existing } = await supabase
    .from("obsessions")
    .select("id")
    .eq("user_id", user!.id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Product is already in obsessions" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("obsessions")
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
