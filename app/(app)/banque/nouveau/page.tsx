import { createExercise } from "../actions";
import { ExerciseForm } from "@/components/banque/exercise-form";

export default function NouvelExercicePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <ExerciseForm
      title="Nouvel exercice"
      action={createExercise}
      submitLabel="Enregistrer l'exercice"
      error={searchParams.error}
    />
  );
}
