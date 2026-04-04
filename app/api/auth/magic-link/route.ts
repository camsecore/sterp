import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, next } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const callbackUrl = next
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=${encodeURIComponent(next)}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
