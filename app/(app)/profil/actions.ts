"use server";

// Server Actions du Profil : mise à jour des champs + bascule des préférences.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Convertit une valeur de formulaire en nombre (virgule acceptée) ou null.
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

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: text(formData, "first_name"),
      last_name: text(formData, "last_name"),
      city: text(formData, "city"),
      experience_level: text(formData, "experience_level"),
      vma: num(formData, "vma"),
      vo2max: num(formData, "vo2max"),
      fc_max: num(formData, "fc_max"),
      fc_rest: num(formData, "fc_rest"),
      threshold_pace: text(formData, "threshold_pace"),
      ftp: num(formData, "ftp"),
      weight_kg: num(formData, "weight_kg"),
      units: text(formData, "units") ?? "metric",
      language: text(formData, "language") ?? "fr",
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profil/modifier?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profil");
  redirect("/profil");
}

// Bascule une préférence booléenne (notif_sessions | notif_daily) et persiste.
export async function togglePref(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  if (key !== "notif_sessions" && key !== "notif_daily") return;
  const current = String(formData.get("current") ?? "") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").update({ [key]: !current }).eq("id", user.id);
  revalidatePath("/profil");
}
