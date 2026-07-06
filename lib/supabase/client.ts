// Client Supabase pour le NAVIGATEUR (composants "use client").
// À utiliser dans les Client Components React.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Ces deux variables doivent être définies dans .env.local (et sur Vercel).
  // Le préfixe NEXT_PUBLIC_ les rend accessibles côté navigateur : c'est OK,
  // l'URL et la clé "anon" sont publiques par design (la sécurité repose sur
  // les Row Level Security policies de Supabase, qu'on configurera plus tard).
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
