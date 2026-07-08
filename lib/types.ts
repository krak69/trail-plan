// Types métier partagés dans l'app (miroir des tables Supabase, voir supabase/schema.sql).

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
