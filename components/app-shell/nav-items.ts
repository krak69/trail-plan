import {
  LayoutDashboard,
  Footprints,
  BookOpen,
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

// Navigation principale (sidebar desktop). Tous les écrans sont désormais construits.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seances", label: "Séances", icon: Footprints },
  { href: "/banque", label: "Banque d'exercices", icon: BookOpen },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/statistiques", label: "Statistiques", icon: LineChart },
  { href: "/profil", label: "Profil", icon: User },
];

// Sous-ensemble affiché dans la barre d'onglets mobile (4 max pour la lisibilité).
export const MOBILE_NAV_HREFS = ["/", "/seances", "/statistiques", "/profil"];
