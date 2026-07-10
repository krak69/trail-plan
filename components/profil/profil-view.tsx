// Écran Profil — branché sur la table `profiles` (server component, lecture réelle).
// Physio + zones FC + préférences = vraies données. Matériel & blessures encore
// en données d'exemple (prochaine étape).
import Link from "next/link";
import {
  Settings,
  Pencil,
  Award,
  HeartPulse,
  Activity,
  Footprints,
  Bike,
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
import type { Profile } from "@/lib/types";

const LIME = "#D8FF3D";

const ZONE_DEFS = [
  { zone: "Z1", name: "Récup", color: "#4FB3D9", lo: 0.0, hi: 0.6 },
  { zone: "Z2", name: "Endurance", color: "#5BB98C", lo: 0.6, hi: 0.75 },
  { zone: "Z3", name: "Tempo", color: LIME, lo: 0.75, hi: 0.85 },
  { zone: "Z4", name: "Seuil", color: "#C9A227", lo: 0.85, hi: 0.92 },
  { zone: "Z5", name: "VO2max", color: "#C25A4A", lo: 0.92, hi: 1.0 },
];

// --- Données encore fictives (matériel & blessures) ---
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
  profile,
  fullName,
  initials,
  signOutAction,
  togglePrefAction,
}: {
  profile: Profile;
  fullName: string;
  initials: string;
  signOutAction: () => void;
  togglePrefAction: (formData: FormData) => void;
}) {
  // Données physiologiques réelles (— si non renseigné).
  const physio = [
    { label: "VMA", value: profile.vma, unit: "km/h" },
    { label: "VO2MAX", value: profile.vo2max, unit: "ml/kg" },
    { label: "FC MAX", value: profile.fc_max, unit: "bpm" },
    { label: "ALLURE SEUIL", value: profile.threshold_pace, unit: "/km" },
    { label: "FTP VÉLO", value: profile.ftp, unit: "W" },
    { label: "POIDS", value: profile.weight_kg, unit: "kg" },
  ];

  // Zones FC (Karvonen) calculées depuis fc_max / fc_rest réels.
  const fcMax = profile.fc_max;
  const fcRest = profile.fc_rest;
  const hasHr = fcMax != null && fcRest != null && fcMax > fcRest;
  const zones = hasHr
    ? ZONE_DEFS.map((z, i) => {
        const hrr = fcMax! - fcRest!;
        const kv = (p: number) => Math.round(fcRest! + p * hrr);
        const hi = kv(z.hi);
        const lo = kv(z.lo);
        const bpm = i === 0 ? `< ${hi + 1}` : i === ZONE_DEFS.length - 1 ? `${lo + 1}–${fcMax}` : `${lo + 1}–${hi}`;
        return { ...z, bpm };
      })
    : [];

  const Toggle = ({ prefKey, on }: { prefKey: string; on: boolean }) => (
    <form action={togglePrefAction}>
      <input type="hidden" name="key" value={prefKey} />
      <input type="hidden" name="current" value={String(on)} />
      <button
        type="submit"
        className="relative h-6 w-10 shrink-0 rounded-full transition-colors"
        style={{ background: on ? LIME : "hsl(var(--secondary))" }}
        aria-pressed={on}
      >
        <span className="absolute top-0.5 size-5 rounded-full bg-foreground transition-all" style={{ left: on ? "18px" : "2px" }} />
      </button>
    </form>
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-8 pt-6 sm:px-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Mon compte</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profil</h1>
        </div>
        <Link href="/profil/modifier" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-foreground">
          <Settings className="size-4" />
          Paramètres
        </Link>
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
            <span className="font-mono text-xs text-muted-foreground">
              {[profile.experience_level, profile.city].filter(Boolean).join(" · ") || "Complète ton profil →"}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-5">
              {/* Stats agrégées : encore fictives (viendront des séances) */}
              {[["3", "SAISONS"], ["4", "ULTRAS FINISHER"], ["2 640", "KM · 2025"], ["148 k", "D+ · 2025"]].map(([v, l]) => (
                <div key={l} className="flex flex-col">
                  <span className="text-lg font-bold tabular-nums">{v}</span>
                  <span className="font-mono text-[9px] tracking-wide text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/profil/modifier" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold" style={{ background: LIME, color: "#0B0A07" }}>
            <Pencil className="size-4" />
            Modifier
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* Physio */}
          <Section>
            <div className="flex items-center justify-between">
              <CardTitle Icon={HeartPulse}>Données physiologiques</CardTitle>
              <Link href="/profil/modifier" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: LIME }}>
                <Pencil className="size-4" />
                Modifier
              </Link>
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
              {physio.map((m) => (
                <div key={m.label} className="flex flex-col gap-1 rounded-[14px] border border-border bg-[#0F0D09] p-3.5">
                  <span className="font-mono text-[9px] tracking-wide text-muted-foreground">{m.label}</span>
                  <span className="text-xl font-bold tabular-nums">
                    {m.value ?? "—"} {m.value != null && <span className="text-xs font-medium text-muted-foreground">{m.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* HR zones */}
          <Section>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <CardTitle Icon={Activity}>Zones de fréquence cardiaque</CardTitle>
              {hasHr ? (
                <span className="font-mono text-[11px] text-muted-foreground">FC max {fcMax} · repos {fcRest}</span>
              ) : (
                <Link href="/profil/modifier" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: LIME }}>
                  <Pencil className="size-4" />
                  Renseigner
                </Link>
              )}
            </div>
            {hasHr ? (
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
            ) : (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Renseigne ta FC max et ta FC de repos (bouton « Renseigner ») pour calculer automatiquement tes 5 zones
                (méthode Karvonen).
              </p>
            )}
          </Section>

          {/* Gear (encore fictif) */}
          <Section>
            <div className="flex items-center justify-between">
              <CardTitle Icon={Footprints}>Mon matériel</CardTitle>
              <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">bientôt</span>
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

          {/* Injuries (encore fictif) */}
          <Section>
            <div className="flex items-center justify-between">
              <CardTitle Icon={ShieldAlert}>Vigilance blessures</CardTitle>
              <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">bientôt</span>
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

          {/* Préférences (réelles) */}
          <Section className="gap-1">
            <div className="pb-2.5">
              <CardTitle Icon={Ruler}>Préférences</CardTitle>
            </div>
            <div className="flex items-center gap-3 border-t border-border py-3">
              <Ruler className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Unités</span>
              <span className="font-mono text-xs text-foreground/80">{profile.units === "imperial" ? "Impérial (mi, ft)" : "Métrique (km, m)"}</span>
            </div>
            <div className="flex items-center gap-3 border-t border-border py-3">
              <Languages className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Langue</span>
              <span className="font-mono text-xs text-foreground/80">{profile.language === "en" ? "English" : "Français"}</span>
            </div>
            <div className="flex items-center gap-3 border-t border-border py-3">
              <Bell className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Notifications séances</span>
              <Toggle prefKey="notif_sessions" on={profile.notif_sessions} />
            </div>
            <div className="flex items-center gap-3 border-t border-border py-3">
              <AlarmClock className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Rappels quotidiens</span>
              <Toggle prefKey="notif_daily" on={profile.notif_daily} />
            </div>
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
