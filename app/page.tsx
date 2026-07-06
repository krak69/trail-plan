import { Button } from "@/components/ui/button";

// Page d'accueil minimale : sert uniquement à VALIDER LA CHAÎNE
// (fonts Space Grotesk + JetBrains Mono, couleurs charbon/amber, shadcn Button).
// Elle sera remplacée par le vrai écran d'accueil ensuite.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      {/* Pastille amber : vérifie que la couleur primary (accent) est bien appliquée. */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
        TP
      </div>

      {/* Titre en Space Grotesk (font-sans par défaut). */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          Trail <span className="text-primary">Plan</span>
        </h1>
        <p className="text-muted-foreground">
          Setup validé — fonts, couleurs et shadcn/ui fonctionnent.
        </p>
      </div>

      {/* Bloc mono : vérifie que JetBrains Mono (font-mono) est bien chargée. */}
      <p className="rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm text-muted-foreground">
        12,4 km · +860 D+ · 5:32 /km
      </p>

      {/* Bouton shadcn : vérifie cva + variantes + couleur primary amber. */}
      <Button size="lg">Commencer</Button>
    </main>
  );
}
