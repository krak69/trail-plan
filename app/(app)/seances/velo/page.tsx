import { Clock, Repeat, Zap, RefreshCw, LineChart, Bike } from "lucide-react";

import { SessionDetail, type SessionDetailData } from "@/components/seances/session-detail";

// Détail d'une séance de vélo / home-trainer (accent bleu). Données d'exemple.
const BLUE = "#4FB3D9";
const WARM = "#2E6E85"; // échauffement
const DARK = "#24404A"; // récup

const VELO: SessionDetailData = {
  accent: BLUE,
  TypeIcon: Bike,
  typeLabel: "Vélo",
  date: "Jeudi 30 juin · Bloc spécifique 3/6",
  breadcrumb: "Séances",
  title: "Vélo · Travail au seuil · 2 × 15 min",
  subtitle: "Cardio sans impact · Sweet spot / seuil · préserve les jambes du trail",
  objective:
    "Travailler le seuil et l'endurance de puissance sans traumatisme musculaire. Le vélo permet d'accumuler de la charge cardio pendant que les jambes récupèrent des chocs de la course. Tiens une puissance régulière et une cadence fluide sur chaque bloc.",
  metrics: [
    { Icon: Clock, value: "1h15", label: "DURÉE CIBLE" },
    { Icon: Repeat, value: "2", unit: "× 15 min", label: "INTERVALLES" },
    { Icon: Zap, value: "240", unit: "W", label: "PUISSANCE CIBLE" },
    { Icon: RefreshCw, value: "90", unit: "rpm", label: "CADENCE" },
    { Icon: LineChart, value: "78", unit: "TSS", label: "CHARGE ESTIMÉE" },
  ],
  diagram: {
    title: "Profil de puissance",
    legend: [
      { color: WARM, label: "Échauffement" },
      { color: BLUE, label: "Seuil" },
      { color: DARK, label: "Récup" },
    ],
    yLabels: ["250W", "200W", "150W", "100W"],
    bars: [
      { flex: 5, height: 24, color: WARM, opacity: 0.6 },
      { flex: 6, height: 40, color: WARM, opacity: 0.8 },
      { flex: 5, height: 54, color: WARM },
      { flex: 16, height: 80, color: BLUE },
      { flex: 5, height: 32, color: DARK },
      { flex: 16, height: 80, color: BLUE },
      { flex: 6, height: 40, color: WARM, opacity: 0.8 },
      { flex: 5, height: 24, color: WARM, opacity: 0.6 },
    ],
    phases: [
      { flex: 16, color: WARM, label: "Échauffement · 15 min" },
      { flex: 37, color: BLUE, label: "2 × 15 min seuil / 5 min récup" },
      { flex: 11, color: WARM, label: "Retour au calme · 10 min" },
    ],
  },
  structure: {
    meta: "3 phases · 1h15",
    phases: [
      {
        dotColor: WARM,
        title: "Échauffement",
        meta: "15 min · Z1 → Z3",
        desc: "Montée progressive de la puissance, puis 3 sprints de 10 s en cadence élevée pour activer les jambes avant les blocs.",
        chips: ["120 → 190 W", "3 × 10 s sprint"],
      },
      {
        dotColor: BLUE,
        title: "Bloc principal · 2 × 15 min au seuil",
        meta: "~35 min · Z4",
        desc: "Puissance stable à ~90 % de la FTP, cadence fluide de 88 à 92 rpm. Reste assis, buste relâché. La régularité de la puissance prime sur les à-coups.",
        effortRecup: {
          effort: { label: "15 min seuil", sub: "235–250 W · Z4" },
          recup: { label: "5 min souple", sub: "130 W · Z1" },
        },
      },
      {
        dotColor: DARK,
        title: "Retour au calme",
        meta: "10 min · Z1",
        desc: "Pédalage souple en cadence élevée et petit braquet pour évacuer et relâcher les jambes.",
        chips: ["< 140 W · 95 rpm"],
      },
    ],
  },
  nutrition: {
    note: "Sur home-trainer, l'hydratation prime : la sudation est plus forte sans vent. Boire régulièrement dès l'échauffement.",
    items: [
      { title: "750 ml / h", sub: "Eau + électrolytes · home-trainer = forte sudation" },
      { title: "30 g glucides / h", sub: "Boisson glucidique pendant les blocs seuil" },
    ],
  },
  zones: {
    title: "Zones de puissance",
    right: "FTP 265 W",
    rows: [
      { label: "Z1", pct: 40, range: "<145 W", color: DARK },
      { label: "Z2", pct: 32, range: "145–198 W", color: WARM },
      { label: "Z3", pct: 16, range: "199–238 W", color: "#3E93B0" },
      { label: "Z4", pct: 60, range: "239–278 W", color: BLUE, active: true },
    ],
    note: "Objectif : tenir la Z4 (seuil) de façon stable sur les deux blocs de 15 min, sans dépasser 250 W pour rester soutenable.",
  },
};

export default function VeloDetailPage() {
  return <SessionDetail data={VELO} />;
}
