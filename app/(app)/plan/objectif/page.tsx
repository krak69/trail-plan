import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentObjective } from "@/lib/objectives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveObjective } from "../actions";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default async function ObjectifPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const obj = await getCurrentObjective(supabase);
  const [th = "", tm = "", ts = ""] = (obj?.target_time ?? "").split(":");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8">
      <Link href="/plan" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Retour au plan
      </Link>

      <form action={saveObjective} className="flex flex-col gap-4">
        {obj && <input type="hidden" name="id" value={obj.id} />}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{obj ? "Modifier l'objectif" : "Nouvel objectif"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom de la course</Label>
              <Input id="name" name="name" defaultValue={obj?.name ?? ""} placeholder="CCC · UTMB" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input id="subtitle" name="subtitle" defaultValue={obj?.subtitle ?? ""} placeholder="Courmayeur – Champex – Chamonix" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="race_date">Date de la course</Label>
                <Input id="race_date" name="race_date" type="date" defaultValue={obj?.race_date ?? ""} style={{ colorScheme: "dark" }} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan_start_date">Début du plan</Label>
                <Input id="plan_start_date" name="plan_start_date" type="date" defaultValue={obj?.plan_start_date ?? ""} style={{ colorScheme: "dark" }} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="distance_km">Distance (km)</Label>
                <Input id="distance_km" name="distance_km" type="number" step="any" inputMode="decimal" defaultValue={obj?.distance_km ?? ""} placeholder="101" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="elevation_gain_m">D+ (m)</Label>
                <Input id="elevation_gain_m" name="elevation_gain_m" type="number" step="any" inputMode="numeric" defaultValue={obj?.elevation_gain_m ?? ""} placeholder="6100" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Temps visé (HH:MM:SS)</Label>
              <div className="flex items-center gap-1.5">
                <Input name="target_h" defaultValue={th} maxLength={2} className="text-center" placeholder="17" />
                <span className="text-muted-foreground">:</span>
                <Input name="target_m" defaultValue={tm} maxLength={2} className="text-center" placeholder="30" />
                <span className="text-muted-foreground">:</span>
                <Input name="target_s" defaultValue={ts} maxLength={2} className="text-center" placeholder="00" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Priorité</Label>
              <select id="priority" name="priority" defaultValue={obj?.priority ?? "A"} className={selectClasses}>
                <option value="A">Priorité A (objectif principal)</option>
                <option value="B">Priorité B</option>
                <option value="C">Priorité C</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {searchParams.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{searchParams.error}</p>
        )}

        <Button type="submit" className="w-full">
          {obj ? "Enregistrer" : "Créer l'objectif"}
        </Button>
      </form>
    </main>
  );
}
