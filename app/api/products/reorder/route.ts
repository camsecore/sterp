import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * PUT /api/products/reorder
 * Reorder products within a collection.
 * Body: { collection_id: string, order: string[] } — array of product IDs in desired order
 */
export async function PUT(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { collection_id, order } = await request.json();

  if (!collection_id || !Array.isArray(order) || order.length === 0) {
    return NextResponse.json(
      { error: "collection_id and order (non-empty array of product IDs) are required" },
      { status: 400 }
    );
  }

  if (order.some((id: unknown) => typeof id !== "string" || id.length === 0)) {
    return NextResponse.json({ error: "Each element in order must be a non-empty string" }, { status: 400 });
  }

  const updates = order.map((id: string, index: number) =>
    supabase
      .from("products")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("user_id", user!.id)
      .eq("collection_id", collection_id)
  );

  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);
  if (failed) {
    return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
