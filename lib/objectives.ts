// Helpers autour de l'objectif de course "en cours".
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Objective } from "./types";

// Récupère l'objectif "en cours" de l'utilisateur (RLS filtre déjà par user).
export async function getCurrentObjective(
  supabase: SupabaseClient
): Promise<Objective | null> {
  const { data } = await supabase
    .from("objectives")
    .select("*")
    .eq("status", "current")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Objective) ?? null;
}

// Nombre de jours avant la course (J-XX), ou null.
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${iso}T00:00:00`);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// "2026-08-28" -> "28 août 2026"
export function formatFrDate(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)} ${MOIS[parseInt(m, 10) - 1] ?? m} ${y}`;
}

// "17:30:00" -> "17h30"
export function formatTargetTime(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(":");
  return `${parseInt(h, 10)}h${(m ?? "00").padStart(2, "0")}`;
}

// Résumé "101 km · 6 100 D+" à partir des champs numériques.
export function formatRaceMetrics(distanceKm: number | null, elevation: number | null): string {
  const parts: string[] = [];
  if (distanceKm != null) parts.push(`${distanceKm} km`);
  if (elevation != null) parts.push(`${elevation.toLocaleString("fr-FR")} D+`);
  return parts.join(" · ");
}
