"use server";

// Server Actions : fonctions exécutées UNIQUEMENT côté serveur, appelées
// directement depuis le <form> de la page login (attribut formAction).
// Aucun code d'auth ne transite donc côté navigateur.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// --- Connexion ---
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // On renvoie le message d'erreur à la page via l'URL (?error=...).
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Invalide le cache pour que les pages voient la nouvelle session, puis accueil.
  revalidatePath("/", "layout");
  redirect("/");
}
