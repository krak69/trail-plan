"use server";

// Server Action : création d'un exercice de renfo (privé à l'utilisateur).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createExercise(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  const fail = (msg: string) => redirect(`/banque/nouveau?error=${encodeURIComponent(msg)}`);
  if (!name) fail("Le nom est obligatoire.");
  if (!category) fail("Choisis une catégorie.");

  // "Quadriceps, Fessiers" -> ['Quadriceps','Fessiers']
  const muscles = String(formData.get("muscles") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const clean = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };

  const { error } = await supabase.from("exercises").insert({
    user_id: user.id,
    name,
    category,
    muscles,
    metric_value: clean("metric_value"),
    metric_unit: clean("metric_unit"),
    tempo_tag: clean("tempo_tag"),
    cue: clean("cue"),
    is_public: false, // exercice perso
  });

  if (error) fail(error.message);

  revalidatePath("/banque");
  redirect("/banque");
}

// Champs communs extraits d'un FormData (helpers partagés create/update).
function readExerciseFields(formData: FormData) {
  const clean = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    muscles: String(formData.get("muscles") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    metric_value: clean("metric_value"),
    metric_unit: clean("metric_unit"),
    tempo_tag: clean("tempo_tag"),
    cue: clean("cue"),
  };
}

export async function updateExercise(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const f = readExerciseFields(formData);
  if (!f.name || !f.category) {
    redirect(`/banque/${id}/modifier?error=${encodeURIComponent("Nom et catégorie sont obligatoires.")}`);
  }

  // RLS garantit qu'on ne peut modifier que ses propres exercices.
  const { error } = await supabase.from("exercises").update(f).eq("id", id);
  if (error) {
    redirect(`/banque/${id}/modifier?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/banque");
  revalidatePath(`/banque/${id}`);
  redirect(`/banque/${id}`);
}

export async function deleteExercise(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS empêche de supprimer un exercice du catalogue public ou d'un autre user.
  await supabase.from("exercises").delete().eq("id", id);

  revalidatePath("/banque");
  redirect("/banque");
}
