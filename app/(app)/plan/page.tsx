import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentObjective,
  daysUntil,
  formatFrDate,
  formatRaceMetrics,
  formatTargetTime,
} from "@/lib/objectives";
import { PlanView } from "@/components/plan/plan-view";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const objective = await getCurrentObjective(supabase);

  // On prépare les chaînes d'affichage côté serveur (J-XX stable, pas de mismatch).
  const objectiveView = objective
    ? {
        name: objective.name,
        subtitle: objective.subtitle,
        dateLine: [
          formatFrDate(objective.race_date),
          formatRaceMetrics(objective.distance_km, objective.elevation_gain_m),
          objective.target_time ? `objectif ${formatTargetTime(objective.target_time)}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        jminus: daysUntil(objective.race_date),
        priority: objective.priority ?? "A",
      }
    : null;

  return <PlanView objectiveView={objectiveView} />;
}
