import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Footprints,
  Flag,
  ArrowRight,
  CloudSun,
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentObjective,
  daysUntil,
  formatFrDate,
  formatRaceMetrics,
} from "@/lib/objectives";

/*
  DASHBOARD — reproduction de la maquette Claude Design (thème lime).

  ⚠️ La plupart des chiffres ci-dessous sont des DONNÉES D'EXEMPLE (objectif de
  course, météo, prochaine séance, charge A:C, zones FC, TSS). Elles n'ont pas
  encore de backend. Elles sont regroupées dans l'objet `mock` pour être
  facilement remplacées par de vraies données au fur et à mesure.

  Seul le prénom vient déjà du vrai compte connecté.
*/

// Couleur d'accent (lime) en RGB, pour les effets en style inline (dégradés/hachures).
const LIME = "216, 255, 61";

const mock = {
  weekLabel: "Semaine 3 / 6 · Bloc spécifique",
  weather: "Annecy · 12°C · Sam. 27 juin",
  objective: {
    race: "CCC · UTMB",
    subtitle: "Chamonix–Courmayeur–Chamonix",
    date: "29 août 2026 · 101 km · 6 100 D+",
    countdown: "J-63",
    block: "3",
    blockTotal: "6",
    progress: 48,
  },
  nextSession: {
    title: "Sortie longue · Aravis",
    type: "Course à pied · Endurance fondamentale",
    duration: "2h30",
    rpe: "3",
    elevation: "1 350",
  },
  week: {
    range: "22 – 28 juin",
    distanceKm: "82",
    elevation: "3 240",
    time: "9h12",
  },
  load: {
    ratio: "1.12",
    status: "OPTIMAL",
    detail: "aiguë 520 · chronique 465",
  },
  hrZones: {
    total: "9h12",
    // Répartition (%) des zones Z1→Z5.
    zones: [15, 42, 22, 14, 7],
    highlight: "Z2 42%",
  },
  // Charge quotidienne (TSS) des 7 derniers jours.
  daily: [
    { day: "Lun", value: "45", height: 35, today: false },
    { day: "Mar", value: "76", height: 58, today: false },
    { day: "Mer", value: "28", height: 22, today: false },
    { day: "Jeu", value: "95", height: 73, today: false },
    { day: "Ven", value: "52", height: 40, today: false },
    { day: "Auj.", value: "130", height: 100, today: true },
    { day: "Dim", value: "—", height: 6, today: false },
  ],
};

// Opacités lime pour les 5 zones FC (Z1 clair → Z5 plein).
const ZONE_OPACITY = ["bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const firstName = (user.user_metadata?.first_name as string) || "Athlète";

  // Objectif de course réel (le reste du dashboard est encore fictif).
  const objective = await getCurrentObjective(supabase);
  const j = objective ? daysUntil(objective.race_date) : null;
  const objView = objective
    ? {
        name: objective.name,
        subtitle: objective.subtitle ?? "",
        dateLine: [formatFrDate(objective.race_date), formatRaceMetrics(objective.distance_km, objective.elevation_gain_m)]
          .filter(Boolean)
          .join(" · "),
        countdown: j != null ? `J-${j}` : "—",
      }
    : null;

  return (
    <main className="flex flex-col">
      {/* ===================== HEADER ===================== */}
      <header className="flex flex-wrap items-start justify-between gap-4 px-5 pb-4 pt-6 sm:px-8 sm:pt-10">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {mock.weekLabel}
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Bonjour, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5">
            <CloudSun className="size-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              {mock.weather}
            </span>
          </div>
        </div>
      </header>

      {/* ===================== GRILLE ===================== */}
      <div className="grid grid-cols-1 gap-4 px-5 pb-8 sm:px-8 md:grid-cols-2 xl:grid-cols-3">
        {/* ---------- OBJECTIF (pleine largeur) ---------- */}
        <section
          className="relative col-span-full overflow-hidden rounded-[22px] border p-5 sm:p-6"
          style={{
            borderColor: `rgba(${LIME}, 0.28)`,
            background:
              "linear-gradient(120deg, hsl(var(--card)) 0%, hsl(45 22% 8%) 100%)",
          }}
        >
          {/* Hachures décoratives */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: `repeating-linear-gradient(115deg, rgba(${LIME},0.05) 0 2px, transparent 2px 15px)`,
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex min-w-[240px] flex-col gap-3">
              <div className="flex items-center gap-2">
                <Flag className="size-4 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                  Prochain objectif · Course officielle
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {objView?.name ?? "Aucun objectif défini"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {objView?.subtitle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                <span>
                  {objView?.dateLine ?? (
                    <Link href="/plan/objectif" className="text-primary hover:underline">
                      Définis ta course cible →
                    </Link>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex gap-8 font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-primary">
                    {objView?.countdown ?? "—"}
                  </span>
                  <span className="text-[9px] tracking-[0.12em] text-muted-foreground">
                    ÉCHÉANCE
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold">
                    {mock.objective.block}
                    <span className="text-sm text-muted-foreground">
                      /{mock.objective.blockTotal}
                    </span>
                  </span>
                  <span className="text-[9px] tracking-[0.12em] text-muted-foreground">
                    BLOC SPÉCIFIQUE
                  </span>
                </div>
              </div>
              <div className="flex min-w-[150px] flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                    PRÉPARATION
                  </span>
                  <span className="font-mono text-[11px] text-primary">
                    {mock.objective.progress}%
                  </span>
                </div>
                <div className="h-[7px] rounded-lg bg-secondary">
                  <div
                    className="h-full rounded-lg bg-primary"
                    style={{ width: `${mock.objective.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- HERO : prochaine séance (pleine largeur) ---------- */}
        <section className="col-span-full flex flex-wrap items-center justify-between gap-6 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex min-w-[240px] flex-col gap-3">
            <span className="self-start rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
              Prochaine séance · Aujourd&apos;hui
            </span>
            <div className="flex items-center gap-3">
              <Footprints className="size-6 text-primary" />
              <span className="text-xl font-bold tracking-tight sm:text-2xl">
                {mock.nextSession.title}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {mock.nextSession.type}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex gap-8 font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold">
                  {mock.nextSession.duration}
                </span>
                <span className="text-[9px] tracking-[0.12em] text-muted-foreground">
                  DURÉE
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold">
                  RPE {mock.nextSession.rpe}
                  <span className="text-[13px] text-muted-foreground">/10</span>
                </span>
                <span className="text-[9px] tracking-[0.12em] text-muted-foreground">
                  INTENSITÉ
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold">
                  {mock.nextSession.elevation}
                  <span className="text-[13px] text-primary"> D+</span>
                </span>
                <span className="text-[9px] tracking-[0.12em] text-muted-foreground">
                  DÉNIVELÉ
                </span>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              Voir la séance
              <ArrowRight className="size-5" />
            </button>
          </div>
        </section>

        {/* ---------- TOTAL DE LA SEMAINE ----------
            👉 Premier bloc à brancher sur les vraies séances (somme 7 jours). */}
        <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              Total de la semaine
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {mock.week.range}
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {mock.week.distanceKm}
                <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                  km
                </span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                DISTANCE
              </span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {mock.week.elevation}
                <span className="ml-0.5 text-sm font-medium text-primary">
                  D+
                </span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                DÉNIVELÉ
              </span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {mock.week.time}
              </span>
              <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                TEMPS
              </span>
            </div>
          </div>
        </section>

        {/* ---------- CHARGE · RATIO A:C ---------- */}
        <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Charge · ratio A:C
            </span>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-primary">
              {mock.load.status}
            </span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-bold tabular-nums">
              {mock.load.ratio}
            </span>
            <span className="text-xs text-muted-foreground">
              {mock.load.detail}
            </span>
          </div>
          {/* Jauge : zone optimale + curseur */}
          <div className="relative mt-auto h-2 rounded-lg bg-secondary">
            <div className="absolute inset-y-0 left-[26%] w-[44%] rounded-lg bg-primary/25" />
            <div
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
              style={{ left: "53%", boxShadow: `0 0 0 4px rgba(${LIME},0.2)` }}
            />
          </div>
        </section>

        {/* ---------- RÉPARTITION FC ---------- */}
        <section className="flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Répartition FC
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {mock.hrZones.total}
            </span>
          </div>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-lg">
            {mock.hrZones.zones.map((w, i) => (
              <div
                key={i}
                className={ZONE_OPACITY[i]}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="mt-auto flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Z1</span>
            <span className="text-primary">{mock.hrZones.highlight}</span>
            <span>Z3</span>
            <span>Z4</span>
            <span>Z5</span>
          </div>
        </section>

        {/* ---------- CHARGE PAR JOUR · TSS (pleine largeur) ---------- */}
        <section className="col-span-full flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Charge par jour · TSS
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              7 derniers jours
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 sm:gap-4">
            {mock.daily.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={
                    d.today
                      ? "font-mono text-[10px] font-bold text-primary"
                      : "font-mono text-[10px] text-muted-foreground"
                  }
                >
                  {d.value}
                </span>
                <div className="flex h-24 w-full items-end">
                  <div
                    className={
                      d.today
                        ? "w-full rounded-md bg-primary"
                        : "w-full rounded-md bg-secondary"
                    }
                    style={{ height: `${d.height}%` }}
                  />
                </div>
                <span
                  className={
                    d.today
                      ? "font-mono text-[11px] text-primary"
                      : "font-mono text-[11px] text-muted-foreground"
                  }
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
