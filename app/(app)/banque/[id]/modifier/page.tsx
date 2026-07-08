import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types";
import { ExerciseForm } from "@/components/banque/exercise-form";
import { updateExercise } from "../../actions";

export default async function ModifierExercicePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("exercises").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const ex = data as Exercise;

  // Seul le propriétaire peut éditer (le catalogue public n'est pas modifiable).
  if (ex.user_id !== user.id) redirect(`/banque/${ex.id}`);

  return (
    <ExerciseForm
      title="Modifier l'exercice"
      action={updateExercise}
      submitLabel="Enregistrer"
      values={ex}
      hiddenId={ex.id}
      error={searchParams.error}
      backHref={`/banque/${ex.id}`}
    />
  );
}
