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

  if (order.some((id: unknown) => typeof id !== "string" || id.length === 0)) {
    return NextResponse.json({ error: "Each element in order must be a non-empty string" }, { status: 400 });
  }

  // Update each collection's sort_order
  const updates = order.map((id: string, index: number) =>
    supabase
      .from("collections")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("user_id", user!.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);
  if (failed) {
    return NextResponse.json({ error: "Failed to reorder collections" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
