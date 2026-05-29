import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route de callback OAuth / confirmation e-mail.
 * Échange le code contre une session puis redirige vers l'accueil.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
