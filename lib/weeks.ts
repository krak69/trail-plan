// Regroupe des training_sessions en semaines (lundi → dimanche) pour l'écran Séances.
import type { TrainingSession } from "./types";

export type Kind = "course" | "renfo" | "velo" | "repos";
export type DayStatus = "done" | "today" | "planned";

export type DayCell = {
  dn: string; // "LUN"
  d: string; // "20"
  date: string; // iso
  kind: Kind;
  session: {
    id: string;
    title: string;
    subtitle: string;
    metrics: string;
    status: DayStatus;
  } | null;
};

export type WeekView = {
  key: string; // iso du lundi
  label: string; // "Semaine du 7 juil."
  range: string; // "7 – 13 juil."
  block: string;
  current: boolean;
  sum: { count: number; done: number; duration: string; dplus: string };
  days: DayCell[];
};

const DN = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function mondayOf(iso: string): Date {
  const d = new Date(`${iso}T00:00:00`);
  const offset = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtDurationMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h === 0 ? `${m}min` : `${h}h${String(m).padStart(2, "0")}`;
}

// Chaîne de métriques d'une carte : durée · D+ · RPE (planifié, ou réel si réalisé).
function metricsOf(s: TrainingSession): string {
  const done = s.status === "done";
  const dur = done ? s.actual_duration_min : s.planned_duration_min;
  const dplus = done ? s.actual_elevation_gain_m : s.planned_elevation_m;
  const rpe = done ? s.felt_rpe : s.target_rpe;
  const dist = done ? s.actual_distance_km : s.planned_distance_km;
  const parts: string[] = [];
  if (dur != null) parts.push(fmtDurationMin(dur));
  if (dist != null) parts.push(`${dist} km`);
  if (dplus != null) parts.push(`${dplus} D+`);
  if (rpe != null) parts.push(`RPE ${rpe}`);
  return parts.join(" · ");
}

export function buildWeeks(sessions: TrainingSession[]): {
  weeks: WeekView[];
  currentIndex: number;
} {
  const todayIso = isoLocal(new Date());
  const todayMondayIso = isoLocal(mondayOf(todayIso));

  // Regroupe les séances par lundi de leur semaine (1 séance / jour supposée).
  const byMonday = new Map<string, Map<string, TrainingSession>>();
  for (const s of sessions) {
    const mKey = isoLocal(mondayOf(s.date));
    if (!byMonday.has(mKey)) byMonday.set(mKey, new Map());
    // si plusieurs séances le même jour, on garde la première (rare).
    if (!byMonday.get(mKey)!.has(s.date)) byMonday.get(mKey)!.set(s.date, s);
  }

  // On garantit la présence de la semaine courante même sans séance.
  const mondayKeys = new Set<string>(Array.from(byMonday.keys()));
  mondayKeys.add(todayMondayIso);
  const sorted = Array.from(mondayKeys).sort();

  const weeks: WeekView[] = sorted.map((mKey) => {
    const monday = new Date(`${mKey}T00:00:00`);
    const sunday = addDays(monday, 6);
    const daySessions = byMonday.get(mKey) ?? new Map<string, TrainingSession>();

    let count = 0;
    let done = 0;
    let totalMin = 0;
    let totalDplus = 0;
    let block = "";

    const days: DayCell[] = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      const dIso = isoLocal(date);
      const s = daySessions.get(dIso);
      const kind = (s?.kind as Kind) ?? "repos";

      if (s && kind !== "repos") {
        count++;
        if (s.status === "done") done++;
        totalMin += (s.status === "done" ? s.actual_duration_min : s.planned_duration_min) ?? 0;
        totalDplus += (s.status === "done" ? s.actual_elevation_gain_m : s.planned_elevation_m) ?? 0;
        if (!block && s.block_label) block = s.block_label;
      }

      const status: DayStatus =
        s?.status === "done" ? "done" : dIso === todayIso ? "today" : "planned";

      return {
        dn: DN[i],
        d: String(date.getDate()),
        date: dIso,
        kind,
        session: s
          ? {
              id: s.id,
              title: s.title ?? "Séance",
              subtitle: s.subtitle ?? "",
              metrics: metricsOf(s),
              status,
            }
          : null,
      };
    });

    return {
      key: mKey,
      label: `Semaine du ${monday.getDate()} ${MOIS[monday.getMonth()]}`,
      range: `${monday.getDate()} ${MOIS[monday.getMonth()]} – ${sunday.getDate()} ${MOIS[sunday.getMonth()]}`,
      block,
      current: mKey === todayMondayIso,
      sum: {
        count,
        done,
        duration: totalMin > 0 ? fmtDurationMin(totalMin) : "0min",
        dplus: totalDplus.toLocaleString("fr-FR"),
      },
      days,
    };
  });

  const currentIndex = Math.max(0, weeks.findIndex((w) => w.current));
  return { weeks, currentIndex };
}
