"use client";

// Flux de validation d'une séance (course / vélo) en 4 étapes :
// Source → Données → Nutrition → Ressenti. Accent lime. ⚠️ Données d'exemple.
import { useState } from "react";
import Link from "next/link";
import {
  X,
  Check,
  Watch,
  SquarePen,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
  Activity,
  Wind,
  BatteryCharging,
  Smile,
  TreePine,
  Route,
  Circle,
  Shuffle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LIME = "#D8FF3D";
const STEPS = ["Source", "Données", "Nutrition", "Ressenti"];

type Method = "fit" | "manual" | null;

export function ValiderFlow() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method>(null);
  const [fitLoaded, setFitLoaded] = useState(false);
  const [manualH, setH] = useState("");
  const [manualM, setM] = useState("");
  const [manualS, setS] = useState("");
  const [distance, setDistance] = useState("");
  const [terrain, setTerrain] = useState("sentier");
  const [gels, setGels] = useState(2);
  const [digest, setDigest] = useState("bon");
  const [nutritionDone, setNutritionDone] = useState<boolean | null>(null);
  const [rpe, setRpe] = useState(7);
  const [sensations, setSensations] = useState<Record<string, boolean>>({
    legs: true,
    breath: false,
    energy: true,
    motivation: true,
  });

  const canContinue =
    step === 1 ? method !== null : step === 2 && method === "fit" ? fitLoaded : true;

  const allure = (() => {
    const sec = (parseInt(manualH) || 0) * 3600 + (parseInt(manualM) || 0) * 60 + (parseInt(manualS) || 0);
    const d = parseFloat(distance.replace(",", "."));
    if (!sec || !d || d <= 0) return null;
    const perKm = sec / d;
    let mm = Math.floor(perKm / 60);
    let ss = Math.round(perKm % 60);
    if (ss === 60) { ss = 0; mm += 1; }
    return `${mm}:${String(ss).padStart(2, "0")}/km`;
  })();

  const digital = (v: string, set: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(e.target.value.replace(/\D/g, "").slice(0, 2));

  const inputCls =
    "rounded-xl border border-border bg-[#0F0D09] px-3.5 py-3 font-mono text-[15px] outline-none focus:border-primary";
  const labelCls = "font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground";

  const SENS: { key: string; label: string; Icon: LucideIcon }[] = [
    { key: "legs", label: "Jambes", Icon: Activity },
    { key: "breath", label: "Souffle", Icon: Wind },
    { key: "energy", label: "Énergie", Icon: BatteryCharging },
    { key: "motivation", label: "Motivation", Icon: Smile },
  ];
  const TERRAINS: { key: string; label: string; Icon: LucideIcon }[] = [
    { key: "sentier", label: "Sentier", Icon: TreePine },
    { key: "route", label: "Route", Icon: Route },
    { key: "piste", label: "Piste", Icon: Circle },
    { key: "mix", label: "Mix", Icon: Shuffle },
  ];

  // Bloc sélectionnable générique (bordure/fond lime si actif).
  const selStyle = (active: boolean) =>
    active ? { background: `${LIME}1a`, borderColor: LIME, color: "#F6F2EA" } : undefined;

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-0 sm:p-6"
      style={{ background: "radial-gradient(120% 90% at 50% -10%, #16130D 0%, #0B0A07 60%)" }}
    >
      <div className="flex max-h-dvh w-full max-w-[680px] flex-col overflow-hidden border border-border bg-[#141109] sm:max-h-[90vh] sm:rounded-[26px]">
        {/* Header + stepper */}
        <div className="flex shrink-0 flex-col gap-5 px-5 pt-5 sm:px-7 sm:pt-7">
          <div className="flex items-start justify-between gap-3.5">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: LIME }}>
                Séance terminée · Valider
              </span>
              <span className="text-xl font-bold tracking-tight sm:text-[26px]">Fractionné en côte · 6 × 2 min</span>
            </div>
            <Link
              href="/seances/renfo"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary"
              aria-label="Fermer"
            >
              <X className="size-5 text-muted-foreground" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-1.5">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const state = n < step ? "done" : n === step ? "active" : "todo";
                return (
                  <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                    <div
                      className="flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                      style={
                        state === "todo"
                          ? { background: "hsl(var(--secondary))", color: "#6E6759" }
                          : { background: LIME, color: "#0B0A07" }
                      }
                    >
                      {state === "done" ? <Check className="size-4" /> : n}
                    </div>
                    <span
                      className={cn(
                        "truncate text-xs font-medium",
                        state === "active" ? "text-foreground" : state === "done" ? "text-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-1 overflow-hidden rounded-md bg-secondary">
              <div className="h-full rounded-md transition-all" style={{ width: `${(step / 4) * 100}%`, background: LIME }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {/* STEP 1 : source */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="text-sm text-muted-foreground">Comment veux-tu enregistrer cette séance ?</span>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <button
                  onClick={() => setMethod("fit")}
                  className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 text-left"
                  style={selStyle(method === "fit")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: `${LIME}29` }}>
                      <Watch className="size-6" style={{ color: LIME }} />
                    </div>
                    <span className="rounded-full px-2 py-1 font-mono text-[9px] font-bold" style={{ background: LIME, color: "#0B0A07" }}>
                      RAPIDE
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Importer un fichier .FIT</span>
                    <span className="text-[13px] leading-relaxed text-muted-foreground">
                      Depuis ta montre Garmin. Toutes les données sont récupérées automatiquement.
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setMethod("manual")}
                  className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 text-left"
                  style={selStyle(method === "manual")}
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
                    <SquarePen className="size-6 text-foreground/80" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Saisie manuelle</span>
                    <span className="text-[13px] leading-relaxed text-muted-foreground">
                      Renseigne toi-même les données clés de ta séance.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 : données */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {method === "fit" && !fitLoaded && (
                <button
                  onClick={() => setFitLoaded(true)}
                  className="flex flex-col items-center gap-3 rounded-[18px] border border-dashed px-6 py-10 text-center"
                  style={{ borderColor: `${LIME}66`, background: `${LIME}0d` }}
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl" style={{ background: `${LIME}24` }}>
                    <UploadCloud className="size-7" style={{ color: LIME }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Dépose ton fichier .FIT ici</span>
                    <span className="text-[13px] text-muted-foreground">ou clique pour parcourir · Garmin, Coros, Suunto</span>
                  </div>
                </button>
              )}

              {method === "fit" && fitLoaded && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-2xl border p-3.5" style={{ background: "rgba(60,140,80,0.1)", borderColor: "rgba(90,170,110,0.3)" }}>
                    <CheckCircle2 className="size-5" style={{ color: "#68B87E" }} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold">activite_2026-07-02.fit</span>
                      <span className="font-mono text-[11px] text-muted-foreground">Importé · 1 248 points GPS · données complètes</span>
                    </div>
                  </div>
                  <span className={labelCls}>Données extraites — modifiables si besoin</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["DURÉE", "1h14"],
                      ["DISTANCE", "9,8 km"],
                      ["DÉNIVELÉ", "470 D+"],
                      ["FC MOY / MAX", "148 / 174"],
                      ["ALLURE MOY", "7:32/km"],
                      ["CHARGE", "92 TSS"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex flex-col gap-1.5 rounded-2xl border border-border bg-[#0F0D09] p-3.5">
                        <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground">{l}</span>
                        <span className="text-lg font-bold tabular-nums">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {method === "manual" && (
                <div className="flex flex-col gap-4">
                  <span className={labelCls}>Données de la séance</span>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Durée · h : min : s</label>
                      <div className="flex items-center gap-1 rounded-xl border border-border bg-[#0F0D09] px-3">
                        <input inputMode="numeric" value={manualH} onChange={digital(manualH, setH)} placeholder="01" className="w-full min-w-0 bg-transparent py-3 text-center font-mono text-[15px] outline-none" />
                        <span className="font-mono text-muted-foreground">:</span>
                        <input inputMode="numeric" value={manualM} onChange={digital(manualM, setM)} placeholder="14" className="w-full min-w-0 bg-transparent py-3 text-center font-mono text-[15px] outline-none" />
                        <span className="font-mono text-muted-foreground">:</span>
                        <input inputMode="numeric" value={manualS} onChange={digital(manualS, setS)} placeholder="00" className="w-full min-w-0 bg-transparent py-3 text-center font-mono text-[15px] outline-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Distance (km)</label>
                      <input value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="9.8" className={inputCls} />
                    </div>
                    {[["Dénivelé + (m)", "470"], ["Dénivelé − (m)", "470"], ["FC moyenne", "148"], ["FC max", "174"], ["Cadence (spm)", "172"]].map(([l, ph]) => (
                      <div key={l} className="flex flex-col gap-1.5">
                        <label className={labelCls}>{l}</label>
                        <input placeholder={ph} className={inputCls} />
                      </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Allure moy <span className="inline-flex items-center gap-0.5" style={{ color: LIME }}><Activity className="size-3" />auto</span>
                      </label>
                      <div className="flex items-center justify-between rounded-xl border border-dashed px-3.5 py-3" style={{ borderColor: `${LIME}59`, background: "#141109" }}>
                        <span className="font-mono text-[15px]" style={{ color: allure ? undefined : "#5C564A" }}>{allure ?? "— : — /km"}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">durée ÷ distance</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className={labelCls}>Type de terrain</span>
                    <div className="flex gap-2.5">
                      {TERRAINS.map((t) => (
                        <button key={t.key} onClick={() => setTerrain(t.key)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-[#0F0D09] px-2 py-2.5 text-sm font-semibold text-muted-foreground" style={selStyle(terrain === t.key)}>
                          <t.Icon className="size-4" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 : nutrition */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3.5 rounded-2xl border p-4" style={{ borderColor: `${LIME}33`, background: "hsl(var(--card))" }}>
                <div className="flex items-center gap-2.5">
                  <Activity className="size-5" style={{ color: LIME }} />
                  <div className="flex flex-col">
                    <span className="font-semibold">As-tu géré une nutrition sur cette séance ?</span>
                    <span className="text-xs text-muted-foreground">Inutile de remplir sur une sortie courte ou en endurance simple.</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={() => setNutritionDone(true)} className="flex-1 rounded-xl border border-border bg-[#0F0D09] py-3 text-sm font-semibold text-muted-foreground" style={selStyle(nutritionDone === true)}>
                    Oui, je renseigne
                  </button>
                  <button onClick={() => setNutritionDone(false)} className="flex-1 rounded-xl border border-border bg-[#0F0D09] py-3 text-sm font-semibold text-muted-foreground" style={selStyle(nutritionDone === false)}>
                    Non, passer
                  </button>
                </div>
              </div>

              {nutritionDone === true && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3.5">
                    <span className={labelCls}>Pendant l'effort</span>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Hydratation</label>
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-[#0F0D09] px-3.5">
                          <input placeholder="500" className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[15px] outline-none" />
                          <span className="font-mono text-xs text-muted-foreground">ml</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Glucides</label>
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-[#0F0D09] px-3.5">
                          <input placeholder="30" className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[15px] outline-none" />
                          <span className="font-mono text-xs text-muted-foreground">g</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-[#0F0D09] px-3.5 py-3">
                      <span className="text-sm text-foreground/80">Gels / barres consommés</span>
                      <div className="flex items-center gap-3.5">
                        <button onClick={() => setGels((g) => Math.max(0, g - 1))} className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary">
                          <Minus className="size-4" style={{ color: LIME }} />
                        </button>
                        <span className="min-w-5 text-center text-lg font-bold tabular-nums">{gels}</span>
                        <button onClick={() => setGels((g) => Math.min(20, g + 1))} className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary">
                          <Plus className="size-4" style={{ color: LIME }} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className={labelCls}>Confort digestif</span>
                    <div className="flex gap-2.5">
                      {[["bon", "Bon"], ["moyen", "Moyen"], ["dur", "Difficile"]].map(([k, l]) => (
                        <button key={k} onClick={() => setDigest(k)} className="flex-1 rounded-xl border border-border bg-[#0F0D09] py-3 text-sm font-semibold text-muted-foreground" style={selStyle(digest === k)}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {nutritionDone === false && (
                <div className="flex items-center gap-2.5 px-0.5 text-muted-foreground">
                  <ArrowRight className="size-5" />
                  <span className="text-[13px] leading-relaxed">Séance sans nutrition à consigner — clique sur Continuer pour passer au ressenti.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 : ressenti */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className={labelCls}>Effort perçu (RPE)</span>
                  <span className="font-mono text-[13px] font-bold" style={{ color: LIME }}>{rpe}/10</span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setRpe(n)}
                      className="flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-[#0F0D09] font-mono text-sm font-bold text-muted-foreground"
                      style={rpe === n ? { background: LIME, color: "#0B0A07", borderColor: LIME } : undefined}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Très facile</span>
                  <span>Maximal</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className={labelCls}>Sensations</span>
                <div className="flex flex-wrap gap-2.5">
                  {SENS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSensations((s) => ({ ...s, [t.key]: !s[t.key] }))}
                      className="flex items-center gap-2 rounded-xl border border-border bg-[#0F0D09] px-3.5 py-2.5 text-sm font-semibold text-muted-foreground"
                      style={selStyle(!!sensations[t.key])}
                    >
                      <t.Icon className="size-5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className={labelCls}>Notes</span>
                <textarea
                  placeholder="Comment tu t'es senti, terrain, météo, matériel…"
                  className="min-h-[76px] resize-y rounded-xl border border-border bg-[#0F0D09] px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-[#0F0D09] p-4">
                <span className={labelCls}>Récapitulatif</span>
                {[
                  `Données de séance · ${method === "fit" ? "Import .FIT" : "Saisie manuelle"}`,
                  "Nutrition renseignée",
                  `Ressenti · RPE ${rpe}/10`,
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-5" style={{ color: "#68B87E" }} />
                    <span className="text-sm text-foreground/80">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-7">
          {step > 1 ? (
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="flex items-center gap-1.5 py-3 text-sm font-semibold text-muted-foreground">
              <ArrowLeft className="size-5" />
              Retour
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              onClick={() => canContinue && setStep((s) => Math.min(4, s + 1))}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: canContinue ? LIME : "hsl(var(--secondary))", color: canContinue ? "#0B0A07" : "#6E6759" }}
            >
              Continuer
              <ArrowRight className="size-5" />
            </button>
          ) : (
            <Link href="/seances" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}>
              <CheckCircle2 className="size-5" />
              Valider la séance
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
