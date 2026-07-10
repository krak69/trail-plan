import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createSession } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function NouvelleSeancePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:px-8">
      <Link href="/seances" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Retour aux séances
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nouvelle séance</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSession} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={today} style={{ colorScheme: "dark" }} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="kind">Type</Label>
                <select id="kind" name="kind" defaultValue="course" className={selectClasses} required>
                  <option value="course">Course à pied</option>
                  <option value="renfo">Renfo</option>
                  <option value="velo">Vélo</option>
                  <option value="repos">Repos</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" placeholder="Sortie longue · Aravis" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input id="subtitle" name="subtitle" placeholder="Course à pied · Endurance fondamentale" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="planned_duration_min">Durée (min)</Label>
                <Input id="planned_duration_min" name="planned_duration_min" type="number" step="any" inputMode="numeric" placeholder="150" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="planned_distance_km">Distance (km)</Label>
                <Input id="planned_distance_km" name="planned_distance_km" type="number" step="any" inputMode="decimal" placeholder="24" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="planned_elevation_m">D+ (m)</Label>
                <Input id="planned_elevation_m" name="planned_elevation_m" type="number" step="any" inputMode="numeric" placeholder="1350" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="target_rpe">RPE cible (1–10)</Label>
                <Input id="target_rpe" name="target_rpe" type="number" min="1" max="10" step="1" inputMode="numeric" placeholder="4" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Statut</Label>
                <select id="status" name="status" defaultValue="planned" className={selectClasses}>
                  <option value="planned">Planifiée</option>
                  <option value="done">Réalisée</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="block_label">Bloc (optionnel)</Label>
              <Input id="block_label" name="block_label" placeholder="Bloc spécifique 3/6" />
            </div>

            {searchParams.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{searchParams.error}</p>
            )}

            <Button type="submit" className="mt-2 w-full">
              Enregistrer la séance
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
