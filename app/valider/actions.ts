"use server";

// Server Action : enregistre les données réalisées d'une séance et la passe en "done".
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

export async function validateSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("session_id") ?? "");
  if (!id) redirect("/seances");

  const sensations = String(formData.get("sensations") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("training_sessions")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      source: text(formData, "source"),
      actual_duration_min: num(formData, "duration_min"),
      actual_distance_km: num(formData, "distance_km"),
      actual_elevation_gain_m: num(formData, "elevation_gain_m"),
      actual_elevation_loss_m: num(formData, "elevation_loss_m"),
      fc_avg: num(formData, "fc_avg"),
      fc_max: num(formData, "fc_max"),
      cadence: num(formData, "cadence"),
      avg_pace: text(formData, "avg_pace"),
      terrain: text(formData, "terrain"),
      felt_rpe: num(formData, "felt_rpe"),
      sensations,
      hydration_ml: num(formData, "hydration_ml"),
      carbs_g: num(formData, "carbs_g"),
      gels_count: num(formData, "gels_count"),
      digestive_comfort: text(formData, "digestive_comfort"),
      notes: text(formData, "notes"),
    })
    .eq("id", id);

  if (error) {
    redirect(`/valider?s=${id}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/seances");
  revalidatePath(`/seances/${id}`);
  revalidatePath("/");
  redirect(`/seances/${id}`);
}
