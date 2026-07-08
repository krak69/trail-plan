"use server";

// Server Actions pour gérer les séances (création, suppression).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Convertit une valeur de formulaire en nombre, ou null si vide/invalide.
function toNumberOrNull(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  const n = Number(s.replace(",", ".")); // accepte la virgule décimale (fr)
  return Number.isFinite(n) ? n : null;
}

export async function createSession(formData: FormData) {
  const supabase = await createClient();

  // On vérifie l'utilisateur : indispensable pour renseigner user_id (RLS).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const date = String(formData.get("date") ?? "").trim();
  if (!date) {
    redirect(`/seances/nouvelle?error=${encodeURIComponent("La date est obligatoire.")}`);
  }

  // Insertion. RLS exige que user_id = auth.uid() (voir policy).
  const { error } = await supabase.from("sessions").insert({
    user_id: user.id,
    date,
    distance_km: toNumberOrNull(formData.get("distance_km")),
    elevation_gain_m: toNumberOrNull(formData.get("elevation_gain_m")),
    duration_min: toNumberOrNull(formData.get("duration_min")),
    feeling: toNumberOrNull(formData.get("feeling")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) {
    redirect(`/seances/nouvelle?error=${encodeURIComponent(error.message)}`);
  }

  // Rafraîchit la liste sur l'accueil puis y retourne.
  revalidatePath("/");
  redirect("/");
}

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // Pas besoin de filtrer par user_id : la policy RLS empêche déjà de
  // supprimer une séance qui n'est pas la sienne.
  await supabase.from("sessions").delete().eq("id", id);

  revalidatePath("/");
}
