import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app-shell/sidebar";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { signOut } from "./actions";

// Layout partagé par toutes les pages authentifiées (Dashboard, Séances, …).
// Il fournit la coquille : sidebar (desktop) + barre d'onglets (mobile).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Infos d'affichage de l'utilisateur (prénom, initiales) pour la carte profil.
  const firstName = (user.user_metadata?.first_name as string) ?? "";
  const lastName = (user.user_metadata?.last_name as string) ?? "";
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() ||
    (user.email?.[0]?.toUpperCase() ?? "?");

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        firstName={firstName || "Athlète"}
        initials={initials}
        // Ligne secondaire de la carte profil (donnée d'exemple pour l'instant).
        profileLine="Trail runner"
        signOutAction={signOut}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {children}
        {/* Espace réservé pour ne pas masquer le contenu sous la barre mobile. */}
        <div className="h-[72px] shrink-0 lg:hidden" />
      </div>

      <BottomNav />
    </div>
  );
}
