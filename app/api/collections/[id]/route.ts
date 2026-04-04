import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * PATCH /api/collections/[id]
 * Update a collection's name.
 * Body: { name: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { name } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("collections")
    .update({ name: name.trim() })
    .eq("id", id)
    .eq("user_id", user!.id)
    .select()
    .single();

  if (dbError) {
    console.error(dbError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/collections/[id]
 * Delete a collection. Fails if it still has products.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  // Check if collection has current (non-archived) products
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", id)
    .eq("user_id", user!.id)
    .eq("status", "current");

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete a collection that still has products. Move or archive them first." },
      { status: 400 }
    );
  }

  const { error: dbError } = await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_id", user!.id);

  if (dbError) {
    console.error(dbError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
