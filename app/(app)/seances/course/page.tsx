import { Clock, Repeat, Flame, Heart, Zap, Footprints } from "lucide-react";

import { SessionDetail, type SessionDetailData } from "@/components/seances/session-detail";

// Détail d'une séance de course à pied (accent lime). Données d'exemple.
const LIME = "#D8FF3D";
const WARM = "#5C5647"; // échauffement (neutre chaud)
const DARK = "#332F27"; // récup

const COURSE: SessionDetailData = {
  accent: LIME,
  TypeIcon: Footprints,
  typeLabel: "Course à pied",
  date: "Aujourd'hui · Samedi 2 juillet",
  breadcrumb: "Séances",
  title: "Fractionné en côte · 6 × 2 min",
  subtitle: "Puissance en montée · VMA ascensionnelle · Bloc spécifique 3/6",
  objective:
    "Développer la puissance en montée et la tolérance à l'effort au seuil. Chaque répétition se court fort mais régulière — même intensité sur la 6ᵉ que sur la 1ʳᵉ. C'est la qualité des répétitions qui compte, pas la vitesse brute.",
  metrics: [
    { Icon: Clock, value: "1h15", label: "DURÉE CIBLE" },
    { Icon: Repeat, value: "6", unit: "× 2 min", label: "RÉPÉTITIONS" },
    { Icon: Flame, value: "RPE 7", unit: "/10", label: "INTENSITÉ" },
    { Icon: Heart, value: "Z4", unit: "en effort", label: "ZONE CIBLE" },
    { Icon: Zap, value: "95", unit: "TSS", label: "CHARGE ESTIMÉE" },
  ],
  diagram: {
    title: "Diagramme d'intensité",
    legend: [
      { color: WARM, label: "Échauffement" },
      { color: LIME, label: "Effort Z4" },
      { color: DARK, label: "Récup Z1" },
    ],
    yLabels: ["Z4", "Z3", "Z2", "Z1"],
    bars: [
      { flex: 6, height: 22, color: WARM, opacity: 0.65 },
      { flex: 8, height: 38, color: WARM, opacity: 0.8 },
      { flex: 6, height: 52, color: WARM },
      { flex: 2, height: 84, color: LIME },
      { flex: 2, height: 20, color: DARK },
      { flex: 2, height: 84, color: LIME },
      { flex: 2, height: 20, color: DARK },
      { flex: 2, height: 84, color: LIME },
      { flex: 2, height: 20, color: DARK },
      { flex: 2, height: 84, color: LIME },
      { flex: 2, height: 20, color: DARK },
      { flex: 2, height: 84, color: LIME },
      { flex: 2, height: 20, color: DARK },
      { flex: 2, height: 84, color: LIME },
      { flex: 8, height: 38, color: WARM, opacity: 0.8 },
      { flex: 6, height: 22, color: WARM, opacity: 0.65 },
    ],
    phases: [
      { flex: 20, color: WARM, label: "Échauffement · 20 min" },
      { flex: 24, color: LIME, label: "6 × (2 min fort / 2 min récup)" },
      { flex: 15, color: WARM, label: "Retour au calme · 15 min" },
    ],
  },
  structure: {
    meta: "3 phases · 1h15",
    phases: [
      {
        dotColor: WARM,
        title: "Échauffement",
        meta: "20 min · Z1 → Z2",
        desc: "Footing très progressif sur le plat, puis 3 lignes droites en accélération pour réveiller la foulée avant les répétitions.",
        chips: ["FC 110–140", "3 lignes droites"],
      },
      {
        dotColor: LIME,
        title: "Bloc principal · 6 × 2 min en côte",
        meta: "~24 min · Z4",
        desc: "Sur une pente régulière de 6 à 8 %. Effort soutenu et contrôlé, foulée courte et fréquence élevée. On garde la même intensité de la 1ʳᵉ à la 6ᵉ répétition.",
        effortRecup: {
          effort: { label: "2 min en montée", sub: "FC 160–172 · Z4" },
          recup: { label: "2 min footing", sub: "Retour descente · Z1" },
        },
      },
      {
        dotColor: DARK,
        title: "Retour au calme",
        meta: "15 min · Z1",
        desc: "Footing très souple sur le plat pour évacuer. Relâcher les épaules et la respiration.",
        chips: ["FC 105–125"],
      },
    ],
  },
  nutrition: {
    note: "Affiché pour les séances intensives ou longues (> 1h30). Masqué sur une sortie d'endurance fondamentale simple.",
    items: [
      { title: "500 ml / h", sub: "Eau + électrolytes · boire pendant les récups" },
      { title: "40 g glucides / h", sub: "Séance courte : facultatif si < 1 h effectif" },
    ],
  },
  zones: {
    title: "Zones FC cibles",
    rows: [
      { label: "Z1", pct: 40, range: "<125", color: DARK },
      { label: "Z2", pct: 30, range: "125–142", color: WARM },
      { label: "Z3", pct: 14, range: "143–158", color: "#8A8270" },
      { label: "Z4", pct: 62, range: "159–172", color: LIME, active: true },
    ],
    note: "Objectif : atteindre la Z4 sur chaque répétition et redescendre en Z1 pendant les récups. La qualité prime sur le nombre.",
  },
};

export default function CourseDetailPage() {
  return <SessionDetail data={COURSE} />;
}
