import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { TrainingSession } from "@/lib/types";
import { buildWeeks } from "@/lib/weeks";
import { SeancesPlanView } from "@/components/seances/plan-view";
import { deleteSession } from "./actions";

// Écran Séances = vue "plan hebdomadaire" branchée sur les vraies training_sessions.
export default async function SeancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("training_sessions")
    .select("*")
    .order("date", { ascending: true });

  const { weeks, currentIndex } = buildWeeks((data ?? []) as TrainingSession[]);

  return <SeancesPlanView weeks={weeks} currentIndex={currentIndex} deleteAction={deleteSession} />;
}
