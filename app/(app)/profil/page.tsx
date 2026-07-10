import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { ProfilView } from "@/components/profil/profil-view";
import { signOut } from "../actions";
import { togglePref } from "./actions";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Récupère le profil ; le crée s'il n'existe pas (comptes antérieurs au trigger).
  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        first_name: (user.user_metadata?.first_name as string) ?? null,
        last_name: (user.user_metadata?.last_name as string) ?? null,
      })
      .select("*")
      .single();
    profile = created;
  }

  const p = profile as Profile;
  const fullName =
    `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || (user.email ?? "Athlète");
  const initials =
    `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() ||
    (user.email?.[0]?.toUpperCase() ?? "?");

  return (
    <ProfilView
      profile={p}
      fullName={fullName}
      initials={initials}
      signOutAction={signOut}
      togglePrefAction={togglePref}
    />
  );
}
