"use client";

// Écran Plan (maquette Claude Design, accent lime). Assistant de création
// d'objectif en 4 étapes (Objectif → Disponibilités → Profil → Générer).
// ⚠️ Données d'exemple, aucune persistance pour l'instant.
import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Flag,
  Footprints,
  Dumbbell,
  Bike,
  Zap,
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  Trophy,
  Moon,
  Sparkles,
  TriangleAlert,
  CalendarPlus,
  ChevronRight,
  Minus,
  HeartPulse,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LIME = "#D8FF3D";
const PURPLE = "#8C7AE0";
const BLUE = "#4FB3D9";
const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const DAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const STEP_LABELS = ["Objectif", "Disponibilités", "Profil athlète", "Générer"];
const EXP_OPTS = ["Débutant course à pied", "1er trail", "1 à 2 trails", "1er ultra", "1 à 2 ultras", "Ultra confirmé (5+)"];
const BLESS_OPTS = ["Genou (essuie-glace)", "Tendon d'Achille", "Cheville instable", "Lombaires", "Périostite"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-mono text-xs transition-colors"
      style={active ? { background: LIME, color: "#0B0A07", borderColor: LIME, fontWeight: 700 } : { background: "#0F0D09", color: "#C9C0B2", borderColor: "hsl(var(--border))" }}
    >
      {children}
    </button>
  );
}

const inputCls = "rounded-xl border border-border bg-[#0F0D09] px-3.5 py-3 font-mono text-sm text-foreground outline-none focus:border-primary";
const labelCls = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";

function Stepper({ v, min, max, set }: { v: number; min: number; max: number; set: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => set(Math.max(min, v - 1))} className="flex size-7 items-center justify-center rounded-lg border border-border bg-card"><Minus className="size-4" /></button>
      <span className="w-5 text-center font-mono text-sm font-bold tabular-nums">{v}</span>
      <button onClick={() => set(Math.min(max, v + 1))} className="flex size-7 items-center justify-center rounded-lg border border-border bg-card"><Plus className="size-4" /></button>
    </div>
  );
}

type ObjectiveView = {
  name: string;
  subtitle: string | null;
  dateLine: string;
  jminus: number | null;
  priority: string;
} | null;

export function PlanView({ objectiveView }: { objectiveView: ObjectiveView }) {
  const [step, setStep] = useState(1);
  const [race, setRace] = useState({ name: "CCC · Courmayeur – Champex – Chamonix", dateISO: "2026-08-28", startISO: "2026-07-06", dist: "101", dplus: "6 100", targetH: "17", targetM: "30", targetS: "00", prio: "A" });
  const [volume, setVolume] = useState(8);
  const [sessions, setSessions] = useState({ cap: 3, renfo: 2, velo: 1 });
  const [intensif, setIntensif] = useState(1);
  const [off, setOff] = useState<string[]>(["LUN"]);
  const [pref, setPref] = useState<Record<string, string[]>>({ longue: ["SAM"], intensif: ["MER"], renfo: ["MAR"], velo: ["JEU"] });
  const [gear, setGear] = useState<Record<string, boolean>>({ ht: true, salle: false, montagne: true, elastique: true });
  const [prof, setProf] = useState({ vmaMode: "known", vma: "16,5", ftp: "265", seuil: "4:35", exp: "1 à 2 ultras", bless: ["Genou (essuie-glace)"] as string[] });

  const setR = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setRace({ ...race, [k]: e.target.value });
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${parseInt(d)} ${MOIS[parseInt(m) - 1]} ${y}`;
  };
  const totalDays = Math.max(0, Math.round((+new Date(race.dateISO) - +new Date(race.startISO)) / 86400000));
  const weeksN = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;
  const planLengthLabel = totalDays <= 0 ? "Choisis une date de début antérieure à l'objectif" : `${weeksN} semaine${weeksN > 1 ? "s" : ""}${remDays ? ` et ${remDays} j` : ""} jusqu'à l'objectif`;
  const totalSessions = sessions.cap + sessions.renfo + sessions.velo;

  const gridRows: { key: string; label: string; color: string; Icon: LucideIcon; target: number }[] = [
    { key: "longue", label: "Sortie longue", color: LIME, Icon: Footprints, target: 1 },
    { key: "intensif", label: "Séance intensive", color: LIME, Icon: Zap, target: intensif },
    { key: "renfo", label: "Renfo", color: PURPLE, Icon: Dumbbell, target: sessions.renfo },
    { key: "velo", label: "Vélo", color: BLUE, Icon: Bike, target: sessions.velo },
  ];

  // Warnings (contrôles simples)
  const warnings: string[] = [];
  const byDay: Record<string, string[]> = {};
  Object.entries(pref).forEach(([k, arr]) => arr.forEach((d) => (byDay[d] = [...(byDay[d] || []), k])));
  const names: Record<string, string> = { longue: "sortie longue", intensif: "séance intensive", renfo: "renfo", velo: "vélo" };
  Object.entries(byDay).forEach(([d, ks]) => { if (ks.length > 1) warnings.push(`Conflit le ${d} : ${ks.map((k) => names[k]).join(" + ")} le même jour.`); });
  Object.entries(pref).forEach(([k, arr]) => arr.forEach((d) => { if (off.includes(d)) warnings.push(`La ${names[k]} tombe un jour off (${d}).`); }));
  if (intensif > sessions.cap) warnings.push(`Séances intensives (${intensif}) dépassent le nombre de séances course prévu (${sessions.cap}).`);

  const recap = [
    { Icon: Flag, k: "OBJECTIF", v: `${race.name} · ${fmtDate(race.dateISO)} · ${race.dist} km / ${race.dplus} D+ · ${race.targetH}:${race.targetM}:${race.targetS} · priorité ${race.prio}` },
    { Icon: Clock, k: "VOLUME", v: `${String(volume).replace(".", ",")} h / sem · ${totalSessions} séances (${sessions.cap} course dont ${intensif} intensive · ${sessions.renfo} renfo · ${sessions.velo} vélo)` },
    { Icon: CalendarDays, k: "JOURS", v: `Longue ${pref.longue.join("/")} · intensif ${pref.intensif.join("/")} · renfo ${pref.renfo.join("/")} · vélo ${pref.velo.join("/")} · off ${off.join(", ") || "—"}` },
    { Icon: HeartPulse, k: "PROFIL", v: `VMA ${prof.vma} km/h · FTP ${prof.ftp} W · seuil ${prof.seuil} /km · ${prof.exp}` },
    { Icon: TriangleAlert, k: "VIGILANCE", v: prof.bless.length ? prof.bless.join(" · ") : "Aucune blessure signalée" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Le moteur de ton entraînement</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Plan</h1>
        </div>
        <Link href="/plan/objectif" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-foreground">
          <Plus className="size-4" />
          {objectiveView ? "Modifier l'objectif" : "Nouvel objectif"}
        </Link>
      </div>

      {/* Objectifs passés */}
      <div className="flex flex-col gap-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Objectifs passés</span>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { name: "Grand Trail du Saint-Jacques", meta: "Juin 2025 · 73 km · 3 300 D+ · Finisher 10 h 58 · plan 16 sem" },
            { name: "Marathon du Mont-Blanc", meta: "Juin 2024 · 42 km · 2 730 D+ · Finisher 5 h 51 · plan 12 sem" },
          ].map((o) => (
            <div key={o.name} className="flex items-center gap-3.5 rounded-2xl border border-border bg-[#100E0A] p-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card"><Trophy className="size-5 text-muted-foreground" /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-foreground/80">{o.name}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] text-muted-foreground">TERMINÉ</span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">{o.meta}</span>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Objectif en cours + wizard */}
      <div className="flex flex-col">
        <span className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">Objectif en cours</span>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-t-[22px] border p-6" style={{ borderColor: `${LIME}52`, background: "hsl(var(--card))" }}>
          <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: `repeating-linear-gradient(115deg, ${LIME}0f 0 2px, transparent 2px 15px)` }} />
          {objectiveView ? (
            <div className="relative flex flex-wrap items-center gap-6">
              <div className="flex min-w-[300px] flex-1 flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ background: LIME, color: "#0B0A07" }}><Flag className="size-3.5" />Objectif {objectiveView.priority}</span>
                  <span className="font-mono text-xs font-bold" style={{ color: LIME }}>{objectiveView.jminus != null ? `J-${objectiveView.jminus}` : "—"}</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">{objectiveView.name}</span>
                {objectiveView.subtitle && <span className="text-sm text-muted-foreground">{objectiveView.subtitle}</span>}
                <span className="font-mono text-[13px] text-foreground/80">{objectiveView.dateLine}</span>
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="flex flex-1 gap-1">
                    {[1, 1, 1, 0, 0, 0].map((on, i) => (
                      <div key={i} className="h-2 flex-1 rounded-md" style={{ background: on ? LIME : "hsl(var(--secondary))" }} />
                    ))}
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">Progression du plan · à venir</span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <Link href="/seances" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}><Footprints className="size-4" />Voir les séances</Link>
                <Link href="/plan/objectif" className="text-center font-mono text-[10px] text-muted-foreground hover:text-foreground">Modifier l'objectif</Link>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-start gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Aucun objectif défini</span>
              <span className="text-xl font-bold">Définis ta course cible</span>
              <span className="text-sm text-muted-foreground">Renseigne ta prochaine course pour piloter ton dashboard et ton plan.</span>
              <Link href="/plan/objectif" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}><Plus className="size-4" />Créer un objectif</Link>
            </div>
          )}
        </div>

        {/* Wizard */}
        <div className="flex flex-col gap-5 rounded-b-[22px] border border-t-0 border-border bg-card p-6">
          {/* Stepper */}
          <div className="flex flex-wrap items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <button key={label} onClick={() => setStep(n)} className={cn("flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px]", active ? "font-bold" : "font-medium")} style={active ? { background: `${LIME}1f`, color: LIME, border: `1px solid ${LIME}4d` } : { color: done ? "#C9C0B2" : "hsl(var(--muted-foreground))", border: "1px solid transparent" }}>
                  <span className="flex size-5 items-center justify-center rounded-full font-mono text-[11px] font-bold" style={done || active ? { background: LIME, color: "#0B0A07" } : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                    {done ? <Check className="size-3.5" /> : n}
                  </span>
                  {label}
                </button>
              );
            })}
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">Étape {step} / 4</span>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid gap-3.5 sm:grid-cols-3">
              <label className="col-span-full flex flex-col gap-2">
                <span className={labelCls}>Nom de la course</span>
                <input value={race.name} onChange={setR("name")} className={inputCls} />
              </label>
              <label className="flex flex-col gap-2"><span className={labelCls}>Date</span><input type="date" value={race.dateISO} onChange={setR("dateISO")} className={inputCls} style={{ colorScheme: "dark" }} /></label>
              <label className="flex flex-col gap-2"><span className={labelCls}>Début du plan</span><input type="date" value={race.startISO} onChange={setR("startISO")} className={inputCls} style={{ colorScheme: "dark" }} /></label>
              <span className="col-span-full flex items-center gap-2 font-mono text-[11px] text-muted-foreground"><Clock className="size-4" style={{ color: LIME }} />{planLengthLabel}</span>
              <label className="flex flex-col gap-2"><span className={labelCls}>Distance (km)</span><input value={race.dist} onChange={setR("dist")} className={inputCls} /></label>
              <label className="flex flex-col gap-2"><span className={labelCls}>D+ (m)</span><input value={race.dplus} onChange={setR("dplus")} className={inputCls} /></label>
              <div className="flex flex-col gap-2">
                <span className={labelCls}>Temps visé (HH:MM:SS)</span>
                <div className="flex items-center gap-1.5">
                  <input value={race.targetH} onChange={setR("targetH")} maxLength={2} className={`${inputCls} w-full text-center`} />
                  <span className="text-muted-foreground">:</span>
                  <input value={race.targetM} onChange={setR("targetM")} maxLength={2} className={`${inputCls} w-full text-center`} />
                  <span className="text-muted-foreground">:</span>
                  <input value={race.targetS} onChange={setR("targetS")} maxLength={2} className={`${inputCls} w-full text-center`} />
                </div>
              </div>
              <div className="col-span-full flex flex-col gap-2 sm:col-span-2">
                <span className={labelCls}>Priorité de l'objectif</span>
                <div className="flex gap-2.5">
                  {["A", "B", "C"].map((p) => <Chip key={p} active={race.prio === p} onClick={() => setRace({ ...race, prio: p })}>Priorité {p}</Chip>)}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-[#0F0D09] p-4">
                  <div className="flex items-baseline justify-between">
                    <span className={labelCls}>Volume hebdomadaire</span>
                    <span className="font-mono text-base font-bold" style={{ color: LIME }}>{String(volume).replace(".", ",")} h / sem</span>
                  </div>
                  <input type="range" min={4} max={15} step={0.5} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full" style={{ accentColor: LIME }} />
                  <div className="flex justify-between font-mono text-[10px] text-muted-foreground"><span>4 h</span><span>15 h</span></div>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-[#0F0D09] p-4">
                  <div className="flex items-baseline justify-between">
                    <span className={labelCls}>Séances / semaine</span>
                    <span className="font-mono text-xs text-foreground/80">{totalSessions} au total</span>
                  </div>
                  {([["cap", "Course à pied", LIME, Footprints], ["renfo", "Renfo", PURPLE, Dumbbell], ["velo", "Vélo", BLUE, Bike]] as const).map(([k, label, color, Icon]) => (
                    <div key={k} className="flex items-center gap-2.5">
                      <Icon className="size-4" style={{ color }} />
                      <span className="flex-1 text-sm font-medium">{label}</span>
                      <Stepper v={sessions[k]} min={0} max={6} set={(n) => setSessions({ ...sessions, [k]: n })} />
                    </div>
                  ))}
                  <div className="my-1 h-px bg-border" />
                  <div className="flex items-center gap-2.5">
                    <Zap className="size-4" style={{ color: LIME }} />
                    <span className="flex-1 text-[13px] font-medium text-foreground/80">Séances intensives / sem</span>
                    <Stepper v={intensif} min={0} max={3} set={setIntensif} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className={labelCls}>Jours off (vie perso, pas de séance)</span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => {
                    const sel = off.includes(d);
                    return (
                      <button key={d} onClick={() => setOff(toggle(off, d))} className="rounded-full border px-3 py-2 font-mono text-xs" style={sel ? { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))", textDecoration: "line-through", fontWeight: 700 } : { background: "#0F0D09", color: "#C9C0B2", borderColor: "hsl(var(--border))" }}>{d}</button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className={labelCls}>Jour préféré par type de séance</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Clique une case pour choisir</span>
                </div>
                <div className="flex flex-col gap-2 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="w-[150px] shrink-0" />
                    {DAYS.map((d) => <span key={d} className="w-10 text-center font-mono text-[10px] text-muted-foreground">{d}</span>)}
                  </div>
                  {gridRows.map((row) => (
                    <div key={row.key} className="flex items-center gap-1.5">
                      <div className="flex w-[150px] shrink-0 items-center gap-2">
                        <row.Icon className="size-4" style={{ color: row.color }} />
                        <span className="text-[13px] font-medium">{row.label}</span>
                        <span className="ml-auto font-mono text-[9px] text-muted-foreground">{pref[row.key].length}/{row.target} j</span>
                      </div>
                      {DAYS.map((d, i) => {
                        const isOff = off.includes(d);
                        const sel = pref[row.key].includes(d);
                        return (
                          <button
                            key={d}
                            disabled={isOff}
                            onClick={() => setPref({ ...pref, [row.key]: toggle(pref[row.key], d) })}
                            className="flex h-[34px] w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px]"
                            style={isOff ? { background: "hsl(var(--background))", color: "#3E382D", borderColor: "hsl(var(--border))", borderStyle: "dashed" } : sel ? { background: row.color, color: "#0B0A07", borderColor: row.color, fontWeight: 700 } : { background: "#0F0D09", color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }}
                          >
                            {DAYS_SHORT[i]}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className={labelCls}>Matériel &amp; environnement</span>
                <div className="flex flex-wrap gap-2">
                  {([["ht", "Home-trainer", Bike], ["salle", "Salle de sport", Dumbbell], ["montagne", "Terrain montagneux", Footprints], ["elastique", "Élastiques & step", Zap]] as const).map(([k, label, Icon]) => (
                    <Chip key={k} active={gear[k]} onClick={() => setGear({ ...gear, [k]: !gear[k] })}><Icon className="size-3.5" />{label}</Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3.5 sm:grid-cols-3">
                <label className="col-span-full flex flex-col gap-2">
                  <span className={labelCls}>VMA (km/h)</span>
                  <input value={prof.vma} onChange={(e) => setProf({ ...prof, vma: e.target.value })} className={`${inputCls} sm:w-52`} />
                </label>
                <label className="flex flex-col gap-2"><span className={labelCls}>FTP vélo (W)</span><input value={prof.ftp} onChange={(e) => setProf({ ...prof, ftp: e.target.value })} className={inputCls} /></label>
                <label className="flex flex-col gap-2"><span className={labelCls}>Allure seuil (min/km)</span><input value={prof.seuil} onChange={(e) => setProf({ ...prof, seuil: e.target.value })} className={inputCls} /></label>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className={labelCls}>Expérience trail / ultra</span>
                <div className="flex flex-wrap gap-2">
                  {EXP_OPTS.map((x) => <Chip key={x} active={prof.exp === x} onClick={() => setProf({ ...prof, exp: x })}>{x}</Chip>)}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className={labelCls}>Historique blessures · l'IA adaptera le renfo</span>
                <div className="flex flex-wrap gap-2">
                  {BLESS_OPTS.map((b) => <Chip key={b} active={prof.bless.includes(b)} onClick={() => setProf({ ...prof, bless: toggle(prof.bless, b) })}>{b}</Chip>)}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="flex flex-col gap-3">
                <span className={labelCls}>Récapitulatif</span>
                {recap.map((r) => (
                  <div key={r.k} className="flex items-start gap-3 rounded-[13px] border border-border bg-[#0F0D09] p-3">
                    <r.Icon className="mt-0.5 size-4 shrink-0" style={{ color: LIME }} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{r.k}</span>
                      <span className="text-sm leading-relaxed">{r.v}</span>
                    </div>
                  </div>
                ))}
                {warnings.map((w) => (
                  <div key={w} className="flex items-center gap-2.5 rounded-[13px] border p-3" style={{ background: `${LIME}14`, borderColor: `${LIME}4d` }}>
                    <TriangleAlert className="size-4 shrink-0" style={{ color: LIME }} />
                    <span className="text-[13px] text-foreground/80">{w}</span>
                  </div>
                ))}
              </div>
              <div className="relative flex flex-col items-center gap-3.5 overflow-hidden rounded-[18px] border p-6 text-center" style={{ borderColor: `${LIME}59`, background: "hsl(var(--card))" }}>
                <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: `repeating-linear-gradient(115deg, ${LIME}12 0 2px, transparent 2px 13px)` }} />
                <div className="relative flex size-13 items-center justify-center rounded-2xl p-3" style={{ background: `${LIME}29` }}><Sparkles className="size-7" style={{ color: LIME }} /></div>
                <span className="relative text-base font-bold">Prêt à générer ton plan sur mesure</span>
                <span className="relative text-[13px] leading-relaxed text-muted-foreground">{planLengthLabel} · périodisation, charge et renfo adaptés à ton profil et tes blessures.</span>
                <button className="relative inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}><Sparkles className="size-5" />Générer mon plan</button>
                <span className="relative font-mono text-[10px] text-muted-foreground">Chaque séance restera modifiable</span>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="inline-flex items-center gap-2 rounded-xl border border-border bg-[#0F0D09] px-4 py-2.5 text-sm font-semibold text-foreground/80 disabled:opacity-40">
              <ArrowLeft className="size-4" />
              Précédent
            </button>
            {step < 4 && (
              <button onClick={() => setStep(Math.min(4, step + 1))} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}>
                Continuer
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Objectifs futurs */}
      <div className="flex flex-col gap-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Objectifs futurs</span>
        <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-dashed border-border bg-[#100E0A] p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card"><Moon className="size-5 text-muted-foreground" /></div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold">SaintéLyon</span>
              <span className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold" style={{ background: "#C9C0B2", color: "#0B0A07" }}>À PLANIFIER</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">5 décembre 2026 · 78 km · 2 200 D+ · course de nuit</span>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground/80"><CalendarPlus className="size-4" />Préparer cet objectif</button>
        </div>
      </div>
    </main>
  );
}
