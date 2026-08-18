-- STEP 14.1 — Create Physiotherapy Types table
create table if not exists public.physiotherapy_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.physiotherapy_types enable row level security;

create policy "Authenticated users can view physio types"
on public.physiotherapy_types for select to authenticated using (true);

create policy "Authenticated users can create physio types"
on public.physiotherapy_types for insert to authenticated with check (true);

create policy "Authenticated users can update physio types"
on public.physiotherapy_types for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete physio types"
on public.physiotherapy_types for delete to authenticated using (true);

-- STEP 14.2 — Add Main Categories
insert into public.physiotherapy_types (name, description)
values
  ('Orthopaedic Physiotherapy', 'Musculoskeletal and orthopaedic rehabilitation.'),
  ('Sports Physiotherapy', 'Sports injury rehabilitation, performance and return-to-sport management.'),
  ('Neurological Physiotherapy', 'Rehabilitation for neurological conditions and movement impairments.'),
  ('Paediatric Physiotherapy', 'Physiotherapy for infants, children and adolescents.'),
  ('Geriatric Physiotherapy', 'Mobility, strength, balance and functional rehabilitation for older adults.'),
  ('Cardiopulmonary Physiotherapy', 'Physical therapy related to cardiopulmonary function and rehabilitation.'),
  ('Post-operative Rehabilitation', 'Rehabilitation following orthopaedic and other surgeries.')
on conflict (name) do nothing;

-- STEP 14.3 — Create Conditions table
create table if not exists public.conditions (
  id uuid primary key default gen_random_uuid(),
  physiotherapy_type_id uuid not null references public.physiotherapy_types(id) on delete cascade,
  name text not null,
  description text,
  common_symptoms text,
  assessment_notes text,
  precautions text,
  referral_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (physiotherapy_type_id, name)
);

create index if not exists conditions_type_idx on public.conditions(physiotherapy_type_id);

alter table public.conditions enable row level security;

create policy "Authenticated users can view conditions"
on public.conditions for select to authenticated using (true);

create policy "Authenticated users can create conditions"
on public.conditions for insert to authenticated with check (true);

create policy "Authenticated users can update conditions"
on public.conditions for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete conditions"
on public.conditions for delete to authenticated using (true);

-- STEP 14.4 — Create Treatment Protocols
create table if not exists public.treatment_protocols (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references public.conditions(id) on delete cascade,
  name text not null,
  description text,
  goals text,
  treatment_options text,
  progression_notes text,
  precautions text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists treatment_protocols_condition_idx on public.treatment_protocols(condition_id);

alter table public.treatment_protocols enable row level security;

create policy "Authenticated users can view protocols"
on public.treatment_protocols for select to authenticated using (true);

create policy "Authenticated users can create protocols"
on public.treatment_protocols for insert to authenticated with check (true);

create policy "Authenticated users can update protocols"
on public.treatment_protocols for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete protocols"
on public.treatment_protocols for delete to authenticated using (true);

-- STEP 14.5 — Connect protocols to exercises
create table if not exists public.protocol_exercises (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.treatment_protocols(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  recommended_sets text,
  recommended_repetitions text,
  recommended_duration text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (protocol_id, exercise_id)
);

create index if not exists protocol_exercises_protocol_idx on public.protocol_exercises(protocol_id);

alter table public.protocol_exercises enable row level security;

create policy "Authenticated users can view protocol exercises"
on public.protocol_exercises for select to authenticated using (true);

create policy "Authenticated users can create protocol exercises"
on public.protocol_exercises for insert to authenticated with check (true);

create policy "Authenticated users can update protocol exercises"
on public.protocol_exercises for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete protocol exercises"
on public.protocol_exercises for delete to authenticated using (true);
