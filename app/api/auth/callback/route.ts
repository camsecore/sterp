import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect — only allow relative paths starting with /
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For new signups heading to onboarding, ensure the user row exists
      // server-side so the client doesn't have to wait for it
      if (next === "/onboarding/username" && data.user) {
        const user = data.user;
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
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

        return NextResponse.redirect(`${origin}/onboarding/username?new=1`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
