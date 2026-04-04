import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * DELETE /api/obsessions/[productId]
 * Remove a product from obsessions.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { error: dbError } = await supabase
    .from("obsessions")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user!.id);

  if (dbError) {
    console.error(dbError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
