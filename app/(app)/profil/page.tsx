import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProfilView } from "@/components/profil/profil-view";
import { signOut } from "../actions";

// Profil : nom/initiales issus du vrai compte, reste en données d'exemple.
export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const firstName = (user.user_metadata?.first_name as string) ?? "";
  const lastName = (user.user_metadata?.last_name as string) ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || (user.email ?? "Athlète");
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() ||
    (user.email?.[0]?.toUpperCase() ?? "?");

  return <ProfilView fullName={fullName} initials={initials} signOutAction={signOut} />;
}
