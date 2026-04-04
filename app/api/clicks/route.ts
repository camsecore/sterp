import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/clicks
 * Record an affiliate link click. No auth required — called from public pages.
 * Body: { product_id: string, referrer?: string }
 * user_id is derived from the product owner — never trust client input.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { product_id, referrer } = await request.json();

  if (!product_id || typeof product_id !== "string") {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  // Derive user_id from the product's owner — don't accept it from the client
  const { data: product, error: lookupError } = await supabase
    .from("products")
    .select("user_id")
    .eq("id", product_id)
    .single();

  if (lookupError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { error } = await supabase.from("clicks").insert({
    product_id,
    user_id: product.user_id,
    referrer: referrer || null,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
