// Middleware Next.js : s'exécute avant chaque requête correspondant au matcher.
// Il délègue toute la logique de session à lib/supabase/middleware.ts.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // On applique le middleware à toutes les routes SAUF les assets statiques
  // (fichiers Next, images, favicon) pour ne pas ralentir leur chargement.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
