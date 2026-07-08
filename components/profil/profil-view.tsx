"use client";

// Écran Profil (maquette Claude Design, accent lime). ⚠️ Données d'exemple,
// sauf le nom/email de l'utilisateur connecté (passés en props). Déconnexion réelle.
import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Pencil,
  Award,
  HeartPulse,
  Activity,
  Footprints,
  Bike,
  Check,
  Plus,
  ChevronRight,
  Ruler,
  Languages,
  Bell,
  AlarmClock,
  LogOut,
  MapPin,
  CalendarDays,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LIME = "#D8FF3D";

const PHYSIO = [
  { label: "VMA", value: "16,5", unit: "km/h" },
  { label: "VO2MAX", value: "52", unit: "ml/kg" },
  { label: "FC MAX", value: "186", unit: "bpm" },
  { label: "ALLURE SEUIL", value: "4:35", unit: "/km" },
  { label: "FTP VÉLO", value: "265", unit: "W" },
  { label: "POIDS", value: "68", unit: "kg" },
];

const ZONE_DEFS = [
  { zone: "Z1", name: "Récup", color: "#4FB3D9", lo: 0.0, hi: 0.6 },
  { zone: "Z2", name: "Endurance", color: "#5BB98C", lo: 0.6, hi: 0.75 },
  { zone: "Z3", name: "Tempo", color: LIME, lo: 0.75, hi: 0.85 },
  { zone: "Z4", name: "Seuil", color: "#C9A227", lo: 0.85, hi: 0.92 },
  { zone: "Z5", name: "VO2max", color: "#C25A4A", lo: 0.92, hi: 1.0 },
];

const GEAR = [
  { name: "Speedgoat 6 · trail", km: "420 / 700 km", pct: 60, warn: false, Icon: Footprints },
  { name: "Mafate Speed · ultra", km: "180 / 800 km", pct: 22, warn: false, Icon: Footprints },
  { name: "Pegasus · route", km: "640 / 700 km", pct: 91, warn: true, Icon: Footprints },
  { name: "Home-trainer Tacx", km: "connecté", pct: 100, warn: false, Icon: Bike },
];

const INJ_META: Record<string, { label: string; accent: string }> = {
  actif: { label: "Actif", accent: LIME },
  surveille: { label: "Sous surveillance", accent: "#D9B44A" },
  resolu: { label: "Résolu", accent: "#5BB98C" },
};
const INJURIES = [
  { name: "Syndrome de l'essuie-glace", zone: "Genou droit · externe", since: "Depuis mars 2025", status: "actif", adaptation: "Renfo fessiers/quadriceps prioritaire, descentes progressives, +10% de D+ max par semaine." },
  { name: "Périostite tibiale", zone: "Tibia gauche", since: "Antécédent 2023", status: "surveille", adaptation: "Volume sur bitume limité, surveillance des chaussures > 600 km." },
  { name: "Entorse cheville", zone: "Cheville gauche", since: "Résolue nov. 2024", status: "resolu", adaptation: "Proprioception maintenue en prévention 1×/sem." },
];

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("flex flex-col gap-4 rounded-[22px] border border-border bg-card p-5 sm:p-6", className)}>{children}</section>;
}
function CardTitle({ Icon, children }: { Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-5" style={{ color: LIME }} />
      <span className="font-semibold">{children}</span>
    </div>
  );
}

export function ProfilView({
  fullName,
  initials,
  signOutAction,
}: {
  fullName: string;
  initials: string;
  signOutAction: () => void;
}) {
  const [editHr, setEditHr] = useState(false);
  const [fcMax, setFcMax] = useState(186);
  const [fcRepos, setFcRepos] = useState(44);
  const [notif, setNotif] = useState(true);
  const [rappels, setRappels] = useState(true);

  const hrr = Math.max(1, fcMax - fcRepos);
  const kv = (p: number) => Math.round(fcRepos + p * hrr);
  const zones = ZONE_DEFS.map((z, i) => {
    const hi = kv(z.hi);
    const lo = kv(z.lo);
    const bpm = i === 0 ? `< ${hi + 1}` : i === ZONE_DEFS.length - 1 ? `${lo + 1}–${fcMax}` : `${lo + 1}–${hi}`;
    return { ...z, bpm };
  });

  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button
      onClick={() => set(!on)}
      className="relative h-6 w-10 shrink-0 rounded-full transition-colors"
      style={{ background: on ? LIME : "hsl(var(--secondary))" }}
      aria-pressed={on}
    >
      <span className="absolute top-0.5 size-5 rounded-full bg-foreground transition-all" style={{ left: on ? "18px" : "2px" }} />
    </button>
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Mon compte</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profil</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-foreground">
          <Settings className="size-4" />
          Paramètres
        </button>
      </div>

      {/* Identity hero */}
      <section className="relative overflow-hidden rounded-[22px] border p-5 sm:p-7" style={{ borderColor: `${LIME}3d`, background: "hsl(var(--card))" }}>
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: `repeating-linear-gradient(115deg, ${LIME}0f 0 2px, transparent 2px 15px)` }} />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 text-2xl font-bold" style={{ background: "hsl(var(--secondary))", borderColor: `${LIME}66`, color: LIME }}>
            {initials}
          </div>
          <div className="flex min-w-[240px] flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-2xl font-bold">{fullName}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ background: LIME, color: "#0B0A07" }}>
                <Award className="size-3.5" />
                Coach IA Pro
              </span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">Ultra trail · 36 ans · Annecy (74) · membre depuis mars 2024</span>
            <div className="mt-1.5 flex flex-wrap gap-5">
              {[["3", "SAISONS"], ["4", "ULTRAS FINISHER"], ["2 640", "KM · 2025"], ["148 k", "D+ · 2025"]].map(([v, l]) => (
                <div key={l} className="flex flex-col">
                  <span className="text-lg font-bold tabular-nums">{v}</span>
                  <span className="font-mono text-[9px] tracking-wide text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}>
            <Pencil className="size-4" />
            Modifier
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* Physio */}
          <Section>
            <div className="flex items-center justify-between">
              <CardTitle Icon={HeartPulse}>Données physiologiques</CardTitle>
              <span className="font-mono text-[10px] text-muted-foreground">MAJ 2 juil</span>
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
              {PHYSIO.map((m) => (
                <div key={m.label} className="flex flex-col gap-1 rounded-[14px] border border-border bg-[#0F0D09] p-3.5">
                  <span className="font-mono text-[9px] tracking-wide text-muted-foreground">{m.label}</span>
                  <span className="text-xl font-bold tabular-nums">
                    {m.value} <span className="text-xs font-medium text-muted-foreground">{m.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* HR zones */}
          <Section>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <CardTitle Icon={Activity}>Zones de fréquence cardiaque</CardTitle>
              {!editHr ? (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted-foreground">FC max {fcMax} · repos {fcRepos}</span>
                  <button onClick={() => setEditHr(true)} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: LIME }}>
                    <Pencil className="size-4" />
                    Modifier
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                    MAX
                    <input type="number" value={fcMax} onChange={(e) => setFcMax(parseInt(e.target.value) || 0)} className="w-14 rounded-lg border bg-[#0F0D09] py-1.5 text-center font-mono text-[13px] outline-none" style={{ borderColor: `${LIME}66` }} />
                  </label>
                  <label className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                    REPOS
                    <input type="number" value={fcRepos} onChange={(e) => setFcRepos(parseInt(e.target.value) || 0)} className="w-14 rounded-lg border bg-[#0F0D09] py-1.5 text-center font-mono text-[13px] outline-none" style={{ borderColor: `${LIME}66` }} />
                  </label>
                  <button onClick={() => setEditHr(false)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: LIME, color: "#0B0A07" }}>
                    <Check className="size-4" />
                    OK
                  </button>
                </div>
              )}
            </div>
            {editHr && <span className="text-[11px] leading-relaxed text-muted-foreground">Les 5 zones se recalculent automatiquement (méthode Karvonen, sur la réserve cardiaque).</span>}
            <div className="flex flex-col gap-2.5 font-mono">
              {zones.map((z) => (
                <div key={z.zone} className="flex items-center gap-3">
                  <span className="w-6 text-[11px] font-bold" style={{ color: z.color }}>{z.zone}</span>
                  <span className="w-[74px] text-[11px] text-foreground/80">{z.name}</span>
                  <div className="h-2.5 flex-1 rounded-md bg-secondary">
                    <div className="h-full rounded-md" style={{ width: `${Math.round(z.hi * 100)}%`, background: z.color }} />
                  </div>
                  <span className="w-[82px] text-right text-[11px] text-muted-foreground">{z.bpm}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Gear */}
          <Section>
            <div className="flex items-center justify-between">
              <CardTitle Icon={Footprints}>Mon matériel</CardTitle>
              <button className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: LIME }}>
                <Plus className="size-4" />
                Ajouter
              </button>
            </div>
            {GEAR.map((g) => (
              <div key={g.name} className="flex items-center gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <g.Icon className="size-5 text-foreground/80" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{g.name}</span>
                    <span className="font-mono text-xs" style={{ color: g.warn ? "#C25A4A" : "hsl(var(--muted-foreground))" }}>{g.km}</span>
                  </div>
                  <div className="h-1.5 rounded-md bg-secondary">
                    <div className="h-full rounded-md" style={{ width: `${g.pct}%`, background: g.warn ? "#C25A4A" : LIME }} />
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {/* Objectif */}
          <Link href="/plan" className="flex flex-col gap-3 rounded-[22px] border bg-card p-5 transition-colors hover:border-border/80" style={{ borderColor: `${LIME}40` }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: LIME }}>Objectif en cours</span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
            <span className="text-lg font-bold">CCC · Chamonix</span>
            <span className="font-mono text-xs text-muted-foreground">28 août 2026 · 101 km · 6 100 D+</span>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 flex-1 rounded-md bg-secondary">
                <div className="h-full rounded-md" style={{ width: "42%", background: LIME }} />
              </div>
              <span className="font-mono text-[11px] font-bold" style={{ color: LIME }}>J-56</span>
            </div>
          </Link>

          {/* Injuries */}
          <Section>
            <div className="flex items-center justify-between">
              <CardTitle Icon={ShieldAlert}>Vigilance blessures</CardTitle>
              <button className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: LIME }}>
                <Plus className="size-4" />
                Ajouter
              </button>
            </div>
            <div className="flex items-center gap-3.5 rounded-[14px] border p-3" style={{ background: `${LIME}14`, borderColor: `${LIME}38` }}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${LIME} 0 45%, hsl(var(--secondary)) 45% 100%)` }}>
                <div className="flex size-8 items-center justify-center rounded-full bg-card font-mono text-[11px] font-bold" style={{ color: LIME }}>45</div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Risque modéré</span>
                <span className="text-xs leading-relaxed text-muted-foreground">1 point actif · l'IA renforce la prévention descente et plafonne le D+ hebdo.</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {INJURIES.map((inj) => {
                const m = INJ_META[inj.status];
                return (
                  <div key={inj.name} className="flex items-start gap-3 rounded-[13px] border border-border bg-[#0F0D09] p-3" style={{ borderLeft: `3px solid ${m.accent}` }}>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{inj.name}</span>
                        <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold" style={{ color: m.accent, background: `${m.accent}24` }}>{m.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 font-mono text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="size-3" />{inj.zone}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="size-3" />{inj.since}</span>
                      </div>
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-semibold" style={{ color: LIME }}>Adaptation IA · </span>
                        {inj.adaptation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Préférences */}
          <Section className="gap-1">
            <div className="pb-2.5">
              <CardTitle Icon={Ruler}>Préférences</CardTitle>
            </div>
            {[
              { Icon: Ruler, label: "Unités", value: "Métrique (km, m)", link: true },
              { Icon: Languages, label: "Langue", value: "Français", link: true },
              { Icon: Bell, label: "Notifications séances", toggle: "notif" as const },
              { Icon: AlarmClock, label: "Rappels quotidiens", toggle: "rappels" as const },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-3 border-t border-border py-3">
                <p.Icon className="size-5 text-muted-foreground" />
                <span className="flex-1 text-sm">{p.label}</span>
                {"value" in p && p.value && <span className="font-mono text-xs text-foreground/80">{p.value}</span>}
                {p.link && <ChevronRight className="size-5 text-muted-foreground" />}
                {p.toggle === "notif" && <Toggle on={notif} set={setNotif} />}
                {p.toggle === "rappels" && <Toggle on={rappels} set={setRappels} />}
              </div>
            ))}
          </Section>

          {/* Logout (réel) */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-[14px] border py-3.5 text-sm font-semibold"
              style={{ color: "#C25A4A", borderColor: "rgba(194,90,74,0.3)" }}
            >
              <LogOut className="size-5" />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
