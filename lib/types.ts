// Types métier partagés dans l'app.

// Une séance d'entraînement telle que stockée dans la table Supabase `sessions`.
// Les champs numériques sont nullable : on peut enregistrer une séance en ne
// remplissant que la date (le reste optionnel).
export type Session = {
  id: string;
  user_id: string;
  date: string; // format ISO "YYYY-MM-DD"
  distance_km: number | null;
  elevation_gain_m: number | null; // D+ en mètres
  duration_min: number | null; // durée en minutes
  feeling: number | null; // ressenti 1 (très dur) → 5 (excellent)
  notes: string | null;
  created_at: string;
};
