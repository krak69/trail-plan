import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  CheckCircle2,
  Play,
  Flag,
  Clock,
  Repeat,
  ListOrdered,
  Flame,
  Timer,
  ListChecks,
  Target,
  Lightbulb,
  ImageIcon,
  Gauge,
  TrendingDown,
  Pause,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

// Détail d'une séance de renforcement (accent violet). Données d'exemple.
// Différent des séances d'endurance : structure en circuit d'exercices.
const PURPLE = "#8C7AE0";
const PURPLE_DK = "#5B4C99";
const PURPLE_DKR = "#332B58";

type Exo = {
  num: string;
  name: string;
  value: string;
  unit: string;
  muscles: string[];
  type?: { Icon: LucideIcon; label: string };
  cue: string;
};

const EXOS: Exo[] = [
  { num: "01", name: "Fentes bulgares", value: "12", unit: "rép / jambe", muscles: ["Quadriceps", "Fessiers"], type: { Icon: Gauge, label: "Excentrique 3s" }, cue: "Descente lente et contrôlée, genou dans l'axe du pied." },
  { num: "02", name: "Step-down excentrique", value: "10", unit: "rép / jambe", muscles: ["Quadriceps"], type: { Icon: TrendingDown, label: "Spécifique descente" }, cue: "Descends en 3 s depuis une marche : prépare les quadriceps aux longues descentes." },
  { num: "03", name: "Chaise au mur", value: "45", unit: "s", muscles: ["Quadriceps"], type: { Icon: Pause, label: "Isométrique" }, cue: "Cuisses parallèles au sol, dos plaqué au mur, respiration régulière." },
  { num: "04", name: "Planche gainage", value: "60", unit: "s", muscles: ["Core", "Transverse"], cue: "Corps aligné, bassin neutre, ne pas creuser le bas du dos." },
  { num: "05", name: "Gainage latéral", value: "30", unit: "s / côté", muscles: ["Obliques", "Stabilité"], cue: "Hanches hautes, épaules et bassin bien alignés sur toute la durée." },
  { num: "06", name: "Mollets excentriques", value: "15", unit: "rép", muscles: ["Mollets", "Tendon d'Achille"], cue: "Montée sur 2 pieds, descente lente sur 1 pied depuis une marche." },
];

const METRICS: { Icon: LucideIcon; value: string; unit?: string; label: string }[] = [
  { Icon: Clock, value: "~50 min", label: "DURÉE CIBLE" },
  { Icon: Repeat, value: "3", unit: "tours", label: "FORMAT CIRCUIT" },
  { Icon: ListOrdered, value: "6", unit: "exos", label: "EXERCICES" },
  { Icon: Flame, value: "RPE 6", unit: "/10", label: "INTENSITÉ" },
  { Icon: Timer, value: "1 min", label: "RÉCUP / TOUR" },
];

const FOCUS = [
  { label: "Quadriceps", pct: 90, color: PURPLE, strong: true },
  { label: "Gainage", pct: 72, color: PURPLE_DK },
  { label: "Fessiers", pct: 60, color: PURPLE_DK },
  { label: "Mollets", pct: 52, color: PURPLE_DK },
  { label: "Stabilité", pct: 38, color: PURPLE_DK },
];

const MATERIEL = [
  { title: "Tapis de sol", sub: "Gainage & exercices au sol", optional: false },
  { title: "Élastique de force", sub: "Activation & résistance", optional: false },
  { title: "Marche / step", sub: "Step-downs & mollets", optional: false },
  { title: "Sac lesté", sub: "Ajouter de la charge sur les fentes", optional: true },
];

function ExoImage({ num, small }: { num: string; small?: boolean }) {
  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed ${
        small ? "size-24" : "h-24 w-full"
      }`}
      style={{ background: "#14110B", borderColor: `${PURPLE}52` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: `repeating-linear-gradient(115deg, ${PURPLE}12 0 2px, transparent 2px 11px)` }}
      />
      <ImageIcon className="relative size-6" style={{ color: PURPLE, opacity: 0.85 }} />
      <span className="relative font-mono text-[8px] tracking-[0.12em] text-muted-foreground">BANQUE</span>
      <span
        className="absolute left-1.5 top-1.5 flex h-[22px] min-w-6 items-center justify-center rounded-md px-1.5 font-mono text-xs font-bold"
        style={{ background: "rgba(11,10,7,0.82)", color: PURPLE }}
      >
        {num}
      </span>
    </div>
  );
}

export default function RenfoDetailPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link href="/seances" className="flex items-center gap-2 hover:text-foreground">
          <ArrowLeft className="size-4" />
          Séances
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground/80">Renfo · Descente &amp; gainage</span>
      </div>

      {/* Titre + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: PURPLE, color: "#0B0A07" }}
            >
              <Dumbbell className="size-3.5" />
              Renforcement
            </span>
            <span className="font-mono text-xs text-muted-foreground">Aujourd'hui · Mercredi 1 juillet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Renfo trail · Circuit descente &amp; gainage</h1>
          <span className="text-sm text-muted-foreground">Force excentrique · Prévention blessure · Bloc spécifique 3/6</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground">
            <Pencil className="size-4" />
            Modifier
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground">
            <CheckCircle2 className="size-4" />
            Valider
          </button>
          <Link
            href="/realiser"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: PURPLE, color: "#0B0A07" }}
          >
            <Play className="size-4" />
            Réaliser la séance
          </Link>
        </div>
      </div>

      {/* Objectif */}
      <section
        className="relative overflow-hidden rounded-[22px] border p-5 sm:p-6"
        style={{ borderColor: `${PURPLE}47`, background: "hsl(var(--card))" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ backgroundImage: `repeating-linear-gradient(115deg, ${PURPLE}0f 0 2px, transparent 2px 15px)` }}
        />
        <div className="relative flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${PURPLE}29` }}>
            <Flag className="size-6" style={{ color: PURPLE }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: PURPLE }}>
              Objectif de la séance
            </span>
            <p className="max-w-[72ch] text-base font-medium leading-relaxed">
              Renforcer les quadriceps en excentrique pour encaisser les longues descentes de la CCC, et verrouiller le
              gainage pour tenir la posture sur les efforts longs. On cherche la qualité et le contrôle du mouvement, pas
              la charge : chaque répétition est lente et propre. C'est le travail de fond qui protège des blessures.
            </p>
          </div>
        </div>
      </section>

      {/* Métriques */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {METRICS.map((m, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-[18px] border border-border bg-card p-4">
            <m.Icon className="size-5" style={{ color: PURPLE }} />
            <span className="text-2xl font-bold tabular-nums">
              {m.value}
              {m.unit && <span className="ml-1 text-[13px] font-medium text-muted-foreground">{m.unit}</span>}
            </span>
            <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Deux colonnes */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Structure / circuit */}
        <section className="flex flex-col gap-5 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ListChecks className="size-5" style={{ color: PURPLE }} />
              <span className="font-semibold">Structure de la séance</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">3 phases · ~50 min</span>
          </div>

          {/* Phase 1 : échauffement */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="size-3 rounded-full" style={{ background: PURPLE_DK }} />
              <div className="w-0.5 flex-1 bg-border" />
            </div>
            <div className="flex flex-1 flex-col gap-2 pb-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                <span className="font-semibold">Échauffement</span>
                <span className="font-mono text-xs text-muted-foreground">10 min</span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Mobilité hanches &amp; chevilles, puis activation des fessiers à l'élastique et montées de genoux.
                Réveiller la chaîne avant la charge.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Mobilité articulaire", "Activation fessiers", "2 × 15 élastique"].map((c) => (
                  <span key={c} className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-[10px] text-foreground/80">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 2 : circuit */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="size-3 rounded-full" style={{ background: PURPLE }} />
              <div className="w-0.5 flex-1 bg-border" />
            </div>
            <div className="flex flex-1 flex-col gap-3 pb-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                <span className="font-semibold">Circuit principal · 3 tours</span>
                <span className="font-mono text-xs text-muted-foreground">~30 min · 1 min récup / tour</span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                6 exercices enchaînés. On privilégie le contrôle et l'amplitude : mouvement lent, gainage constant. La
                descente (excentrique) est le cœur du travail.
              </p>

              <div className="flex flex-col gap-2.5">
                {EXOS.map((exo) => (
                  <div
                    key={exo.num}
                    className="flex items-start gap-3.5 rounded-2xl border border-border p-3.5"
                    style={{ background: "#0F0D09" }}
                  >
                    <ExoImage num={exo.num} small />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <span className="font-semibold">{exo.name}</span>
                        <span className="whitespace-nowrap font-mono text-sm font-bold" style={{ color: PURPLE }}>
                          {exo.value} <span className="font-medium text-muted-foreground">{exo.unit}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exo.muscles.map((mu) => (
                          <span key={mu} className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-[10px] text-foreground/80">
                            {mu}
                          </span>
                        ))}
                        {exo.type && (
                          <span
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[10px]"
                            style={{ background: `${PURPLE}1f`, color: PURPLE }}
                          >
                            <exo.type.Icon className="size-3" />
                            {exo.type.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{exo.cue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 3 : étirements */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="size-3 rounded-full" style={{ background: PURPLE_DKR }} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                <span className="font-semibold">Étirements &amp; mobilité</span>
                <span className="font-mono text-xs text-muted-foreground">10 min</span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Étirements quadriceps, mollets et fessiers, mobilité des hanches. Relâcher en respirant, tenir 30 s par
                position.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Quadriceps", "Mollets", "Hanches"].map((c) => (
                  <span key={c} className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-[10px] text-foreground/80">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Side column */}
        <div className="flex flex-col gap-4">
          {/* Matériel */}
          <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="size-5" style={{ color: PURPLE }} />
              <span className="font-semibold">Matériel</span>
            </div>
            <div className="flex flex-col gap-3.5">
              {MATERIEL.map((m) => (
                <div key={m.title} className="flex items-center gap-3">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: m.optional ? "hsl(var(--secondary))" : `${PURPLE}24` }}
                  >
                    <Dumbbell className="size-4" style={{ color: m.optional ? undefined : PURPLE }} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{m.title}</span>
                      {m.optional && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
                          OPTIONNEL
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{m.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Focus musculaire */}
          <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <Target className="size-5" style={{ color: PURPLE }} />
              <span className="font-semibold">Focus musculaire</span>
            </div>
            <div className="flex flex-col gap-2.5 font-mono">
              {FOCUS.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className={`w-[86px] text-[11px] ${f.strong ? "text-foreground/80" : "text-muted-foreground"}`}>
                    {f.label}
                  </span>
                  <div className="h-2 flex-1 rounded-md bg-secondary">
                    <div className="h-full rounded-md" style={{ width: `${f.pct}%`, background: f.color }} />
                  </div>
                  <span className={`w-8 text-right text-[11px] ${f.strong ? "text-foreground/80" : "text-muted-foreground"}`}>
                    {f.pct}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Dominante quadriceps en excentrique : c'est le muscle le plus sollicité en descente, et le premier à céder
              sur un ultra.
            </p>
          </section>

          {/* Conseil du coach */}
          <section
            className="relative overflow-hidden rounded-[22px] border p-5 sm:p-6"
            style={{ borderColor: `${PURPLE}38`, background: "hsl(var(--card))" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-45"
              style={{ backgroundImage: `repeating-linear-gradient(115deg, ${PURPLE}0f 0 2px, transparent 2px 15px)` }}
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="size-5" style={{ color: PURPLE }} />
                <span className="font-semibold">Conseil du coach</span>
              </div>
              <p className="text-[13px] leading-relaxed text-foreground/80">
                Le cœur de la séance, c'est la descente lente (excentrique) sur les fentes et les step-downs : c'est elle
                qui blinde tes quadriceps pour les 6 100 D− de la CCC. Contrôle avant charge — si les genoux tirent,
                réduis l'amplitude, jamais le contrôle.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
