-- ============================================================================
--  Trail Plan — SCHÉMA DE DONNÉES COMPLET (proposition v2)
--  À relire/valider AVANT exécution. Puis : Supabase → SQL Editor → New query.
--
--  Vue d'ensemble des tables :
--    profiles           1 ligne / utilisateur (données perso + physio + prefs)
--    gear               matériel (chaussures, home-trainer…) avec usure
--    injuries           historique/vigilance blessures
--    exercises          banque d'exercices de renfo (publics + persos)
--    objectives         objectifs de course (CCC…) + config du plan
--    training_sessions  séances : partie PLANIFIÉE + partie RÉALISÉE (validation)
--    session_exercises  exercices d'une séance de renfo (circuit ordonné)
--
--  Toutes les tables sont protégées par RLS : chacun ne voit que ses données
--  (les exercices publics sont visibles par tous).
-- ============================================================================

-- Extension pour gen_random_uuid() (déjà présente sur Supabase, par sécurité).
create extension if not exists pgcrypto;

-- Fonction utilitaire : met à jour updated_at à chaque UPDATE.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
--  1. PROFILES — extension de auth.users (1:1)
-- ============================================================================
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  first_name        text,
  last_name         text,
  birthdate         date,
  city              text,
  experience_level  text,               -- ex: '1 à 2 ultras'
  -- Données physiologiques (écran Profil)
  vma               numeric(4, 1),      -- km/h
  vo2max            integer,            -- ml/kg/min
  fc_max            integer,            -- bpm
  fc_rest           integer,            -- bpm (repos) → zones via Karvonen
  threshold_pace    text,               -- allure seuil "4:35" /km
  ftp               integer,            -- W (vélo)
  weight_kg         numeric(4, 1),
  -- Préférences
  units             text    not null default 'metric',   -- 'metric' | 'imperial'
  language          text    not null default 'fr',
  notif_sessions    boolean not null default true,
  notif_daily       boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Création automatique du profil à l'inscription (copie prénom/nom des metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
--  2. GEAR — matériel (usure des chaussures, home-trainer…)
-- ============================================================================
create table if not exists public.gear (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name        text not null,
  kind        text not null default 'shoe',   -- 'shoe' | 'bike' | 'other'
  km_used     numeric(6, 1) not null default 0,
  km_max      numeric(6, 1),                  -- seuil de remplacement (chaussures)
  connected   boolean not null default false, -- ex: home-trainer
  retired     boolean not null default false,
  created_at  timestamptz not null default now()
);


-- ============================================================================
--  3. INJURIES — vigilance blessures (l'IA adapte le plan)
-- ============================================================================
create table if not exists public.injuries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name        text not null,
  zone        text,
  since_label text,                            -- 'Depuis mars 2025', 'Antécédent 2023'
  status      text not null default 'actif',   -- 'actif' | 'surveille' | 'resolu'
  adaptation  text,                            -- consigne d'adaptation
  created_at  timestamptz not null default now()
);


-- ============================================================================
--  4. EXERCISES — banque d'exercices de renforcement
--  user_id NULL + is_public = exercice "catalogue" visible par tous.
-- ============================================================================
create table if not exists public.exercises (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete cascade default auth.uid(),
  name          text not null,
  category      text not null,        -- 'quadriceps' | 'gainage' | 'fessiers' | 'mollets' | 'proprio' | 'mobilite'
  muscles       text[] not null default '{}',
  metric_value  text,                 -- '12', '45'
  metric_unit   text,                 -- 'rép / jambe', 's'
  tempo_tag     text,                 -- 'Excentrique 3s', 'Isométrique'…
  cue           text,                 -- consigne d'exécution
  image_url     text,
  is_public     boolean not null default false,
  created_at    timestamptz not null default now()
);


-- ============================================================================
--  5. OBJECTIVES — objectifs de course + configuration du plan
-- ============================================================================
create table if not exists public.objectives (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name              text not null,             -- 'CCC · UTMB'
  subtitle          text,                      -- 'Courmayeur – Champex – Chamonix'
  race_date         date,
  distance_km       numeric(6, 2),
  elevation_gain_m  integer,
  target_time       interval,                  -- temps visé (ex '17:30:00')
  priority          text default 'A',          -- 'A' | 'B' | 'C'
  status            text not null default 'current', -- 'past' | 'current' | 'future'
  plan_start_date   date,
  result_time       interval,                  -- pour un objectif passé (finisher)
  -- Config du plan (assistant) : volume, séances/type, jours off, préférences…
  -- stockée en JSONB pour rester flexible (voir écran Plan).
  plan_config       jsonb not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);


-- ============================================================================
--  6. TRAINING_SESSIONS — séance : PLANIFIÉE (plan) + RÉALISÉE (validation)
--  Une même ligne porte la version prévue et, une fois faite, les données réelles.
-- ============================================================================
create table if not exists public.training_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade default auth.uid(),
  objective_id          uuid references public.objectives (id) on delete set null,

  -- Positionnement dans le plan
  date                  date not null default current_date,
  kind                  text not null,            -- 'course' | 'renfo' | 'velo' | 'repos'
  block_label           text,                     -- 'Bloc spécifique 3/6'

  -- Descriptif (planifié)
  title                 text,                      -- 'Fractionné en côte · 6 × 2 min'
  subtitle              text,                      -- 'Puissance en montée · VMA…'
  objective_text        text,                      -- "objectif de la séance"
  planned_duration_min  integer,
  planned_distance_km   numeric(6, 2),
  planned_elevation_m   integer,
  target_rpe            smallint check (target_rpe between 1 and 10),
  target_zone           text,                      -- 'Z4'
  planned_tss           integer,
  structure             jsonb not null default '{}', -- phases (course/vélo) ou {tours, rest_sec} (renfo)

  -- Statut
  status                text not null default 'planned', -- 'planned' | 'done' | 'skipped'

  -- Données RÉELLES (remplies par le flux "Valider")
  actual_duration_min   integer,
  actual_distance_km    numeric(6, 2),
  actual_elevation_gain_m integer,
  actual_elevation_loss_m integer,
  fc_avg                integer,
  fc_max                integer,
  cadence               integer,
  avg_pace              text,                      -- '7:32/km'
  terrain               text,                      -- 'sentier' | 'route' | 'piste' | 'mix'
  actual_tss            integer,
  source                text,                      -- 'fit' | 'manual'
  felt_rpe              smallint check (felt_rpe between 1 and 10),
  sensations            text[] default '{}',        -- ['legs','energy',…]
  -- Nutrition (colonnes dédiées, requêtables)
  hydration_ml          integer,
  carbs_g               integer,
  gels_count            integer,
  digestive_comfort     text,                       -- 'bon' | 'moyen' | 'dur'
  notes                 text,
  completed_at          timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Index : lister rapidement les séances d'un user par date.
create index if not exists training_sessions_user_date_idx
  on public.training_sessions (user_id, date);


-- ============================================================================
--  7. SESSION_EXERCISES — exercices d'une séance de renfo (circuit ordonné)
-- ============================================================================
create table if not exists public.session_exercises (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.training_sessions (id) on delete cascade,
  exercise_id   uuid references public.exercises (id) on delete set null,
  position      integer not null default 0,   -- ordre dans le circuit
  target_value  text,                          -- surcharge éventuelle ('12')
  target_unit   text                           -- 'rép / jambe'
);

create index if not exists session_exercises_session_idx
  on public.session_exercises (session_id, position);


-- ============================================================================
--  TRIGGERS updated_at
-- ============================================================================
create trigger profiles_updated_at        before update on public.profiles          for each row execute function public.set_updated_at();
create trigger objectives_updated_at      before update on public.objectives        for each row execute function public.set_updated_at();
create trigger training_sessions_updated_at before update on public.training_sessions for each row execute function public.set_updated_at();


-- ============================================================================
--  ROW LEVEL SECURITY
--  Modèle : "own_data" = l'utilisateur ne touche que ses lignes (user_id = auth.uid()).
--  Exception : exercises → lecture des exercices publics par tous.
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.gear              enable row level security;
alter table public.injuries          enable row level security;
alter table public.exercises         enable row level security;
alter table public.objectives        enable row level security;
alter table public.training_sessions enable row level security;
alter table public.session_exercises enable row level security;

-- profiles : la clé primaire est l'id de l'utilisateur.
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Macro "possédé par l'utilisateur" pour les tables avec user_id.
-- (répété explicitement car Postgres n'a pas de policy paramétrable)
create policy "gear_all"      on public.gear      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "injuries_all"  on public.injuries  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "objectives_all" on public.objectives for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_all"  on public.training_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exercises : lecture = les miens OU les publics ; écriture = les miens.
create policy "exercises_select" on public.exercises for select using (auth.uid() = user_id or is_public);
create policy "exercises_insert" on public.exercises for insert with check (auth.uid() = user_id);
create policy "exercises_update" on public.exercises for update using (auth.uid() = user_id);
create policy "exercises_delete" on public.exercises for delete using (auth.uid() = user_id);

-- session_exercises : accès si la séance parente appartient à l'utilisateur.
create policy "session_exercises_all" on public.session_exercises for all
  using (exists (select 1 from public.training_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.training_sessions s where s.id = session_id and s.user_id = auth.uid()));


-- ============================================================================
--  MIGRATION depuis l'ancienne table `sessions` (étape 1, données de test)
--  L'ancienne table `public.sessions` (date, distance_km, elevation_gain_m,
--  duration_min, feeling, notes) est remplacée par `training_sessions`.
--  Décommente pour la supprimer une fois que tu es sûr :
-- ----------------------------------------------------------------------------
-- drop table if exists public.sessions cascade;


-- ============================================================================
--  SEED (optionnel) — banque d'exercices publique de départ (14 exercices)
--  Décommente pour préremplir la Banque d'exercices avec le catalogue de base.
-- ----------------------------------------------------------------------------
-- insert into public.exercises (user_id, name, category, muscles, metric_value, metric_unit, tempo_tag, cue, is_public) values
--   (null, 'Fentes bulgares', 'quadriceps', array['Quadriceps','Fessiers'], '12', 'rép / jambe', 'Excentrique 3s', 'Descente lente et contrôlée, genou dans l''axe du pied.', true),
--   (null, 'Step-down excentrique', 'quadriceps', array['Quadriceps'], '10', 'rép / jambe', 'Spécifique descente', 'Descends en 3 s depuis une marche.', true),
--   (null, 'Chaise au mur', 'quadriceps', array['Quadriceps'], '45', 's', 'Isométrique', 'Cuisses parallèles au sol, dos plaqué au mur.', true),
--   (null, 'Squat gobelet', 'quadriceps', array['Quadriceps','Fessiers'], '15', 'rép', null, 'Poids sur les talons, buste droit.', true),
--   (null, 'Planche gainage', 'gainage', array['Core','Transverse'], '60', 's', null, 'Corps aligné, bassin neutre.', true),
--   (null, 'Gainage latéral', 'gainage', array['Obliques','Stabilité'], '30', 's / côté', null, 'Hanches hautes, bassin aligné.', true),
--   (null, 'Superman dorsal', 'gainage', array['Lombaires','Dos'], '15', 'rép', null, 'Extension contrôlée sans à-coups.', true),
--   (null, 'Pont fessier', 'fessiers', array['Fessiers','Ischios'], '20', 'rép', null, 'Pousse dans les talons, verrouille en haut.', true),
--   (null, 'Montées de marche', 'fessiers', array['Fessiers','Quadriceps'], '12', 'rép / jambe', 'Spécifique montée', 'Pousse sur la jambe haute.', true),
--   (null, 'Mollets excentriques', 'mollets', array['Mollets','Tendon d''Achille'], '15', 'rép', 'Excentrique', 'Descente lente sur 1 pied depuis une marche.', true),
--   (null, 'Sauts de mollets', 'mollets', array['Mollets'], '20', 'rép', 'Pliométrie', 'Contact au sol court et réactif.', true),
--   (null, 'Équilibre unipodal', 'proprio', array['Stabilité','Chevilles'], '45', 's / jambe', 'Proprioception', 'Sur une jambe, yeux fermés pour complexifier.', true),
--   (null, 'Mobilité hanches', 'mobilite', array['Hanches'], '10', 'rép / côté', 'Mobilité', 'Amplitude progressive et contrôlée.', true),
--   (null, 'Mobilité chevilles', 'mobilite', array['Chevilles'], '10', 'rép / côté', 'Mobilité', 'Genou au-dessus des orteils, talon au sol.', true);
