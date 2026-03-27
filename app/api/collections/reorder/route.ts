import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * PUT /api/collections/reorder
 * Reorder collections.
 * Body: { order: string[] } — array of collection IDs in desired order
 */
export async function PUT(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { order } = await request.json();

  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: "order must be a non-empty array of collection IDs" }, { status: 400 });
  }

  // Update each collection's sort_order
  const updates = order.map((id: string, index: number) =>
    supabase
      .from("collections")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("user_id", user!.id)
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}
