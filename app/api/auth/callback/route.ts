import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

async function getGravatarUrl(email: string): Promise<string | null> {
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  const url = `https://gravatar.com/avatar/${hash}?s=200&d=404`;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok ? `https://gravatar.com/avatar/${hash}?s=200` : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect — allowlist of valid redirect targets
  const ALLOWED_REDIRECTS = ["/dashboard", "/onboarding/username"];
  const next = ALLOWED_REDIRECTS.includes(nextParam) ? nextParam : "/dashboard";

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

          // Grab avatar: Google profile pic > Gravatar > null
          const googlePic = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
          const avatar_url = googlePic || (user.email ? await getGravatarUrl(user.email) : null);

          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            username,
            ...(avatar_url && { avatar_url }),
          });

          if (insertError) {
            console.error("Failed to create user row:", insertError.message);
            return NextResponse.redirect(`${origin}/login?error=account_setup_failed`);
          }
        }

        return NextResponse.redirect(`${origin}/onboarding/username?new=1`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
