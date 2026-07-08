import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ExerciseLibrary } from "@/components/banque/exercise-library";
import type { Exercise } from "@/lib/types";

// Banque d'exercices — lit la table `exercises` (RLS : catalogue public + tes exos).
export default async function BanquePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Le RLS filtre déjà : on récupère les exercices publics ET ceux de l'utilisateur.
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("category")
    .order("name");

  return <ExerciseLibrary exercises={(data ?? []) as Exercise[]} />;
}
