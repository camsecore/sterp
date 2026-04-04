import { getAuthenticatedUser } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

/**
 * GET /api/collections
 * Fetch all collections for the authenticated user.
 */
export async function GET() {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("collections")
    .select("id, name, sort_order, created_at")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true });

  if (dbError) {
    console.error(dbError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/collections
 * Create a new collection.
 * Body: { name: string }
 */
export async function POST(request: Request) {
  const { user, supabase, error } = await getAuthenticatedUser();
  if (error) return error;

  const { name } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
  }

  // Get the next sort_order
  const { data: existing } = await supabase
    .from("collections")
    .select("sort_order")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error: dbError } = await supabase
    .from("collections")
    .insert({
      user_id: user!.id,
      name: name.trim(),
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (dbError) {
    console.error(dbError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
