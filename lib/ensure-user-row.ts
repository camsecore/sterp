import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures a row exists in public.users for the authenticated user.
 * If the Supabase trigger didn't fire (e.g. magic link signup),
 * this creates the row with an auto-generated username.
 */
export async function ensureUserRow(user: User): Promise<void> {
  const supabase = createClient();

  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return; // Row already exists

  // Generate an auto-generated username from email prefix + random suffix
  const emailPrefix = (user.email?.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
  const suffix = Math.random().toString(36).slice(2, 6);
  const username = `${emailPrefix}_${suffix}`;

  await supabase.from("users").insert({
    id: user.id,
    email: user.email!,
    username,
  });
}
