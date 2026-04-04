import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * POST /api/products/[id]/archive
 * Archive a product with an optional memory note.
 * Body: { archive_note?: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const archive_note = body.archive_note?.trim() || null;
  const archived_at = body.archived_at || new Date().toISOString();
  const acquired_at = body.acquired_at || undefined;

  // Archive the product
  const updates: Record<string, unknown> = {
    status: "archived",
    archived_at,
    archive_note,
  };
  if (acquired_at !== undefined) updates.acquired_at = acquired_at;

  const { data, error: dbError } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user!.id)
    .in("status", ["current", "draft"])
    .select()
    .single();

  if (dbError) {
    console.error(dbError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Remove from obsessions if present
  await supabase
    .from("obsessions")
    .delete()
    .eq("product_id", id)
    .eq("user_id", user!.id);

  return NextResponse.json(data);
}
