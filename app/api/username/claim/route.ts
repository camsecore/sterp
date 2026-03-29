import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const RESERVED_USERNAMES = new Set([
  "admin", "api", "www", "sterp", "about", "login", "signup",
  "dashboard", "settings", "help", "support", "terms", "privacy",
  "home", "explore", "archive", "onboarding",
]);

export async function POST(request: Request) {
  const { username } = await request.json();
  const clean = username?.toLowerCase().trim();

  if (!clean || clean.length < 3 || !/^[a-z0-9_]+$/.test(clean)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  if (RESERVED_USERNAMES.has(clean)) {
    return NextResponse.json({ error: "Reserved username" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check availability
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", clean)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  // Update username
  const { error: updateError } = await supabase
    .from("users")
    .update({ username: clean })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ username: clean });
}
