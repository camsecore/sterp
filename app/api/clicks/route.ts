import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/clicks
 * Record an affiliate link click. No auth required — called from public pages.
 * Body: { product_id: string, user_id: string, referrer?: string }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { product_id, user_id, referrer } = await request.json();

  if (!product_id || !user_id) {
    return NextResponse.json({ error: "product_id and user_id are required" }, { status: 400 });
  }

  const { error } = await supabase.from("clicks").insert({
    product_id,
    user_id,
    referrer: referrer || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
