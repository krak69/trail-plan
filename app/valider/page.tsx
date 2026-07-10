import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ValiderFlow } from "@/components/seances/valider-flow";
import { validateSession } from "./actions";

// Flux de validation d'une séance ciblée par ?s=<id> — plein écran (hors coquille).
export default async function ValiderPage({
  searchParams,
}: {
  searchParams: { s?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = searchParams.s;
  if (!id) redirect("/seances");

  const { data } = await supabase
    .from("training_sessions")
    .select("id, title")
    .eq("id", id)
    .single();
  if (!data) redirect("/seances");

  return (
    <ValiderFlow
      sessionId={data.id}
      sessionTitle={data.title ?? "Séance"}
      validateAction={validateSession}
    />
  );
}
