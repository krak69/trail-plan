import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trash2, Mountain, Route, Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Session } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteSession } from "./actions";

// --- Utilitaires d'affichage ---

// "2026-07-08" -> "mer. 8 juil." (midi forcé pour éviter les décalages TZ).
function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// 72 -> "1h12", 45 -> "45min"
function formatDuration(min: number | null): string | null {
  if (min == null) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

const FEELING_EMOJI: Record<number, string> = {
  1: "😫",
  2: "😕",
  3: "🙂",
  4: "😃",
  5: "🤩",
};

export default async function SeancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  const sessions = (data ?? []) as Session[];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8">
      {/* En-tête de page */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Journal
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Mes séances
          </h1>
        </div>
        <Button asChild>
          <Link href="/seances/nouvelle">
            <Plus className="size-4" />
            Ajouter
          </Link>
        </Button>
      </header>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Impossible de charger les séances : {error.message}
        </p>
      )}

      {sessions.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
          <Mountain className="mx-auto mb-3 size-8 opacity-50" />
          <p>Aucune séance pour l&apos;instant.</p>
          <p className="text-sm">Ajoute ta première sortie !</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => {
            const duration = formatDuration(s.duration_min);
            return (
              <li key={s.id}>
                <Card>
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="flex flex-col gap-2">
                      <p className="font-medium capitalize">
                        {formatDate(s.date)}
                        {s.feeling ? (
                          <span className="ml-2">{FEELING_EMOJI[s.feeling]}</span>
                        ) : null}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-muted-foreground">
                        {s.distance_km != null && (
                          <span className="inline-flex items-center gap-1">
                            <Route className="size-3.5 text-primary" />
                            {s.distance_km} km
                          </span>
                        )}
                        {s.elevation_gain_m != null && (
                          <span className="inline-flex items-center gap-1">
                            <Mountain className="size-3.5 text-primary" />
                            {s.elevation_gain_m} D+
                          </span>
                        )}
                        {duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5 text-primary" />
                            {duration}
                          </span>
                        )}
                      </div>
                      {s.notes && (
                        <p className="text-sm text-muted-foreground">{s.notes}</p>
                      )}
                    </div>
                    <form action={deleteSession}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="submit"
                        aria-label="Supprimer la séance"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
