import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trash2, Mountain, Route, Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Session } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteSession } from "./seances/actions";

// --- Petits utilitaires d'affichage ---

// "2026-07-08" -> "mar. 8 juil." (on force midi pour éviter les décalages TZ).
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

// Accueil = tableau de bord protégé (le middleware bloque déjà les non-connectés).
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const firstName = user.user_metadata?.first_name as string | undefined;

  // Récupère les séances de l'utilisateur (RLS garantit qu'il ne voit que les siennes).
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  const sessions = (data ?? []) as Session[];

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-8">
      {/* En-tête */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Salut</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {firstName ?? "Trail Plan"}
          </h1>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            Déconnexion
          </Button>
        </form>
      </header>

      {/* Bouton d'ajout */}
      <Button asChild className="w-full">
        <Link href="/seances/nouvelle">
          <Plus className="size-4" />
          Ajouter une séance
        </Link>
      </Button>

      {/* Message si la table n'existe pas encore (avant d'avoir lancé le SQL) */}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Impossible de charger les séances : {error.message}
        </p>
      )}

      {/* Liste des séances ou état vide */}
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
                      {/* Date */}
                      <p className="font-medium capitalize">
                        {formatDate(s.date)}
                        {s.feeling ? (
                          <span className="ml-2">{FEELING_EMOJI[s.feeling]}</span>
                        ) : null}
                      </p>

                      {/* Stats en police mono */}
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

                      {/* Notes éventuelles */}
                      {s.notes && (
                        <p className="text-sm text-muted-foreground">{s.notes}</p>
                      )}
                    </div>

                    {/* Suppression */}
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
