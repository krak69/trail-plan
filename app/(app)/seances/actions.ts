"use server";

// Server Actions pour les séances, branchées sur la table `training_sessions`.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function num(formData: FormData, key: string): number | null {
  const s = String(formData.get(key) ?? "").trim().replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function text(formData: FormData, key: string): string | null {
  const s = String(formData.get(key) ?? "").trim();
  return s === "" ? null : s;
}

export async function createSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const date = String(formData.get("date") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();
  if (!date) redirect(`/seances/nouvelle?error=${encodeURIComponent("La date est obligatoire.")}`);
  if (!kind) redirect(`/seances/nouvelle?error=${encodeURIComponent("Choisis un type de séance.")}`);

  const { error } = await supabase.from("training_sessions").insert({
    user_id: user.id,
    date,
    kind,
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    block_label: text(formData, "block_label"),
    planned_duration_min: num(formData, "planned_duration_min"),
    planned_distance_km: num(formData, "planned_distance_km"),
    planned_elevation_m: num(formData, "planned_elevation_m"),
    target_rpe: num(formData, "target_rpe"),
    status: text(formData, "status") ?? "planned",
  });

  if (error) redirect(`/seances/nouvelle?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/seances");
  revalidatePath("/");
  redirect("/seances");
}

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS empêche de supprimer la séance d'un autre utilisateur.
  await supabase.from("training_sessions").delete().eq("id", id);

  revalidatePath("/seances");
  revalidatePath("/");
  redirect("/seances");
}
