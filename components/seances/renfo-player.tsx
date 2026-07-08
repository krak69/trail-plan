"use client";

// Lecteur "réaliser une séance de renfo" — déroulement pas à pas plein écran.
// Machine à états : exercice → (chrono ou répétitions) → récup → … → terminé.
// ⚠️ Contenu d'exemple. Accent violet (renfo).
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Dumbbell,
  Gauge,
  Lightbulb,
  ImageIcon,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  CheckCircle2,
  SkipForward,
  RotateCcw,
} from "lucide-react";

const PURPLE = "#8C7AE0";
const TOURS = 3;
const REST = 60;
const RING_CIRC = 552.92; // 2πr, r=88

type Exo = {
  name: string;
  type: "reps" | "time";
  target?: string;
  unit: string;
  seconds?: number;
  muscles: string[];
  tempo?: string;
  cue: string;
};

const EXOS: Exo[] = [
  { name: "Fentes bulgares", type: "reps", target: "12", unit: "rép / jambe", muscles: ["Quadriceps", "Fessiers"], tempo: "Excentrique 3s", cue: "Descente lente et contrôlée, genou dans l'axe du pied." },
  { name: "Step-down excentrique", type: "reps", target: "10", unit: "rép / jambe", muscles: ["Quadriceps"], tempo: "Spécifique descente", cue: "Descends en 3 s depuis une marche : c'est ce qui prépare tes quadriceps aux descentes." },
  { name: "Chaise au mur", type: "time", seconds: 45, unit: "à tenir", muscles: ["Quadriceps"], tempo: "Isométrique", cue: "Cuisses parallèles au sol, dos plaqué au mur, respiration régulière." },
  { name: "Planche gainage", type: "time", seconds: 60, unit: "à tenir", muscles: ["Core", "Transverse"], cue: "Corps aligné, bassin neutre, ne pas creuser le bas du dos." },
  { name: "Gainage latéral", type: "time", seconds: 30, unit: "par côté", muscles: ["Obliques", "Stabilité"], cue: "Hanches hautes, épaules et bassin alignés. 30 s de chaque côté." },
  { name: "Mollets excentriques", type: "reps", target: "15", unit: "rép", muscles: ["Mollets", "Achille"], cue: "Montée sur 2 pieds, descente lente sur 1 pied depuis une marche." },
];

type Phase = "exercise" | "rest" | "done";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RenfoPlayer() {
  const [tour, setTour] = useState(1);
  const [exoIndex, setExoIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [remaining, setRemaining] = useState<number | null>(EXOS[0].type === "time" ? EXOS[0].seconds! : null);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const exo = EXOS[exoIndex];
  const nExo = EXOS.length;
  const isTimedNow = phase === "rest" || (phase === "exercise" && exo.type === "time");

  function enterExercise(t: number, idx: number) {
    const e = EXOS[idx];
    setTour(t);
    setExoIndex(idx);
    setPhase("exercise");
    setRemaining(e.type === "time" ? e.seconds! : null);
    setRunning(true);
  }
  function enterRest() {
    setPhase("rest");
    setRemaining(REST);
    setRunning(true);
  }
  function advance() {
    if (phase === "rest") return enterExercise(tour + 1, 0);
    if (exoIndex < nExo - 1) return enterExercise(tour, exoIndex + 1);
    if (tour < TOURS) return enterRest();
    setPhase("done");
    setRunning(false);
  }
  function previous() {
    if (phase === "done") return enterExercise(TOURS, nExo - 1);
    if (phase === "rest") return enterExercise(tour, nExo - 1);
    if (exoIndex > 0) return enterExercise(tour, exoIndex - 1);
    if (tour > 1) {
      setPhase("rest");
      setTour(tour - 1);
      setRemaining(REST);
      setRunning(true);
    }
  }
  function restart() {
    setElapsed(0);
    enterExercise(1, 0);
  }

  // Chrono (1 s) : décrémente seulement. Le passage à zéro est géré par l'effet suivant.
  useEffect(() => {
    if (phase === "done" || !running) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      if (isTimedNow) setRemaining((r) => (r && r > 0 ? r - 1 : r));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, running, isTimedNow]);

  // Fin de chrono (remaining atteint 0) → on enchaîne sur la phase suivante.
  useEffect(() => {
    if (phase !== "done" && isTimedNow && remaining === 0) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isTimedNow, phase]);

  // Progression / segments du tour
  const segs = EXOS.map((_, i) => {
    if (phase === "rest") return true;
    return phase === "exercise" && i <= exoIndex;
  });

  const dur = phase === "rest" ? REST : exo.type === "time" ? exo.seconds! : 0;
  const rem = remaining ?? 0;
  const frac = dur ? Math.max(0, Math.min(1, rem / dur)) : 0;
  const ringOffset = (RING_CIRC * (1 - frac)).toFixed(1);
  const ringSub = phase === "rest" ? `avant le tour ${tour + 1}` : exo.unit;
  const totalExos = TOURS * nExo;
  const canPrev = !(phase === "exercise" && tour === 1 && exoIndex === 0);
  const isReps = phase === "exercise" && exo.type === "reps";

  const Ring = ({ big }: { big?: boolean }) => (
    <div className="relative" style={{ width: big ? "min(52vw,240px)" : "min(48vw,224px)", aspectRatio: "1" }}>
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(var(--secondary))" strokeWidth="13" />
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke={PURPLE}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={ringOffset}
          style={{ transition: "stroke-dashoffset 0.95s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-5xl font-bold tabular-nums">{fmt(rem)}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{ringSub}</span>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-dvh justify-center"
      style={{ background: "radial-gradient(120% 85% at 50% -8%, #16130D 0%, #0B0A07 62%)" }}
    >
      <div className="flex h-full w-full max-w-[600px] flex-col px-5 py-5 sm:px-7">
        {/* Top bar */}
        {phase !== "done" && (
          <div className="flex shrink-0 flex-col gap-3.5">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/seances/renfo"
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card"
                aria-label="Fermer"
              >
                <X className="size-5 text-foreground/80" />
              </Link>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: PURPLE }}>
                  Tour {tour} / {TOURS}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {phase === "rest" ? "Récupération" : `Exercice ${exoIndex + 1} / ${nExo}`}
                </span>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
                <Dumbbell className="size-5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-1.5">
              {segs.map((on, i) => (
                <div
                  key={i}
                  className="h-[5px] flex-1 rounded-md transition-colors"
                  style={{ background: on ? PURPLE : "hsl(var(--secondary))" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Center */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto py-4 text-center">
          {phase === "exercise" && (
            <>
              {/* Image */}
              <div
                className="relative flex h-[clamp(150px,26vh,220px)] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border border-dashed"
                style={{ background: "#14110B", borderColor: `${PURPLE}4d` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{ backgroundImage: `repeating-linear-gradient(115deg, ${PURPLE}10 0 2px, transparent 2px 13px)` }}
                />
                <ImageIcon className="relative size-10" style={{ color: PURPLE, opacity: 0.85 }} />
                <span className="relative font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                  IMAGE · BANQUE D'EXERCICES
                </span>
                <span
                  className="absolute left-3 top-3 flex h-[26px] min-w-[30px] items-center justify-center rounded-lg px-2 font-mono text-sm font-bold"
                  style={{ background: "rgba(11,10,7,0.82)", color: PURPLE }}
                >
                  {String(exoIndex + 1).padStart(2, "0")}
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight">{exo.name}</h1>

              <div className="flex flex-wrap justify-center gap-1.5">
                {exo.muscles.map((m) => (
                  <span key={m} className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-[11px] text-foreground/80">
                    {m}
                  </span>
                ))}
                {exo.tempo && (
                  <span
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[11px]"
                    style={{ background: `${PURPLE}1f`, color: PURPLE }}
                  >
                    <Gauge className="size-3" />
                    {exo.tempo}
                  </span>
                )}
              </div>

              {isReps ? (
                <div className="flex flex-col items-center gap-0.5 py-2">
                  <span className="text-7xl font-bold leading-none tabular-nums" style={{ color: PURPLE }}>
                    {exo.target}
                  </span>
                  <span className="font-mono text-[13px] uppercase tracking-wide text-muted-foreground">{exo.unit}</span>
                </div>
              ) : (
                <Ring />
              )}

              <div className="flex max-w-[44ch] items-start gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-left">
                <Lightbulb className="size-5 shrink-0" style={{ color: PURPLE }} />
                <span className="text-sm leading-relaxed text-foreground/80">{exo.cue}</span>
              </div>
            </>
          )}

          {phase === "rest" && (
            <>
              <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: PURPLE }}>
                Récupération
              </span>
              <Ring big />
              <div className="flex w-full max-w-[340px] items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div
                  className="flex size-[52px] shrink-0 items-center justify-center rounded-xl border border-dashed"
                  style={{ background: "#14110B", borderColor: `${PURPLE}4d` }}
                >
                  <ImageIcon className="size-5" style={{ color: PURPLE, opacity: 0.85 }} />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">PROCHAIN</span>
                  <span className="font-semibold">Tour {tour + 1} · {EXOS[0].name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {EXOS[0].target} {EXOS[0].unit}
                  </span>
                </div>
              </div>
            </>
          )}

          {phase === "done" && (
            <>
              <div className="flex size-20 items-center justify-center rounded-full" style={{ background: `${PURPLE}29` }}>
                <CheckCircle2 className="size-11" style={{ color: PURPLE }} />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Séance terminée !</h1>
                <span className="text-muted-foreground">Renfo trail · Circuit descente &amp; gainage</span>
              </div>
              <div className="flex w-full max-w-[400px] gap-2.5">
                {[
                  { v: String(TOURS), l: "TOURS" },
                  { v: String(totalExos), l: "EXERCICES" },
                  { v: fmt(elapsed), l: "DURÉE" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-border bg-card px-3 py-4">
                    <span className="text-2xl font-bold tabular-nums">{s.v}</span>
                    <span className="font-mono text-[9px] tracking-wider text-muted-foreground">{s.l}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-stretch gap-3">
          {phase === "exercise" && (
            <>
              <button
                onClick={previous}
                disabled={!canPrev}
                className="flex w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card disabled:opacity-40"
                aria-label="Précédent"
              >
                <ArrowLeft className="size-6 text-foreground/80" />
              </button>
              {exo.type === "time" && (
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-4 font-semibold"
                >
                  {running ? <Pause className="size-5" style={{ color: PURPLE }} /> : <Play className="size-5" style={{ color: PURPLE }} />}
                  {running ? "Pause" : "Reprendre"}
                </button>
              )}
              <button
                onClick={advance}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl py-4 font-bold"
                style={{ background: PURPLE, color: "#0B0A07" }}
              >
                {isReps ? <CheckCircle2 className="size-5" /> : <ArrowRight className="size-5" />}
                {isReps ? "Exercice terminé" : "Suivant"}
              </button>
            </>
          )}

          {phase === "rest" && (
            <>
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-4 font-semibold"
              >
                {running ? <Pause className="size-5" style={{ color: PURPLE }} /> : <Play className="size-5" style={{ color: PURPLE }} />}
                {running ? "Pause" : "Reprendre"}
              </button>
              <button
                onClick={advance}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl py-4 font-bold"
                style={{ background: PURPLE, color: "#0B0A07" }}
              >
                Passer la récup
                <SkipForward className="size-5" />
              </button>
            </>
          )}

          {phase === "done" && (
            <>
              <button
                onClick={restart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 font-semibold text-foreground/80"
              >
                <RotateCcw className="size-5" />
                Refaire
              </button>
              <Link
                href="/valider"
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl py-4 font-bold"
                style={{ background: PURPLE, color: "#0B0A07" }}
              >
                <CheckCircle2 className="size-5" />
                Valider la séance
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
