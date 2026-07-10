"use client";

// Vue "plan hebdomadaire" des séances — branchée sur les vraies training_sessions
// (regroupées par semaine côté serveur, voir lib/weeks.ts). Navigation de semaine.
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
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { WeekView, DayCell, Kind, DayStatus } from "@/lib/weeks";

const TYPES: Record<Exclude<Kind, "repos">, { label: string; color: string; Icon: LucideIcon }> = {
  course: { label: "Course à pied", color: "#D8FF3D", Icon: Footprints },
  renfo: { label: "Renfo", color: "#8C7AE0", Icon: Dumbbell },
  velo: { label: "Vélo", color: "#4FB3D9", Icon: Bike },
};

const STATUS: Record<DayStatus, { label: string; Icon: LucideIcon }> = {
  done: { label: "Réalisé", Icon: Check },
  today: { label: "Aujourd'hui", Icon: Zap },
  planned: { label: "Planifié", Icon: Clock },
};

export function SeancesPlanView({
  weeks,
  currentIndex,
  deleteAction,
}: {
  weeks: WeekView[];
  currentIndex: number;
  deleteAction: (formData: FormData) => void;
}) {
  const [wi, setWi] = useState(currentIndex);
  const week = weeks[wi];

  const canPrev = wi > 0;
  const canNext = wi < weeks.length - 1;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Mon plan</span>
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

      {/* Navigateur de semaine */}
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
              {week.range}
              {week.block ? ` · ${week.block}` : ""}
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

        {wi !== currentIndex && (
          <button
            onClick={() => setWi(currentIndex)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/15 px-3.5 py-2 text-[13px] font-semibold text-primary"
          >
            <CalendarCheck className="size-4" />
            Cette semaine
          </button>
        )}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 px-0.5">
        {(["course", "renfo", "velo"] as const).map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: TYPES[k].color }} />
            <span className="font-mono text-[11px] text-muted-foreground">{TYPES[k].label}</span>
          </div>
        ))}
      </div>

      {/* Récap de la semaine */}
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <SummaryCard Icon={Dumbbell} value={`${week.sum.count}`} unit="séances" label="AU PROGRAMME" />
        <SummaryCard Icon={CheckCircle2} value={`${week.sum.done}`} unit={`/ ${week.sum.count}`} label="RÉALISÉES" />
        <SummaryCard Icon={Clock} value={week.sum.duration} label="VOLUME TOTAL" />
        <SummaryCard Icon={Mountain} value={week.sum.dplus} unit="D+" unitPrimary label="DÉNIVELÉ" />
      </div>

      {/* Liste des jours */}
      <div className="flex flex-col gap-2.5">
        {week.days.map((day) => (
          <DayRow key={day.date} day={day} deleteAction={deleteAction} />
        ))}
      </div>
    </main>
  );
}

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
          <span className={cn("ml-1 text-[13px] font-medium", unitPrimary ? "text-primary" : "text-muted-foreground")}>
            {unit}
          </span>
        )}
      </span>
      <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{label}</span>
    </div>
  );
}

function DayRow({ day, deleteAction }: { day: DayCell; deleteAction: (formData: FormData) => void }) {
  const isRepos = day.kind === "repos" || !day.session;
  const type = isRepos ? null : TYPES[day.kind as Exclude<Kind, "repos">];
  const color = type?.color ?? "#6E6759";
  const s = day.session;
  const isToday = s?.status === "today";
  const isDone = s?.status === "done";

  return (
    <div className="flex items-stretch gap-3.5">
      {/* Colonne date */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-0.5 pt-3.5">
        <span className="font-mono text-[10px] tracking-[0.1em]" style={{ color: isToday ? color : undefined }}>
          <span className={isToday ? "" : "text-muted-foreground"}>{day.dn}</span>
        </span>
        <span
          className={cn("text-[22px] font-bold tabular-nums", !isToday && (isDone || isRepos ? "text-muted-foreground" : "text-foreground"))}
          style={{ color: isToday ? color : undefined }}
        >
          {day.d}
        </span>
      </div>

      {isRepos || !s ? (
        <div className="flex flex-1 items-center gap-3.5 rounded-2xl border border-dashed border-border bg-background px-4 py-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card">
            <Moon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-muted-foreground">Repos</span>
            <span className="text-xs text-muted-foreground/70">Récupération — pas de séance prévue</span>
          </div>
        </div>
      ) : (
        <div
          className={cn("flex flex-1 items-stretch overflow-hidden rounded-2xl border", isDone ? "border-border/60 bg-card/60" : "border-border bg-card")}
          style={{
            borderLeft: `3px solid ${color}`,
            ...(isToday ? { borderColor: `${color}80`, boxShadow: `0 0 0 3px ${color}22` } : {}),
          }}
        >
          {/* Zone cliquable → détail */}
          <Link href={`/seances/${s.id}`} className="flex min-w-0 flex-1 items-start gap-3.5 p-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: isDone ? undefined : `${color}22` }}>
              {type && <type.Icon className="size-5" style={{ color: isDone ? undefined : color }} />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block size-[7px] shrink-0 rounded-full" style={{ background: color }} />
                <span className={cn("text-[15px] font-semibold", isDone ? "text-foreground/80" : "text-foreground")}>{s.title}</span>
                <StatusBadge status={s.status} />
              </div>
              {s.subtitle && <span className="text-[13px] text-muted-foreground">{s.subtitle}</span>}
              {s.metrics && <span className="font-mono text-[11px] text-muted-foreground">{s.metrics}</span>}
            </div>
          </Link>

          {/* Suppression (hors du lien) */}
          <form action={deleteAction} className="flex items-center pr-2">
            <input type="hidden" name="id" value={s.id} />
            <button
              type="submit"
              aria-label="Supprimer la séance"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DayStatus }) {
  const { label, Icon } = STATUS[status];
  const classes: Record<DayStatus, string> = {
    done: "border border-border text-muted-foreground",
    today: "bg-primary text-primary-foreground",
    planned: "bg-secondary text-foreground/80",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em]", classes[status])}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}
