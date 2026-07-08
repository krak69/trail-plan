import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { RenfoPlayer } from "@/components/seances/renfo-player";

// Lecteur "réaliser la séance" — plein écran (hors coquille sidebar/bottom-nav).
// Protégé : on revérifie l'utilisateur (le middleware protège déjà la route).
export default async function RealiserPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <RenfoPlayer />;
}
