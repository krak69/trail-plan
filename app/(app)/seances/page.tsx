import { SeancesPlanView } from "@/components/seances/plan-view";

// Écran Séances = vue "plan hebdomadaire" (maquette Claude Design).
// Le contenu interactif (navigation de semaine, données d'exemple) vit dans
// le composant client SeancesPlanView. L'authentification est gérée par le
// layout du groupe (app).
export default function SeancesPage() {
  return <SeancesPlanView />;
}
