import {
  LayoutDashboard,
  Footprints,
  CalendarDays,
  LineChart,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // disabled = écran pas encore construit (affiché grisé, non cliquable).
  disabled?: boolean;
};

// Navigation principale (sidebar desktop). Dashboard et Séances sont actifs ;
// les autres sont des placeholders pour les prochains écrans.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seances", label: "Séances", icon: Footprints },
  { href: "/plan", label: "Plan", icon: CalendarDays, disabled: true },
  { href: "/statistiques", label: "Statistiques", icon: LineChart, disabled: true },
  { href: "/profil", label: "Profil", icon: User, disabled: true },
];

// Sous-ensemble affiché dans la barre d'onglets mobile (4 max pour la lisibilité).
export const MOBILE_NAV_HREFS = ["/", "/seances", "/plan", "/profil"];
