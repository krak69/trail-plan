"use client";

// Vue "plan hebdomadaire" des séances — reproduction de la maquette Claude Design
// (thème lime). Navigation de semaine interactive (useState).
//
// ⚠️ DONNÉES D'EXEMPLE : les semaines/séances ci-dessous sont fictives (objet
// WEEKS). Aucun backend pour l'instant — à brancher plus tard sur une vraie
// structure "plan" (type de séance, statut planifié/réalisé, semaines).

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarCheck,
  Footprints,
  Dumbbell,
  Bike,
  Moon,
  Check,
  Zap,
  Clock,
  CheckCircle2,
  Mountain,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

// --- Référentiels ---

type Kind = "course" | "renfo" | "velo" | "repos";
type Status = "done" | "today" | "planned";

const TYPES: Record<
  Exclude<Kind, "repos">,
  { label: string; color: string; Icon: LucideIcon }
> = {
  // "course" = couleur d'accent du thème (lime). Les autres gardent une
  // couleur distincte pour rester lisibles dans la légende.
  course: { label: "Course à pied", color: "#D8FF3D", Icon: Footprints },
  renfo: { label: "Renfo", color: "#8C7AE0", Icon: Dumbbell },
  velo: { label: "Vélo", color: "#4FB3D9", Icon: Bike },
};

const STATUS: Record<Status, { label: string; Icon: LucideIcon }> = {
  done: { label: "Réalisé", Icon: Check },
  today: { label: "Aujourd'hui", Icon: Zap },
  planned: { label: "Planifié", Icon: Clock },
};

type Day = {
  dn: string;
  d: string;
  kind: Kind;
  title?: string;
  sub?: string;
  met?: string;
  status?: Status;
};

type Week = {
  label: string;
  block: string;
  range: string;
  current?: boolean;
  sum: { count: number; done: number; duration: string; dplus: string };
  days: Day[];
};

// Données fictives (portées depuis la maquette).
const WEEKS: Week[] = [
  {
    label: "Semaine 2",
    block: "Bloc spécifique 2 / 6",
    range: "20 – 26 juin",
    sum: { count: 5, done: 5, duration: "7h20", dplus: "3 900" },
    days: [
      { dn: "LUN", d: "20", kind: "repos" },
      { dn: "MAR", d: "21", kind: "renfo", title: "Renfo trail · Chaîne postérieure", sub: "Renforcement · Ischios & fessiers", met: "45 min · 5 exos · RPE 6", status: "done" },
      { dn: "MER", d: "22", kind: "course", title: "Sortie longue Z2 · Glières", sub: "Course à pied · Endurance", met: "1h40 · 850 D+ · RPE 4", status: "done" },
      { dn: "JEU", d: "23", kind: "velo", title: "Vélo · Travail au seuil", sub: "Vélo · Cardio sans impact", met: "1h15 · RPE 6", status: "done" },
      { dn: "VEN", d: "24", kind: "repos" },
      { dn: "SAM", d: "25", kind: "course", title: "Côtes courtes · 10 × 45 s", sub: "Course à pied · Puissance", met: "1h00 · 420 D+ · RPE 8", status: "done" },
      { dn: "DIM", d: "26", kind: "course", title: "Sortie longue · Bornes", sub: "Course à pied · Endurance fond.", met: "2h40 · 1 380 D+ · RPE 4", status: "done" },
    ],
  },
  {
    label: "Semaine 3",
    block: "Bloc spécifique 3 / 6",
    range: "27 juin – 3 juil",
    current: true,
    sum: { count: 6, done: 4, duration: "8h05", dplus: "3 630" },
    days: [
      { dn: "LUN", d: "27", kind: "repos" },
      { dn: "MAR", d: "28", kind: "renfo", title: "Renfo trail · Descente & gainage", sub: "Renforcement · Force excentrique", met: "50 min · 6 exos · RPE 6", status: "done" },
      { dn: "MER", d: "29", kind: "course", title: "Sortie longue Z2 · Semnoz", sub: "Course à pied · Endurance", met: "1h45 · 900 D+ · RPE 4", status: "done" },
      { dn: "JEU", d: "30", kind: "velo", title: "Vélo · Endurance foncière", sub: "Vélo · Récupération active", met: "1h30 · RPE 3", status: "done" },
      { dn: "VEN", d: "1", kind: "course", title: "Footing de récupération", sub: "Course à pied · Relâchement", met: "40 min · RPE 2", status: "done" },
      { dn: "SAM", d: "2", kind: "course", title: "Fractionné en côte · 6 × 2 min", sub: "Course à pied · VMA ascensionnelle", met: "1h10 · 480 D+ · RPE 8", status: "today" },
      { dn: "DIM", d: "3", kind: "course", title: "Sortie longue · Aravis", sub: "Course à pied · Endurance fond.", met: "2h30 · 1 350 D+ · RPE 3", status: "planned" },
    ],
  },
  {
    label: "Semaine 4",
    block: "Bloc spécifique 4 / 6",
    range: "4 – 10 juil",
    sum: { count: 6, done: 0, duration: "9h40", dplus: "4 500" },
    days: [
      { dn: "LUN", d: "4", kind: "repos" },
      { dn: "MAR", d: "5", kind: "renfo", title: "Renfo trail · Excentrique lourd", sub: "Renforcement · Quadriceps", met: "55 min · 6 exos · RPE 7", status: "planned" },
      { dn: "MER", d: "6", kind: "course", title: "Seuil · 2 × 15 min", sub: "Course à pied · Seuil anaérobie", met: "1h05 · 350 D+ · RPE 7", status: "planned" },
      { dn: "JEU", d: "7", kind: "velo", title: "Vélo · Endurance", sub: "Vélo · Volume sans impact", met: "1h45 · RPE 4", status: "planned" },
      { dn: "VEN", d: "8", kind: "repos" },
      { dn: "SAM", d: "9", kind: "course", title: "Sortie longue · Aravis", sub: "Course à pied · Spécifique D+", met: "2h45 · 1 500 D+ · RPE 5", status: "planned" },
      { dn: "DIM", d: "10", kind: "course", title: "Sortie très longue · Reco CCC", sub: "Course à pied · Reconnaissance", met: "3h30 · 1 800 D+ · RPE 5", status: "planned" },
    ],
  },
  {
    label: "Semaine 5",
    block: "Récupération · 5 / 6",
    range: "11 – 17 juil",
    sum: { count: 4, done: 0, duration: "4h10", dplus: "1 400" },
    days: [
      { dn: "LUN", d: "11", kind: "repos" },
      { dn: "MAR", d: "12", kind: "renfo", title: "Renfo léger · Prévention", sub: "Renforcement · Mobilité & gainage", met: "35 min · 5 exos · RPE 4", status: "planned" },
      { dn: "MER", d: "13", kind: "course", title: "Footing Z2", sub: "Course à pied · Relâchement", met: "50 min · 250 D+ · RPE 3", status: "planned" },
      { dn: "JEU", d: "14", kind: "repos" },
      { dn: "VEN", d: "15", kind: "course", title: "Lignes droites · 8 × 100 m", sub: "Course à pied · Rappel de vitesse", met: "45 min · RPE 6", status: "planned" },
      { dn: "SAM", d: "16", kind: "course", title: "Sortie moyenne · Salève", sub: "Course à pied · Endurance", met: "1h50 · 900 D+ · RPE 4", status: "planned" },
      { dn: "DIM", d: "17", kind: "repos" },
    ],
  },
];

const CURRENT_INDEX = WEEKS.findIndex((w) => w.current);

export function SeancesPlanView() {
  const [wi, setWi] = useState(CURRENT_INDEX >= 0 ? CURRENT_INDEX : 0);
  const week = WEEKS[wi];

  const canPrev = wi > 0;
  const canNext = wi < WEEKS.length - 1;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* ===== En-tête ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Mon plan · CCC 2026
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Séances</h1>
        </div>
        <Link
          href="/seances/nouvelle"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
        >
          <Plus className="size-5" />
          Nouvelle séance
        </Link>
      </div>

      {/* ===== Navigateur de semaine ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-[18px] border border-border bg-card p-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => canPrev && setWi(wi - 1)}
            disabled={!canPrev}
            aria-label="Semaine précédente"
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors enabled:hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold">{week.label}</span>
              {week.current && (
                <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                  En cours
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {week.range} · {week.block}
            </span>
          </div>
          <button
            onClick={() => canNext && setWi(wi + 1)}
            disabled={!canNext}
            aria-label="Semaine suivante"
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors enabled:hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {wi !== CURRENT_INDEX && (
          <button
            onClick={() => setWi(CURRENT_INDEX)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/15 px-3.5 py-2 text-[13px] font-semibold text-primary"
          >
            <CalendarCheck className="size-4" />
            Cette semaine
          </button>
        )}
      </div>

      {/* ===== Légende des types ===== */}
      <div className="flex flex-wrap items-center gap-4 px-0.5">
        {(["course", "renfo", "velo"] as const).map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: TYPES[k].color }}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              {TYPES[k].label}
            </span>
          </div>
        ))}
      </div>

      {/* ===== Récap de la semaine ===== */}
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <SummaryCard Icon={Dumbbell} value={`${week.sum.count}`} unit="séances" label="AU PROGRAMME" />
        <SummaryCard Icon={CheckCircle2} value={`${week.sum.done}`} unit={`/ ${week.sum.count}`} label="RÉALISÉES" />
        <SummaryCard Icon={Clock} value={week.sum.duration} label="VOLUME TOTAL" />
        <SummaryCard Icon={Mountain} value={week.sum.dplus} unit="D+" unitPrimary label="DÉNIVELÉ" />
      </div>

      {/* ===== Liste des jours ===== */}
      <div className="flex flex-col gap-2.5">
        {week.days.map((day) => (
          <DayRow key={day.dn + day.d} day={day} />
        ))}
      </div>
    </main>
  );
}

// --- Carte de récap ---
function SummaryCard({
  Icon,
  value,
  unit,
  unitPrimary,
  label,
}: {
  Icon: LucideIcon;
  value: string;
  unit?: string;
  unitPrimary?: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] border border-border bg-card px-4 py-3.5">
      <Icon className="size-5 text-primary" />
      <span className="text-2xl font-bold tabular-nums">
        {value}
        {unit && (
          <span
            className={cn(
              "ml-1 text-[13px] font-medium",
              unitPrimary ? "text-primary" : "text-muted-foreground"
            )}
          >
            {unit}
          </span>
        )}
      </span>
      <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// --- Ligne d'un jour (repos ou séance) ---
function DayRow({ day }: { day: Day }) {
  const isRepos = day.kind === "repos";
  const isToday = day.status === "today";
  const isDone = day.status === "done";
  const type = isRepos ? null : TYPES[day.kind as Exclude<Kind, "repos">];
  const color = type?.color ?? "#6E6759";

  return (
    <div className="flex items-stretch gap-3.5">
      {/* Colonne date */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-0.5 pt-3.5">
        <span
          className="font-mono text-[10px] tracking-[0.1em]"
          style={{ color: isToday ? color : undefined }}
        >
          <span className={isToday ? "" : "text-muted-foreground"}>{day.dn}</span>
        </span>
        <span
          className={cn(
            "text-[22px] font-bold tabular-nums",
            !isToday && (isDone || isRepos ? "text-muted-foreground" : "text-foreground")
          )}
          style={{ color: isToday ? color : undefined }}
        >
          {day.d}
        </span>
      </div>

      {/* Repos */}
      {isRepos ? (
        <div className="flex flex-1 items-center gap-3.5 rounded-2xl border border-dashed border-border bg-background px-4 py-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card">
            <Moon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-muted-foreground">
              Repos
            </span>
            <span className="text-xs text-muted-foreground/70">
              Récupération — pas de séance prévue
            </span>
          </div>
        </div>
      ) : (
        // Séance
        <div
          className={cn(
            "flex flex-1 items-start gap-3.5 rounded-2xl border p-3.5",
            isDone ? "border-border/60 bg-card/60" : "border-border bg-card"
          )}
          style={{
            borderLeft: `3px solid ${color}`,
            ...(isToday
              ? { borderColor: `${color}80`, boxShadow: `0 0 0 3px ${color}22` }
              : {}),
          }}
        >
          {/* Icône type */}
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: isDone ? undefined : `${color}22` }}
          >
            {type && (
              <type.Icon
                className="size-5"
                style={{ color: isDone ? undefined : color }}
              />
            )}
          </div>

          {/* Contenu */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-block size-[7px] shrink-0 rounded-full"
                style={{ background: color }}
              />
              <span
                className={cn(
                  "text-[15px] font-semibold",
                  isDone ? "text-foreground/80" : "text-foreground"
                )}
              >
                {day.title}
              </span>
              <StatusBadge status={day.status!} />
            </div>
            <span className="text-[13px] text-muted-foreground">{day.sub}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {day.met}
            </span>
          </div>

          <ChevronRight className="size-5 shrink-0 self-center text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// --- Badge de statut ---
function StatusBadge({ status }: { status: Status }) {
  const { label, Icon } = STATUS[status];
  const classes: Record<Status, string> = {
    done: "border border-border text-muted-foreground",
    today: "bg-primary text-primary-foreground",
    planned: "bg-secondary text-foreground/80",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em]",
        classes[status]
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
