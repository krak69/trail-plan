// Types métier partagés dans l'app (miroir des tables Supabase, voir supabase/schema.sql).

// Objectif de course (la cible : CCC…) + config du plan.
export type Objective = {
  id: string;
  user_id: string;
  name: string;
  subtitle: string | null;
  race_date: string | null; // "YYYY-MM-DD"
  distance_km: number | null;
  elevation_gain_m: number | null;
  target_time: string | null; // "HH:MM:SS"
  priority: string | null; // 'A' | 'B' | 'C'
  status: string; // 'past' | 'current' | 'future'
  plan_start_date: string | null;
  result_time: string | null;
  created_at: string;
  updated_at: string;
};

// Profil utilisateur (1 ligne / compte).
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birthdate: string | null;
  city: string | null;
  experience_level: string | null;
  vma: number | null;
  vo2max: number | null;
  fc_max: number | null;
  fc_rest: number | null;
  threshold_pace: string | null;
  ftp: number | null;
  weight_kg: number | null;
  units: string;
  language: string;
  notif_sessions: boolean;
  notif_daily: boolean;
  created_at: string;
  updated_at: string;
};


// Un exercice de la banque de renforcement.
// user_id null + is_public = exercice du catalogue partagé.
export type Exercise = {
  id: string;
  user_id: string | null;
  name: string;
  category: string; // 'quadriceps' | 'gainage' | 'fessiers' | 'mollets' | 'proprio' | 'mobilite'
  muscles: string[];
  metric_value: string | null;
  metric_unit: string | null;
  tempo_tag: string | null;
  cue: string | null;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
};
