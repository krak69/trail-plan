"use client";

// Écran Statistiques (maquette Claude Design, accent lime). ⚠️ Données d'exemple.
// Sélecteur de période interactif ; graphiques en SVG.
import { useState } from "react";
import {
  Clock,
  Footprints,
  Mountain,
  Dumbbell,
  HeartPulse,
  TrendingUp,
  Check,
  Gauge,
  BarChart3,
  PieChart,
  Medal,
  Zap,
  type LucideIcon,
} from "lucide-react";

const LIME = "#D8FF3D"; // fatigue (ATL) / course
const BLUE = "#4FB3D9"; // forme (CTL) / vélo
const PURPLE = "#8C7AE0"; // fraîcheur (TSB) / renfo
const GREEN = "#5BB98C";

const PERIODS = [
  { key: "4s", label: "4 sem" },
  { key: "12s", label: "12 sem" },
  { key: "saison", label: "Saison" },
];

const KPIS: { Icon: LucideIcon; value: string; unit: string; label: string; trend: string; TrendIcon: LucideIcon; up: boolean }[] = [
  { Icon: Clock, value: "41,5", unit: " h", label: "VOLUME · 12 SEM", trend: "+8%", TrendIcon: TrendingUp, up: true },
  { Icon: Footprints, value: "386", unit: " km", label: "DISTANCE COURSE", trend: "+12%", TrendIcon: TrendingUp, up: true },
  { Icon: Mountain, value: "38,4", unit: " k D+", label: "DÉNIVELÉ CUMULÉ", trend: "+15%", TrendIcon: TrendingUp, up: true },
  { Icon: Dumbbell, value: "47", unit: "", label: "SÉANCES RÉALISÉES", trend: "92%", TrendIcon: Check, up: true },
  { Icon: HeartPulse, value: "52", unit: " ml", label: "VO2MAX ESTIMÉ", trend: "+1", TrendIcon: TrendingUp, up: true },
];

// Courbe forme/fatigue
const CTL = [30, 33, 37, 40, 44, 47, 50, 52, 55, 58, 62, 64];
const ATL = [28, 40, 35, 52, 46, 58, 44, 62, 57, 68, 60, 72];
const W = 600, H = 200, PAD = 6, maxV = 80, minV = 5;
const xAt = (i: number, n: number) => (i / (n - 1)) * W;
const yAt = (v: number) => PAD + (1 - (v - minV) / (maxV - minV)) * (H - PAD);
const toPts = (arr: number[]) => arr.map((v, i) => `${xAt(i, arr.length).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
const TSB = CTL.map((c, i) => 45 + (c - ATL[i]) * 0.9);
const ctlLine = toPts(CTL), atlLine = toPts(ATL), tsbLine = toPts(TSB);
const ctlArea = `${ctlLine} ${W},${H} 0,${H}`;

// Volume hebdo empilé
const WEEKS = [
  { cap: 3.1, renfo: 0.8, velo: 1.0, label: "S1" },
  { cap: 3.6, renfo: 0.8, velo: 1.2, label: "S2" },
  { cap: 4.2, renfo: 1.0, velo: 1.0, label: "S3" },
  { cap: 2.4, renfo: 0.6, velo: 0.8, label: "S4" },
  { cap: 4.0, renfo: 0.9, velo: 1.3, label: "S5" },
  { cap: 4.6, renfo: 1.0, velo: 1.2, label: "S6" },
  { cap: 5.1, renfo: 1.0, velo: 1.0, label: "S7" },
  { cap: 4.4, renfo: 0.9, velo: 1.1, label: "S8", current: true },
];
const VW = 680, VH = 232, VTOP = 4, yMax = 9;
const vx = (i: number) => (i / (WEEKS.length - 1)) * VW;
const vy = (v: number) => VTOP + (1 - v / yMax) * (VH - VTOP);
const capCum = WEEKS.map((x) => x.cap);
const renfoCum = WEEKS.map((x) => x.cap + x.renfo);
const veloCum = WEEKS.map((x) => x.cap + x.renfo + x.velo);
const lineOf = (arr: number[]) => arr.map((v, i) => `${vx(i).toFixed(1)},${vy(v).toFixed(1)}`).join(" ");
const areaBetween = (upper: number[], lower: number[]) => {
  const up = upper.map((v, i) => `${vx(i).toFixed(1)},${vy(v).toFixed(1)}`).join(" ");
  const down = lower.map((v, i) => `${vx(i).toFixed(1)},${vy(v).toFixed(1)}`).reverse().join(" ");
  return `${up} ${down}`;
};
const baseline = WEEKS.map(() => 0);
const currentX = vx(WEEKS.findIndex((x) => x.current)).toFixed(1);

const SPLIT = [
  { label: "Course à pied", color: LIME, hours: "25,7 h", pct: "62%" },
  { label: "Renfo", color: PURPLE, hours: "8,3 h", pct: "20%" },
  { label: "Vélo", color: BLUE, hours: "7,5 h", pct: "18%" },
];

const RECORDS: { Icon: LucideIcon; label: string; date: string; value: string }[] = [
  { Icon: TrendingUp, label: "Meilleur D+ sur une sortie", date: "28 juin · Aravis", value: "1 800 m" },
  { Icon: Footprints, label: "Plus longue sortie", date: "26 juin · Bornes", value: "2 h 40" },
  { Icon: Zap, label: "VMA ascensionnelle", date: "2 juil · côtes", value: "1 280 m/h" },
  { Icon: Gauge, label: "Meilleur 10 km", date: "15 juin", value: "42:30" },
];

const MISSED = new Set([5, 19, 33, 52, 70]);

export function StatsView() {
  const [period, setPeriod] = useState("12s");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Préparation CCC · Bloc 3 / 6</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Statistiques</h1>
        </div>
        <div className="flex gap-1.5 rounded-[14px] border border-border bg-card p-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="rounded-lg px-3.5 py-2 font-mono text-xs"
              style={period === p.key ? { background: LIME, color: "#0B0A07", fontWeight: 700 } : { color: "hsl(var(--muted-foreground))" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        {KPIS.map((k) => (
          <div key={k.label} className="flex flex-col gap-2 rounded-[18px] border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <k.Icon className="size-5" style={{ color: LIME }} />
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[10px] font-bold" style={{ color: GREEN, background: `${GREEN}1f` }}>
                <k.TrendIcon className="size-3" />
                {k.trend}
              </span>
            </div>
            <span className="text-2xl font-bold tabular-nums leading-none">
              {k.value}
              <span className="text-xs font-medium text-muted-foreground">{k.unit}</span>
            </span>
            <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Forme & fatigue + charge */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="size-5" style={{ color: LIME }} />
              <span className="font-semibold">Forme &amp; fatigue</span>
            </div>
            <div className="flex flex-wrap gap-3.5 font-mono text-[10px] text-muted-foreground">
              {[["Forme (CTL)", BLUE], ["Fatigue (ATL)", LIME], ["Fraîcheur", PURPLE]].map(([l, c]) => (
                <span key={l as string} className="flex items-center gap-1.5">
                  <span className="h-[3px] w-3.5 rounded" style={{ background: c as string }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="relative pl-8">
            <div className="absolute inset-y-0 left-0 flex w-7 flex-col justify-between py-1 font-mono text-[9px] text-muted-foreground">
              <span>80</span><span>55</span><span>30</span><span>5</span>
            </div>
            <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="block h-[clamp(160px,20vw,220px)] w-full">
              {[14, 80, 146, 200].map((y) => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              <polygon points={ctlArea} fill={`${BLUE}1a`} />
              <polyline points={ctlLine} fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinejoin="round" />
              <polyline points={atlLine} fill="none" stroke={LIME} strokeWidth="2.5" strokeLinejoin="round" />
              <polyline points={tsbLine} fill="none" stroke={PURPLE} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
            </svg>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground">
              {["S-11", "S-9", "S-7", "S-5", "S-3", "Auj."].map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[14px] border p-3" style={{ background: `${PURPLE}14`, borderColor: `${PURPLE}40` }}>
            <TrendingUp className="size-5 shrink-0" style={{ color: PURPLE }} />
            <span className="text-[13px] leading-relaxed text-foreground/80">
              Charge en hausse maîtrisée : la forme progresse plus vite que la fatigue. Fraîcheur légèrement négative — normal en bloc spécifique, elle remontera à l'affûtage.
            </span>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          {/* Ratio charge */}
          <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <Gauge className="size-5" style={{ color: LIME }} />
              <span className="font-semibold">Ratio de charge</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-4xl font-bold tabular-nums leading-none" style={{ color: GREEN }}>1,18</span>
              <span className="font-mono text-[10px] tracking-wide text-muted-foreground">AIGU / CHRONIQUE (7J / 28J)</span>
            </div>
            <div className="relative h-2.5 rounded-md" style={{ background: `linear-gradient(90deg,${BLUE} 0%,${GREEN} 30%,${GREEN} 62%,${LIME} 80%,#C25A4A 100%)` }}>
              <div className="absolute -top-1 h-[18px] w-[3px] rounded" style={{ left: "59%", background: "#F6F2EA", boxShadow: "0 0 0 2px hsl(var(--card))" }} />
            </div>
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>Détraîn.</span><span style={{ color: GREEN }}>Optimal</span><span>Surcharge</span>
            </div>
            <span className="text-xs leading-relaxed text-muted-foreground">Tu es dans la zone optimale (0,8–1,3). La progression est soutenable sans sur-risque de blessure.</span>
          </section>

          {/* Régularité */}
          <section className="flex flex-col gap-3.5 rounded-[22px] border border-border bg-card p-5">
            <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">RÉGULARITÉ · 12 SEMAINES</span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 84 }, (_, i) => {
                const rest = i % 7 === 0;
                const bg = rest ? "transparent" : MISSED.has(i) ? "hsl(var(--secondary))" : LIME;
                return <div key={i} className="size-[11px] rounded-[3px]" style={{ background: bg }} />;
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-foreground/80"><span className="font-bold text-foreground">92%</span> des séances réalisées</span>
              <div className="flex gap-2.5 font-mono text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-[3px]" style={{ background: LIME }} />fait</span>
                <span className="flex items-center gap-1"><span className="size-2.5 rounded-[3px] bg-secondary" />manqué</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Volume hebdo + répartition */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="size-5" style={{ color: LIME }} />
              <span className="font-semibold">Volume hebdomadaire</span>
            </div>
            <div className="flex flex-wrap gap-3.5 font-mono text-[10px] text-muted-foreground">
              {[["Course", LIME], ["Renfo", PURPLE], ["Vélo", BLUE]].map(([l, c]) => (
                <span key={l as string} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded" style={{ background: c as string }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="relative pl-7">
            <div className="absolute inset-y-0 left-0 flex w-6 flex-col justify-between py-1 font-mono text-[9px] text-muted-foreground">
              <span>9h</span><span>6h</span><span>3h</span><span>0</span>
            </div>
            <svg viewBox="0 0 680 232" preserveAspectRatio="none" className="block h-[clamp(150px,18vw,200px)] w-full">
              <defs>
                <linearGradient id="gVelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={BLUE} stopOpacity="0.5" /><stop offset="1" stopColor={BLUE} stopOpacity="0.1" /></linearGradient>
                <linearGradient id="gRenfo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PURPLE} stopOpacity="0.5" /><stop offset="1" stopColor={PURPLE} stopOpacity="0.1" /></linearGradient>
                <linearGradient id="gCap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={LIME} stopOpacity="0.5" /><stop offset="1" stopColor={LIME} stopOpacity="0.1" /></linearGradient>
              </defs>
              {[4, 80, 156, 232].map((y) => <line key={y} x1="0" y1={y} x2="680" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
              <polygon points={areaBetween(veloCum, renfoCum)} fill="url(#gVelo)" />
              <polygon points={areaBetween(renfoCum, capCum)} fill="url(#gRenfo)" />
              <polygon points={areaBetween(capCum, baseline)} fill="url(#gCap)" />
              <polyline points={lineOf(veloCum)} fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinejoin="round" />
              <polyline points={lineOf(renfoCum)} fill="none" stroke={PURPLE} strokeWidth="2" strokeLinejoin="round" />
              <polyline points={lineOf(capCum)} fill="none" stroke={LIME} strokeWidth="2" strokeLinejoin="round" />
              <line x1={currentX} y1="4" x2={currentX} y2="232" stroke={`${LIME}66`} strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            <div className="mt-1.5 flex justify-between">
              {WEEKS.map((x) => {
                const total = (x.cap + x.renfo + x.velo).toFixed(1).replace(".", ",");
                return (
                  <div key={x.label} className="flex flex-1 flex-col items-center gap-0.5 font-mono text-[9px]" style={{ color: x.current ? LIME : "hsl(var(--muted-foreground))" }}>
                    <span>{total}h</span>
                    <span>{x.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Répartition donut */}
        <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <PieChart className="size-5" style={{ color: LIME }} />
            <span className="font-semibold">Répartition</span>
          </div>
          <div className="flex items-center justify-center py-1.5">
            <div className="relative size-[150px] rounded-full" style={{ background: `conic-gradient(${LIME} 0 62%, ${PURPLE} 62% 82%, ${BLUE} 82% 100%)` }}>
              <div className="absolute inset-5 flex flex-col items-center justify-center gap-0.5 rounded-full bg-card">
                <span className="text-xl font-bold tabular-nums">41,5</span>
                <span className="font-mono text-[9px] text-muted-foreground">HEURES · 12 SEM</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {SPLIT.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <span className="size-2.5 shrink-0 rounded" style={{ background: s.color }} />
                <span className="flex-1 text-sm">{s.label}</span>
                <span className="font-mono text-[13px] text-foreground/80">{s.hours}</span>
                <span className="w-9 text-right font-mono text-xs font-bold" style={{ color: s.color }}>{s.pct}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* D+ cumulé + records */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Mountain className="size-5" style={{ color: LIME }} />
              <span className="font-semibold">Dénivelé cumulé</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold tabular-nums" style={{ color: LIME }}>38 400 <span className="text-xs font-medium text-muted-foreground">m D+</span></span>
              <span className="font-mono text-[10px] text-muted-foreground">objectif bloc : 52 000 m</span>
            </div>
          </div>
          <div className="h-3.5 overflow-hidden rounded-lg bg-secondary">
            <div className="h-full rounded-lg" style={{ width: "74%", background: `linear-gradient(90deg,${PURPLE},${LIME})` }} />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>74 % du bloc</span><span>≈ 3,5 × le D+ de la CCC</span>
          </div>
          <div className="flex gap-3 border-t border-border pt-3">
            {[["640", "D+ / SÉANCE MOY."], ["1 800", "MEILLEURE SORTIE"], ["61 m", "D+ / KM MOY."]].map(([v, l]) => (
              <div key={l} className="flex flex-1 flex-col gap-0.5">
                <span className="text-lg font-bold tabular-nums">{v}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3.5 rounded-[22px] border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <Medal className="size-5" style={{ color: LIME }} />
            <span className="font-semibold">Records récents</span>
          </div>
          {RECORDS.map((r) => (
            <div key={r.label} className="flex items-center gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${LIME}24` }}>
                <r.Icon className="size-5" style={{ color: LIME }} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{r.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{r.date}</span>
              </div>
              <span className="font-mono text-base font-bold">{r.value}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
