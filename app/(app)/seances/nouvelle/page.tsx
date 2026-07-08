import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createSession } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Classes communes aux <select> natifs, pour matcher le style des Input.
const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function NouvelleSeancePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Date du jour au format YYYY-MM-DD pour pré-remplir le champ date.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-8">
      {/* Barre de retour */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Retour
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nouvelle séance</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>

            {/* Distance + D+ côte à côte */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="distance_km">Distance (km)</Label>
                <Input
                  id="distance_km"
                  name="distance_km"
                  type="number"
                  step="0.1"
                  min="0"
                  inputMode="decimal"
                  placeholder="12.4"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="elevation_gain_m">D+ (m)</Label>
                <Input
                  id="elevation_gain_m"
                  name="elevation_gain_m"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="860"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="duration_min">Durée (minutes)</Label>
              <Input
                id="duration_min"
                name="duration_min"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="72"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="feeling">Ressenti</Label>
              {/* Select natif (pas de dépendance radix), stylé comme un Input. */}
              <select
                id="feeling"
                name="feeling"
                defaultValue=""
                className={selectClasses}
              >
                <option value="">—</option>
                <option value="1">1 · Très dur 😫</option>
                <option value="2">2 · Dur 😕</option>
                <option value="3">3 · Correct 🙂</option>
                <option value="4">4 · Bien 😃</option>
                <option value="5">5 · Excellent 🤩</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Parcours, météo, sensations…"
              />
            </div>

            {searchParams.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {searchParams.error}
              </p>
            )}

            <Button type="submit" formAction={createSession} className="mt-2 w-full">
              Enregistrer la séance
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
