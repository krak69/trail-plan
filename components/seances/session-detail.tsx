// Écran de DÉTAIL d'une séance d'endurance (course à pied / vélo).
// Composant partagé, piloté par un objet `data` (voir course/velo page).
// ⚠️ Contenu = données d'exemple (maquette). Boutons non fonctionnels pour l'instant.
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  CheckCircle2,
  Flag,
  ListChecks,
  BarChart3,
  Apple,
  Heart,
  type LucideIcon,
} from "lucide-react";

export type Metric = {
  Icon: LucideIcon;
  value: string;
  unit?: string;
  label: string;
};

export type DiagramBar = { flex: number; height: number; color: string; opacity?: number };
export type DiagramPhase = { flex: number; color: string; label: string };

export type StructurePhase = {
  dotColor: string;
  title: string;
  meta: string;
  desc: string;
  chips?: string[];
  effortRecup?: {
    effort: { label: string; sub: string };
    recup: { label: string; sub: string };
  };
};

export type ZoneRow = { label: string; pct: number; range: string; color: string; active?: boolean };

export type SessionDetailData = {
  accent: string; // couleur d'accent du type (hex)
  TypeIcon: LucideIcon;
  typeLabel: string;
  date: string;
  breadcrumb: string;
  title: string;
  subtitle: string;
  objective: string;
  metrics: Metric[];
  diagram: {
    title: string;
    legend: { color: string; label: string }[];
    yLabels: string[]; // de haut en bas
    bars: DiagramBar[];
    phases: DiagramPhase[];
  };
  structure: { meta: string; phases: StructurePhase[] };
  nutrition?: { note: string; items: { title: string; sub: string }[] };
  zones: { title: string; right?: string; rows: ZoneRow[]; note: string };
};

export function SessionDetail({ data }: { data: SessionDetailData }) {
  const a = data.accent;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link href="/seances" className="flex items-center gap-2 hover:text-foreground">
          <ArrowLeft className="size-4" />
          Séances
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground/80">{data.title}</span>
      </div>

      {/* Titre + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: a, color: "#0B0A07" }}
            >
              <data.TypeIcon className="size-3.5" />
              {data.typeLabel}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{data.date}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.title}</h1>
          <span className="text-sm text-muted-foreground">{data.subtitle}</span>
        </div>
        <div className="flex gap-2.5">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground">
            <Pencil className="size-4" />
            Modifier
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: a, color: "#0B0A07" }}
          >
            <CheckCircle2 className="size-4" />
            Valider
          </button>
        </div>
      </div>

      {/* Objectif */}
      <section
        className="relative overflow-hidden rounded-[22px] border p-5 sm:p-6"
        style={{ borderColor: `${a}47`, background: "hsl(var(--card))" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ backgroundImage: `repeating-linear-gradient(115deg, ${a}0f 0 2px, transparent 2px 15px)` }}
        />
        <div className="relative flex items-start gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${a}29` }}
          >
            <Flag className="size-6" style={{ color: a }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: a }}>
              Objectif de la séance
            </span>
            <p className="max-w-[70ch] text-base font-medium leading-relaxed">{data.objective}</p>
          </div>
        </div>
      </section>

      {/* Métriques */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {data.metrics.map((m, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-[18px] border border-border bg-card p-4">
            <m.Icon className="size-5" style={{ color: a }} />
            <span className="text-2xl font-bold tabular-nums">
              {m.value}
              {m.unit && <span className="ml-1 text-[13px] font-medium text-muted-foreground">{m.unit}</span>}
            </span>
            <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Diagramme d'intensité */}
      <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="size-5" style={{ color: a }} />
            <span className="font-semibold">{data.diagram.title}</span>
          </div>
          <div className="flex flex-wrap gap-3.5 font-mono text-[10px] text-muted-foreground">
            {data.diagram.legend.map((l, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative pl-9">
          {/* labels d'axe Y */}
          <div className="absolute inset-y-0 left-0 flex w-8 flex-col justify-between py-1 font-mono text-[9px] text-muted-foreground">
            {data.diagram.yLabels.map((y, i) => (
              <span key={i}>{y}</span>
            ))}
          </div>
          {/* barres */}
          <div className="flex h-[clamp(150px,18vw,200px)] items-end gap-[3px]">
            {data.diagram.bars.map((b, i) => (
              <div
                key={i}
                className="rounded-t-md"
                style={{
                  flex: b.flex,
                  height: `${b.height}%`,
                  background: b.color,
                  opacity: b.opacity ?? 1,
                }}
              />
            ))}
          </div>
          {/* phases */}
          <div className="mt-2.5 flex gap-[3px] font-mono text-[10px]">
            {data.diagram.phases.map((p, i) => (
              <div
                key={i}
                className="pt-1.5 text-center"
                style={{ flex: p.flex, color: p.color, borderTop: `2px solid ${p.color}` }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deux colonnes : structure + side */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Structure */}
        <section className="flex flex-col gap-5 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ListChecks className="size-5" style={{ color: a }} />
              <span className="font-semibold">Structure de la séance</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">{data.structure.meta}</span>
          </div>

          {data.structure.phases.map((p, i) => {
            const isLast = i === data.structure.phases.length - 1;
            return (
              <div key={i} className="flex gap-3.5">
                {/* timeline */}
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <div className="size-3 rounded-full" style={{ background: p.dotColor }} />
                  {!isLast && <div className="w-0.5 flex-1 bg-border" />}
                </div>
                <div className="flex flex-1 flex-col gap-2 pb-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                    <span className="font-semibold">{p.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">{p.meta}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{p.desc}</p>
                  {p.effortRecup && (
                    <div className="flex gap-2">
                      <div
                        className="flex flex-1 flex-col gap-1 rounded-xl border p-2.5"
                        style={{ background: `${a}1a`, borderColor: `${a}40` }}
                      >
                        <span className="font-mono text-[10px] tracking-[0.1em]" style={{ color: a }}>
                          EFFORT
                        </span>
                        <span className="text-sm font-semibold">{p.effortRecup.effort.label}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{p.effortRecup.effort.sub}</span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border bg-secondary p-2.5">
                        <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">RÉCUP</span>
                        <span className="text-sm font-semibold">{p.effortRecup.recup.label}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{p.effortRecup.recup.sub}</span>
                      </div>
                    </div>
                  )}
                  {p.chips && (
                    <div className="flex flex-wrap gap-2">
                      {p.chips.map((c, j) => (
                        <span
                          key={j}
                          className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-[10px] text-foreground/80"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Side */}
        <div className="flex flex-col gap-4">
          {data.nutrition && (
            <section className="flex flex-col gap-3.5 rounded-[22px] border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Apple className="size-5" style={{ color: a }} />
                  <span className="font-semibold">Plan nutrition</span>
                </div>
                <span className="rounded-full bg-secondary px-2 py-1 font-mono text-[9px] tracking-wider text-muted-foreground">
                  CONTEXTUEL
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{data.nutrition.note}</p>
              <div className="flex flex-col gap-3">
                {data.nutrition.items.map((it, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${a}24` }}
                    >
                      <Apple className="size-4" style={{ color: a }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{it.title}</span>
                      <span className="text-xs text-muted-foreground">{it.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Heart className="size-5" style={{ color: a }} />
                <span className="font-semibold">{data.zones.title}</span>
              </div>
              {data.zones.right && (
                <span className="font-mono text-[11px] text-muted-foreground">{data.zones.right}</span>
              )}
            </div>
            <div className="flex flex-col gap-2.5 font-mono">
              {data.zones.rows.map((z, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="w-6 text-[11px]"
                    style={{ color: z.active ? a : undefined }}
                  >
                    <span className={z.active ? "" : "text-muted-foreground"}>{z.label}</span>
                  </span>
                  <div className="h-2 flex-1 rounded-md bg-secondary">
                    <div className="h-full rounded-md" style={{ width: `${z.pct}%`, background: z.color }} />
                  </div>
                  <span className="w-16 text-right text-[11px] text-muted-foreground">{z.range}</span>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{data.zones.note}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
