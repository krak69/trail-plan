import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, ImageIcon, BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { deleteExercise } from "../actions";

const LIME = "#D8FF3D";
const CATEGORY_LABELS: Record<string, string> = {
  quadriceps: "Quadriceps",
  gainage: "Gainage",
  fessiers: "Fessiers",
  mollets: "Mollets",
  proprio: "Proprioception",
  mobilite: "Mobilité",
};

export default async function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS : renvoie l'exercice s'il est public ou s'il appartient à l'utilisateur.
  const { data } = await supabase.from("exercises").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const ex = data as Exercise;
  const owned = ex.user_id === user.id;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8">
      <Link href="/banque" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Retour à la banque
      </Link>

      {/* Image placeholder */}
      <div
        className="relative flex h-40 flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border border-border"
        style={{ background: "#14110B" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: `repeating-linear-gradient(115deg, ${LIME}10 0 2px, transparent 2px 13px)` }}
        />
        <ImageIcon className="relative size-9" style={{ color: LIME, opacity: 0.8 }} />
        <span className="relative font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
          DÉMO · BANQUE D'EXERCICES
        </span>
      </div>

      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-foreground/80">
              {CATEGORY_LABELS[ex.category] ?? ex.category}
            </span>
            {ex.is_public ? (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <BookOpen className="size-3" />
                Catalogue
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Perso</span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{ex.name}</h1>
          {ex.metric_value && (
            <span className="font-mono text-lg font-bold" style={{ color: LIME }}>
              {ex.metric_value} <span className="text-sm font-medium text-muted-foreground">{ex.metric_unit}</span>
            </span>
          )}
        </div>

        {/* Actions (uniquement pour ses propres exercices) */}
        {owned && (
          <div className="flex gap-2.5">
            <Button asChild variant="outline">
              <Link href={`/banque/${ex.id}/modifier`}>
                <Pencil className="size-4" />
                Modifier
              </Link>
            </Button>
            <form action={deleteExercise}>
              <input type="hidden" name="id" value={ex.id} />
              <Button type="submit" variant="ghost" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
                Supprimer
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Muscles */}
      {ex.muscles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ex.muscles.map((m) => (
            <span key={m} className="rounded-lg bg-secondary px-3 py-1.5 font-mono text-xs text-foreground/80">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Tempo */}
      {ex.tempo_tag && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Tempo / focus</span>
          <span className="font-medium" style={{ color: LIME }}>{ex.tempo_tag}</span>
        </div>
      )}

      {/* Consigne */}
      {ex.cue && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Consigne</span>
          <p className="leading-relaxed text-foreground/80">{ex.cue}</p>
        </div>
      )}

      {ex.is_public && (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          Exercice du catalogue partagé — non modifiable. Crée ta propre version depuis la banque si tu veux l'adapter.
        </p>
      )}
    </main>
  );
}
