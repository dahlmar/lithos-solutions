import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Lands Supabase email links (password recovery, and later invites/magic
 * links): exchanges the one-time code for a session, then continues to
 * `next`. Failed/expired codes fall through to the login page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?expired=1", url.origin));
}
