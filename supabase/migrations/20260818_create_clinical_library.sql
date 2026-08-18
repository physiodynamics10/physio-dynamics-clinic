-- Create physiotherapy_types table
create table if not exists public.physiotherapy_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon_name text,
  created_at timestamptz not null default now()
);

-- Create conditions table
create table if not exists public.conditions (
  id uuid primary key default gen_random_uuid(),
  type_id uuid not null references public.physiotherapy_types(id) on delete cascade,
  name text not null,
  overview text,
  symptoms text,
  assessment_tests text,
  treatment_options text,
  precautions text,
  red_flags text,
  progression text,
  created_at timestamptz not null default now()
);

-- Create exercises library table
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Strengthening',
  target_muscle text,
  instructions text,
  default_sets integer default 3,
  default_reps text default '10-15 reps',
  created_at timestamptz not null default now()
);

-- Junction table linking conditions to recommended exercises
create table if not exists public.condition_exercises (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references public.conditions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  recommended_sets integer default 3,
  recommended_reps text default '10-12 reps',
  notes text,
  created_at timestamptz not null default now(),
  unique(condition_id, exercise_id)
);

-- Enable RLS & Security Policies
alter table public.physiotherapy_types enable row level security;
alter table public.conditions enable row level security;
alter table public.exercises enable row level security;
alter table public.condition_exercises enable row level security;

create policy "Authenticated users can view physio types" on public.physiotherapy_types for select to authenticated using (true);
create policy "Authenticated users can manage physio types" on public.physiotherapy_types for all to authenticated using (true);

create policy "Authenticated users can view conditions" on public.conditions for select to authenticated using (true);
create policy "Authenticated users can manage conditions" on public.conditions for all to authenticated using (true);

create policy "Authenticated users can view exercises" on public.exercises for select to authenticated using (true);
create policy "Authenticated users can manage exercises" on public.exercises for all to authenticated using (true);

create policy "Authenticated users can view condition exercises" on public.condition_exercises for select to authenticated using (true);
create policy "Authenticated users can manage condition exercises" on public.condition_exercises for all to authenticated using (true);

-- Seed Initial 7 Physiotherapy Types
insert into public.physiotherapy_types (name, description, icon_name)
values
  ('Orthopaedic Physiotherapy', 'Joints, bones, muscles, ligaments, and spinal conditions', 'Bone'),
  ('Sports Physiotherapy', 'Athletic injuries, ligament tears, strain, and return-to-sport rehab', 'Trophy'),
  ('Neurological Physiotherapy', 'Stroke rehab, Parkinson''s disease, spinal cord injury, and balance', 'Brain'),
  ('Paediatric Physiotherapy', 'Developmental delay, motor milestones, and paediatric cerebral palsy', 'Baby'),
  ('Geriatric Physiotherapy', 'Age-related mobility, fall prevention, and degenerative joint disease', 'UserCheck'),
  ('Cardiopulmonary Physiotherapy', 'Post-thoracic rehab, breathing exercises, and endurance conditioning', 'HeartPulse'),
  ('Post-operative Rehabilitation', 'Post-surgical protocols for joints, ligaments, and hardware', 'Activity')
on conflict (name) do nothing;
