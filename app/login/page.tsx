import Link from "next/link";

import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Server Component : pas de "use client", tout est rendu côté serveur.
// searchParams (Next 14) porte les messages renvoyés par les Server Actions.
export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6">
      {/* En-tête de marque */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
          TP
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Trail <span className="text-primary">Plan</span>
        </h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>
            Connecte-toi pour suivre tes entraînements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulaire de connexion : l'action login est appelée à la soumission. */}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="toi@exemple.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                minLength={6}
                required
              />
            </div>

            {/* Messages d'erreur / d'info renvoyés par les actions */}
            {searchParams.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {searchParams.error}
              </p>
            )}
            {searchParams.message && (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                {searchParams.message}
              </p>
            )}

            <Button type="submit" formAction={login} className="mt-2 w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lien vers la page d'inscription dédiée */}
      <p className="text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
