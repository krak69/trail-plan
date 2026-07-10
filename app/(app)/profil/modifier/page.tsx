import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "../actions";

const selectClasses =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function Field({ id, label, defaultValue, placeholder, type = "text" }: { id: string; label: string; defaultValue?: string | number | null; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        // step="any" : autorise les décimales (VMA 16,5 / poids) — sinon la
        // validation HTML (step=1 par défaut) bloque la soumission du formulaire.
        step={type === "number" ? "any" : undefined}
        inputMode={type === "number" ? "decimal" : undefined}
      />
    </div>
  );
}

export default async function ModifierProfilPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const p = (data ?? {}) as Partial<Profile>;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:px-8">
      <Link href="/profil" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Retour au profil
      </Link>

      <form action={updateProfile} className="flex flex-col gap-4">
        {/* Identité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identité</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="first_name" label="Prénom" defaultValue={p.first_name} />
              <Field id="last_name" label="Nom" defaultValue={p.last_name} />
              <Field id="city" label="Ville" defaultValue={p.city} placeholder="Annecy" />
              <Field id="experience_level" label="Expérience" defaultValue={p.experience_level} placeholder="Ultra trail" />
            </div>
          </CardContent>
        </Card>

        {/* Physiologie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Données physiologiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="vma" label="VMA (km/h)" defaultValue={p.vma} type="number" placeholder="16.5" />
              <Field id="vo2max" label="VO2max (ml/kg)" defaultValue={p.vo2max} type="number" placeholder="52" />
              <Field id="fc_max" label="FC max (bpm)" defaultValue={p.fc_max} type="number" placeholder="186" />
              <Field id="fc_rest" label="FC repos (bpm)" defaultValue={p.fc_rest} type="number" placeholder="44" />
              <Field id="threshold_pace" label="Allure seuil (/km)" defaultValue={p.threshold_pace} placeholder="4:35" />
              <Field id="ftp" label="FTP vélo (W)" defaultValue={p.ftp} type="number" placeholder="265" />
              <Field id="weight_kg" label="Poids (kg)" defaultValue={p.weight_kg} type="number" placeholder="68" />
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Préférences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="units">Unités</Label>
                <select id="units" name="units" defaultValue={p.units ?? "metric"} className={selectClasses}>
                  <option value="metric">Métrique (km, m)</option>
                  <option value="imperial">Impérial (mi, ft)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="language">Langue</Label>
                <select id="language" name="language" defaultValue={p.language ?? "fr"} className={selectClasses}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {searchParams.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{searchParams.error}</p>
        )}

        <Button type="submit" className="w-full">
          Enregistrer
        </Button>
      </form>
    </main>
  );
}
