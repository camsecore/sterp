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

    // Auto-promote draft to current when a photo is added
    if (body.photo_url) {
      const { data: existing } = await supabase
        .from("products")
        .select("status")
        .eq("id", id)
        .eq("user_id", user!.id)
        .single();
      if (existing?.status === "draft") {
        updates.status = "current";
        // Auto-populate obsessions (same logic as POST /api/products)
        const { count } = await supabase
          .from("obsessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id);
        if ((count ?? 0) < 5) {
          await supabase.from("obsessions").insert({
            user_id: user!.id,
            product_id: id,
            sort_order: (count ?? 0) + 1,
          });
        }
      }
    }
  }

  if (body.acquired_at !== undefined) {
    updates.acquired_at = body.acquired_at || null;
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

  if (body.archive_note !== undefined) {
    updates.archive_note = body.archive_note?.trim() || null;
  }

  if (body.status === "current") {
    updates.status = "current";
    updates.archived_at = null;
    updates.archive_note = null;
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

  // Remove from obsessions if present
  await supabase
    .from("obsessions")
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
