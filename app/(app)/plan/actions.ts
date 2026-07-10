"use server";

// Server Action : création / mise à jour de l'objectif de course "en cours".
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
// "17","30","00" -> "17:30:00" (ou null si tout vide)
function interval(formData: FormData): string | null {
  const h = String(formData.get("target_h") ?? "").trim();
  const m = String(formData.get("target_m") ?? "").trim();
  const s = String(formData.get("target_s") ?? "").trim();
  if (h === "" && m === "" && s === "") return null;
  const pad = (v: string) => String(parseInt(v || "0", 10) || 0).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export async function saveObjective(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect(`/plan/objectif?error=${encodeURIComponent("Le nom de la course est obligatoire.")}`);
  }

  const payload = {
    name,
    subtitle: text(formData, "subtitle"),
    race_date: text(formData, "race_date"),
    distance_km: num(formData, "distance_km"),
    elevation_gain_m: num(formData, "elevation_gain_m"),
    target_time: interval(formData),
    priority: text(formData, "priority") ?? "A",
    plan_start_date: text(formData, "plan_start_date"),
    status: "current",
  };

  const { error } = id
    ? await supabase.from("objectives").update(payload).eq("id", id)
    : await supabase.from("objectives").insert({ ...payload, user_id: user.id });

  if (error) {
    redirect(`/plan/objectif?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/plan");
  revalidatePath("/");
  revalidatePath("/profil");
  redirect("/plan");
}
