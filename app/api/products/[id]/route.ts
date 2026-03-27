import { getAuthenticatedUser } from "@/lib/auth-guard";
import { rewriteAffiliateUrl } from "@/lib/affiliate";
import { NextResponse } from "next/server";

/**
 * PATCH /api/products/[id]
 * Update a product's fields.
 * Body: any subset of { name, photo_url, one_liner, original_url, collection_id }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    updates.name = body.name.trim();
  }

  if (body.one_liner !== undefined) {
    if (body.one_liner && body.one_liner.length > 160) {
      return NextResponse.json({ error: "One-liner must be 160 characters or fewer" }, { status: 400 });
    }
    updates.one_liner = body.one_liner?.trim() || null;
  }

  if (body.photo_url !== undefined) {
    updates.photo_url = body.photo_url || null;
  }

  if (body.original_url !== undefined) {
    updates.original_url = body.original_url || null;
    updates.affiliate_url = body.original_url ? rewriteAffiliateUrl(body.original_url) : null;
  }

  if (body.collection_id !== undefined) {
    // Verify the target collection belongs to this user
    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", body.collection_id)
      .eq("user_id", user!.id)
      .single();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    updates.collection_id = body.collection_id;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user!.id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/products/[id]
 * Permanently delete a product (current or archived).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  // Remove from top picks if present
  await supabase
    .from("top_picks")
    .delete()
    .eq("product_id", id)
    .eq("user_id", user!.id);

  // Delete the product
  const { error: dbError } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user!.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
