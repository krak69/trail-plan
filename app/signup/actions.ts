"use server";

// Server Action d'inscription, avec champs complets et validations côté serveur.
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // Petit helper : renvoie vers /signup avec un message d'erreur affiché.
  const fail = (message: string) =>
    redirect(`/signup?error=${encodeURIComponent(message)}`);

  // --- Validations ---
  if (!firstName || !lastName) {
    fail("Prénom et nom sont obligatoires.");
  }
  if (password.length < 6) {
    fail("Le mot de passe doit faire au moins 6 caractères.");
  }
  if (password !== confirmPassword) {
    fail("Les deux mots de passe ne correspondent pas.");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Prénom/Nom stockés dans user_metadata (accessible via user.user_metadata).
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Si la confirmation email est activée, l'utilisateur doit cliquer le lien reçu.
  redirect(
    `/login?message=${encodeURIComponent(
      "Compte créé. Vérifie tes emails pour confirmer, puis connecte-toi."
    )}`
  );
}
