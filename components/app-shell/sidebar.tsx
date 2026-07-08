"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

// Détermine si un item est l'onglet actif. "/" doit matcher exactement,
// les autres matchent aussi leurs sous-pages (ex: /seances/nouvelle -> Séances).
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({
  firstName,
  initials,
  profileLine,
  signOutAction,
}: {
  firstName: string;
  initials: string;
  profileLine: string;
  signOutAction: () => void;
}) {
  const pathname = usePathname();

  return (
    // Cachée en mobile (lg:flex), collée en haut, pleine hauteur.
    <aside className="sticky top-0 hidden h-dvh w-[250px] shrink-0 flex-col gap-7 border-r border-border p-5 lg:flex">
      {/* Logo / marque */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <Mountain className="size-5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold leading-tight">
          Plan d&apos;entraînement
          <br />
          Trail
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          // Item désactivé (écran à venir) : non cliquable, grisé.
          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground/50"
                title="Bientôt disponible"
              >
                <Icon className="size-5" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Carte profil + déconnexion (en bas) */}
      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
          {initials}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{firstName}</span>
          <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {profileLine}
          </span>
        </div>
        <form action={signOutAction} className="ml-auto">
          <button
            type="submit"
            aria-label="Se déconnecter"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
