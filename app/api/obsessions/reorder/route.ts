import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * PUT /api/obsessions/reorder
 * Reorder obsessions.
 * Body: { order: string[] } — array of product IDs in desired order
 */
export async function PUT(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { order } = await request.json();

  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: "order must be a non-empty array of product IDs" }, { status: 400 });
  }

  const updates = order.map((productId: string, index: number) =>
    supabase
      .from("obsessions")
      .update({ sort_order: index })
      .eq("product_id", productId)
      .eq("user_id", user!.id)
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}
