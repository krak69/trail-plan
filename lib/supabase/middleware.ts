// Logique de session partagée, appelée par le middleware Next.js (middleware.ts).
// Rôle : rafraîchir le token Supabase à chaque requête (sinon la session expire
// côté serveur) ET rediriger les visiteurs non connectés vers /login.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Réponse par défaut : on laisse passer la requête telle quelle.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // Quand Supabase rafraîchit la session, il faut réécrire les cookies
        // à la fois sur la requête (pour la suite du traitement) et sur la
        // réponse (pour les renvoyer au navigateur).
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT : ne rien mettre entre createServerClient et getUser(),
  // sous peine de bugs de session difficiles à traquer (recommandation Supabase).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Routes publiques : login, inscription et routes d'auth (confirmation email).
  const { pathname } = request.nextUrl;
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth");

  // Pas connecté + route protégée -> redirection vers /login.
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Déjà connecté mais sur /login ou /signup -> on renvoie vers l'accueil.
  if (
    user &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
