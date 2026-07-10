import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Trash2, Flag, Clock, Route, Mountain, Flame, CheckCircle2, Footprints, Dumbbell, Bike, Moon, type LucideIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { TrainingSession } from "@/lib/types";
import { formatFrDate } from "@/lib/objectives";
import { Button } from "@/components/ui/button";
import { deleteSession } from "../actions";

const KIND: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  course: { label: "Course à pied", color: "#D8FF3D", Icon: Footprints },
  renfo: { label: "Renfo", color: "#8C7AE0", Icon: Dumbbell },
  velo: { label: "Vélo", color: "#4FB3D9", Icon: Bike },
  repos: { label: "Repos", color: "#6E6759", Icon: Moon },
};

function fmtDuration(min: number | null): string | null {
  if (min == null) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h === 0 ? `${m} min` : `${h}h${String(m).padStart(2, "0")}`;
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("training_sessions").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const s = data as TrainingSession;
  const k = KIND[s.kind] ?? KIND.repos;
  const done = s.status === "done";

  // Métriques à afficher (réelles si réalisé, sinon planifiées).
  const metrics = [
    { Icon: Clock, label: "DURÉE", value: fmtDuration(done ? s.actual_duration_min : s.planned_duration_min) },
    { Icon: Route, label: "DISTANCE", value: (done ? s.actual_distance_km : s.planned_distance_km) != null ? `${done ? s.actual_distance_km : s.planned_distance_km} km` : null },
    { Icon: Mountain, label: "DÉNIVELÉ", value: (done ? s.actual_elevation_gain_m : s.planned_elevation_m) != null ? `${done ? s.actual_elevation_gain_m : s.planned_elevation_m} D+` : null },
    { Icon: Flame, label: done ? "RPE RESSENTI" : "RPE CIBLE", value: (done ? s.felt_rpe : s.target_rpe) != null ? `${done ? s.felt_rpe : s.target_rpe}/10` : null },
  ].filter((m) => m.value != null);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link href="/seances" className="flex items-center gap-2 hover:text-foreground">
          <ArrowLeft className="size-4" />
          Séances
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground/80">{s.title ?? "Séance"}</span>
      </div>

      {/* Titre + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: k.color, color: "#0B0A07" }}>
              <k.Icon className="size-3.5" />
              {k.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground capitalize">{formatFrDate(s.date)}</span>
            <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold" style={done ? { background: k.color, color: "#0B0A07" } : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
              {done ? "Réalisée" : "Planifiée"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{s.title ?? "Séance"}</h1>
          {s.subtitle && <span className="text-sm text-muted-foreground">{s.subtitle}</span>}
          {s.block_label && <span className="font-mono text-[11px] text-muted-foreground">{s.block_label}</span>}
        </div>
        <form action={deleteSession}>
          <input type="hidden" name="id" value={s.id} />
          <Button type="submit" variant="ghost" className="text-muted-foreground hover:text-destructive">
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        </form>
      </div>

      {/* Objectif de la séance */}
      {s.objective_text && (
        <section className="relative overflow-hidden rounded-[22px] border p-5 sm:p-6" style={{ borderColor: `${k.color}47`, background: "hsl(var(--card))" }}>
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${k.color}29` }}>
              <Flag className="size-6" style={{ color: k.color }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: k.color }}>Objectif de la séance</span>
              <p className="max-w-[70ch] text-base font-medium leading-relaxed">{s.objective_text}</p>
            </div>
          </div>
        </section>
      )}

      {/* Métriques */}
      {metrics.length > 0 && (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-2 rounded-[18px] border border-border bg-card p-4">
              <m.Icon className="size-5" style={{ color: k.color }} />
              <span className="text-2xl font-bold tabular-nums">{m.value}</span>
              <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {s.notes && (
        <section className="flex flex-col gap-2 rounded-[18px] border border-border bg-card p-5">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Notes</span>
          <p className="leading-relaxed text-foreground/80">{s.notes}</p>
        </section>
      )}

      {/* Bandeau de validation pour une séance planifiée */}
      {!done && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">Séance pas encore validée.</span>
          <Button asChild>
            <Link href="/valider">
              <CheckCircle2 className="size-4" />
              Valider la séance
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
