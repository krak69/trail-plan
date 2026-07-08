import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "@/lib/types";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const CATEGORIES = [
  ["quadriceps", "Quadriceps"],
  ["gainage", "Gainage"],
  ["fessiers", "Fessiers"],
  ["mollets", "Mollets"],
  ["proprio", "Proprioception"],
  ["mobilite", "Mobilité"],
];

// Formulaire partagé création / édition d'un exercice.
// `action` = Server Action (createExercise ou updateExercise).
export function ExerciseForm({
  title,
  action,
  submitLabel,
  values,
  hiddenId,
  error,
  backHref = "/banque",
}: {
  title: string;
  action: (formData: FormData) => void;
  submitLabel: string;
  values?: Partial<Exercise>;
  hiddenId?: string;
  error?: string;
  backHref?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:px-8">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Retour
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            {hiddenId && <input type="hidden" name="id" value={hiddenId} />}

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" defaultValue={values?.name ?? ""} placeholder="Fentes bulgares" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <select id="category" name="category" defaultValue={values?.category ?? ""} className={selectClasses} required>
                <option value="" disabled>
                  Choisir…
                </option>
                {CATEGORIES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="muscles">Muscles (séparés par des virgules)</Label>
              <Input id="muscles" name="muscles" defaultValue={values?.muscles?.join(", ") ?? ""} placeholder="Quadriceps, Fessiers" />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="metric_value">Valeur</Label>
                <Input id="metric_value" name="metric_value" defaultValue={values?.metric_value ?? ""} placeholder="12" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="metric_unit">Unité</Label>
                <Input id="metric_unit" name="metric_unit" defaultValue={values?.metric_unit ?? ""} placeholder="rép / jambe" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tempo_tag">Tempo / tag (optionnel)</Label>
              <Input id="tempo_tag" name="tempo_tag" defaultValue={values?.tempo_tag ?? ""} placeholder="Excentrique 3s" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cue">Consigne</Label>
              <Textarea id="cue" name="cue" defaultValue={values?.cue ?? ""} placeholder="Descente lente et contrôlée, genou dans l'axe du pied." />
            </div>

            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            <Button type="submit" formAction={action} className="mt-2 w-full">
              {submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
