-- ============================================================
--  Trail Plan — schéma Supabase
--  À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Table des séances d'entraînement.
create table if not exists public.sessions (
  id                uuid primary key default gen_random_uuid(),
  -- Propriétaire de la séance. default auth.uid() = l'utilisateur connecté.
  user_id           uuid not null references auth.users (id) on delete cascade default auth.uid(),
  date              date not null default current_date,
  distance_km       numeric(6, 2),          -- distance en km (ex: 12.40)
  elevation_gain_m  integer,                -- dénivelé positif (D+) en mètres
  duration_min      integer,                -- durée en minutes
  feeling           smallint check (feeling between 1 and 5), -- ressenti 1→5
  notes             text,
  created_at        timestamptz not null default now()
);

-- Index pour lister rapidement les séances d'un utilisateur, du plus récent au plus ancien.
create index if not exists sessions_user_date_idx
  on public.sessions (user_id, date desc);

-- ------------------------------------------------------------
--  Row Level Security (RLS)
--  Sans policy, personne ne peut lire/écrire. On limite chaque
--  utilisateur à SES propres séances (user_id = auth.uid()).
-- ------------------------------------------------------------
alter table public.sessions enable row level security;

create policy "Les utilisateurs voient leurs séances"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs créent leurs séances"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs séances"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs séances"
  on public.sessions for delete
  using (auth.uid() = user_id);
