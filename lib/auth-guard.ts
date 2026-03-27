import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Gets the authenticated user or returns a 401 response.
 * Use in API routes that require authentication.
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, supabase, error: null };
}
