import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ValiderFlow } from "@/components/seances/valider-flow";

// Flux de validation d'une séance — plein écran (hors coquille).
export default async function ValiderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ValiderFlow />;
}
