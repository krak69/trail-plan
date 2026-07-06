// Client Supabase pour le SERVEUR (Server Components, Route Handlers, Server Actions).
// Il lit/écrit les cookies de session via l'API cookies() de Next.js, ce qui
// permet de garder l'utilisateur authentifié côté serveur.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Supabase lit tous les cookies pour retrouver la session.
        getAll() {
          return cookieStore.getAll();
        },
        // Et les réécrit quand la session est rafraîchie.
        // Le try/catch évite un crash quand setAll est appelé depuis un
        // Server Component (où l'écriture de cookies n'est pas autorisée) :
        // dans ce cas le middleware se chargera du rafraîchissement.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : sans conséquence ici.
          }
        },
      },
    }
  );
}
