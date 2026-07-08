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
