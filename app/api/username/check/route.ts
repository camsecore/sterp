import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const RESERVED_USERNAMES = new Set([
  "admin", "api", "www", "sterp", "about", "login", "signup",
  "dashboard", "settings", "help", "support", "terms", "privacy",
  "home", "explore", "archive", "onboarding",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.toLowerCase().trim();

  if (!username) {
    return NextResponse.json({ available: false, reason: "Username is required" }, { status: 400 });
  }

  if (username.length < 3) {
    return NextResponse.json({ available: false, reason: "Too short" });
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: "Invalid characters" });
  }

  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ available: false, reason: "Reserved" });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (data) {
    return NextResponse.json({ available: false, reason: "Taken" });
  }

  return NextResponse.json({ available: true });
}
