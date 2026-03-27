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

  // Archive the product
  const { data, error: dbError } = await supabase
    .from("products")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      archive_note,
    })
    .eq("id", id)
    .eq("user_id", user!.id)
    .eq("status", "current")
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Remove from top picks if present
  await supabase
    .from("top_picks")
    .delete()
    .eq("product_id", id)
    .eq("user_id", user!.id);

  return NextResponse.json(data);
}
