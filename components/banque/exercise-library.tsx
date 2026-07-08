"use client";

// Banque d'exercices de renforcement — branchée sur Supabase (table `exercises`).
// Recherche + filtres par catégorie interactifs (côté client, sur les données réelles).
import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  X,
  ImageIcon,
  Eye,
  SearchX,
  RotateCcw,
  Gauge,
  TrendingDown,
  TrendingUp,
  Pause,
  Zap,
  Accessibility,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/types";

const LIME = "#D8FF3D";

// Catégories fixes (l'ordre d'affichage des filtres).
const CATS = [
  { key: "all", label: "Toutes" },
  { key: "quadriceps", label: "Quadriceps" },
  { key: "gainage", label: "Gainage" },
  { key: "fessiers", label: "Fessiers" },
  { key: "mollets", label: "Mollets" },
  { key: "proprio", label: "Proprioception" },
  { key: "mobilite", label: "Mobilité" },
];

// Mappe un tag de tempo (texte en base) vers une icône lucide.
const TEMPO_ICON: Record<string, LucideIcon> = {
  "Excentrique 3s": Gauge,
  Excentrique: Gauge,
  "Spécifique descente": TrendingDown,
  "Spécifique montée": TrendingUp,
  Isométrique: Pause,
  Pliométrie: Zap,
  Proprioception: Accessibility,
  Mobilité: RefreshCw,
};
const tempoIcon = (tag: string): LucideIcon => TEMPO_ICON[tag] ?? Sparkles;

export function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = exercises.filter(
    (e) =>
      (filter === "all" || e.category === filter) &&
      (!query || e.name.toLowerCase().includes(query) || e.muscles.join(" ").toLowerCase().includes(query))
  );
  const activeLabel = CATS.find((c) => c.key === filter)?.label ?? "Toutes";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Dashboard</Link>
        <span>›</span>
        <span className="text-foreground/80">Banque d'exercices</span>
      </div>

      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: LIME, color: "#0B0A07" }}
            >
              <BookOpen className="size-3.5" />
              Bibliothèque
            </span>
            <span className="font-mono text-xs text-muted-foreground">{exercises.length} exercices</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Banque d'exercices</h1>
          <span className="max-w-[60ch] text-sm text-muted-foreground">
            Le vivier dans lequel tu pioches tes séances de renfo : force excentrique, gainage et prévention pour tenir
            les longues descentes.
          </span>
        </div>
        <Link
          href="/banque/nouveau"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: LIME, color: "#0B0A07" }}
        >
          <Plus className="size-4" />
          Ajouter un exercice
        </Link>
      </div>

      {/* Recherche */}
      <div className="flex max-w-[520px] items-center gap-3 rounded-xl border border-border bg-card px-4">
        <Search className="size-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un exercice ou un muscle…"
          className="flex-1 bg-transparent py-3.5 text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Effacer">
            <X className="size-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2.5">
        {CATS.map((c) => {
          const active = filter === c.key;
          const count = c.key === "all" ? exercises.length : exercises.filter((e) => e.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-xs transition-colors",
                active ? "font-bold" : "border-border bg-card text-foreground/80 hover:text-foreground"
              )}
              style={active ? { background: LIME, color: "#0B0A07", borderColor: LIME } : undefined}
            >
              {c.label}
              <span className={active ? "opacity-60" : "text-muted-foreground"}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Résultats */}
      <div className="flex items-baseline gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{activeLabel}</span>
        <span className="text-muted-foreground/60">· {filtered.length} résultats</span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {filtered.map((e, i) => {
            const TempoIcon = e.tempo_tag ? tempoIcon(e.tempo_tag) : null;
            return (
              <div key={e.id} className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card">
                {/* Image placeholder */}
                <div
                  className="relative flex h-[132px] flex-col items-center justify-center gap-1.5 border-b border-border"
                  style={{ background: "#14110B" }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{ backgroundImage: `repeating-linear-gradient(115deg, ${LIME}10 0 2px, transparent 2px 13px)` }}
                  />
                  <ImageIcon className="relative size-8" style={{ color: LIME, opacity: 0.8 }} />
                  <span className="relative font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                    DÉMO · BANQUE D'EXERCICES
                  </span>
                  <span
                    className="absolute left-3 top-3 flex h-6 min-w-7 items-center justify-center rounded-lg px-2 font-mono text-xs font-bold"
                    style={{ background: "rgba(11,10,7,0.82)", color: LIME }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {e.tempo_tag && TempoIcon && (
                    <span
                      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px]"
                      style={{ background: "rgba(11,10,7,0.82)", color: LIME }}
                    >
                      <TempoIcon className="size-3" />
                      {e.tempo_tag}
                    </span>
                  )}
                </div>

                {/* Corps */}
                <div className="flex flex-1 flex-col gap-2.5 p-4">
                  <div className="flex items-baseline justify-between gap-2.5">
                    <span className="font-semibold leading-tight">{e.name}</span>
                    {e.metric_value && (
                      <span className="whitespace-nowrap font-mono text-sm font-bold" style={{ color: LIME }}>
                        {e.metric_value} <span className="font-medium text-muted-foreground">{e.metric_unit}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {e.muscles.map((m) => (
                      <span key={m} className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-[10px] text-foreground/80">
                        {m}
                      </span>
                    ))}
                  </div>
                  {e.cue && <p className="text-[13px] leading-relaxed text-muted-foreground">{e.cue}</p>}
                  <div className="mt-auto flex gap-2 border-t border-border pt-2.5">
                    <Link
                      href={`/banque/${e.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-[13px] font-semibold text-foreground/80 transition-colors hover:text-foreground"
                    >
                      <Eye className="size-4" />
                      Détail
                    </Link>
                    <button
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold"
                      style={{ background: `${LIME}24`, color: LIME }}
                    >
                      <Plus className="size-4" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // État vide
        <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-3.5 text-center text-muted-foreground">
          <div className="flex size-16 items-center justify-center rounded-[18px] border border-border bg-card">
            <SearchX className="size-8 text-muted-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground/80">Aucun exercice trouvé</span>
          <span className="max-w-[34ch] text-[13px] leading-relaxed">
            Essaie un autre mot-clé ou change de catégorie pour parcourir la banque.
          </span>
          <button
            onClick={() => {
              setQ("");
              setFilter("all");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground/80 hover:text-foreground"
          >
            <RotateCcw className="size-4" />
            Réinitialiser
          </button>
        </div>
      )}
    </main>
  );
}
