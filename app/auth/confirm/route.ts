// Route Handler GET : point d'atterrissage du lien de confirmation email.
// Supabase renvoie l'utilisateur ici avec ?token_hash=...&type=...
// On échange ce jeton contre une session, puis on redirige vers l'accueil.
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Destination après confirmation (par défaut l'accueil).
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    // verifyOtp valide le jeton et pose les cookies de session.
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Jeton manquant / invalide / expiré -> retour login avec message.
  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent("Lien invalide ou expiré.")}`,
      request.url
    )
  );
}
