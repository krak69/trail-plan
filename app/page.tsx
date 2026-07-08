import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

// Page d'accueil = tableau de bord PROTÉGÉ.
// Le middleware bloque déjà les non-connectés, mais on revérifie ici
// (défense en profondeur) et on récupère les infos de l'utilisateur.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Prénom saisi à l'inscription (stocké dans user_metadata), sinon null.
  const firstName = user.user_metadata?.first_name as string | undefined;

  // Server Action de déconnexion, définie inline (pratique pour un petit form).
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
        TP
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {firstName ? (
            <>
              Salut <span className="text-primary">{firstName}</span> 👋
            </>
          ) : (
            <>
              Bienvenue sur <span className="text-primary">Trail Plan</span>
            </>
          )}
        </h1>
        <p className="text-muted-foreground">Tu es connecté en tant que</p>
        {/* Email en mono pour l'aspect "donnée technique" */}
        <p className="font-mono text-sm text-foreground">{user.email}</p>
      </div>

      <form action={signOut}>
        <Button variant="outline" type="submit">
          Se déconnecter
        </Button>
      </form>
    </main>
  );
}
