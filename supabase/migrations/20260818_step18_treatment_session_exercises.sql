-- Add condition_id and protocol_id to treatment_sessions table if not exists
alter table public.treatment_sessions
add column if not exists condition_id uuid references public.conditions(id) on delete set null,
add column if not exists protocol_id uuid references public.treatment_protocols(id) on delete set null;

-- Create treatment_session_exercises table
create table if not exists public.treatment_session_exercises (
  id uuid primary key default gen_random_uuid(),
  treatment_session_id uuid not null references public.treatment_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sets text,
  repetitions text,
  duration text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists session_exercises_session_idx on public.treatment_session_exercises(treatment_session_id);
create index if not exists session_exercises_exercise_idx on public.treatment_session_exercises(exercise_id);

alter table public.treatment_session_exercises enable row level security;

create policy "Authenticated users can view session exercises"
on public.treatment_session_exercises for select to authenticated using (true);

create policy "Authenticated users can create session exercises"
on public.treatment_session_exercises for insert to authenticated with check (true);

create policy "Authenticated users can update session exercises"
on public.treatment_session_exercises for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete session exercises"
on public.treatment_session_exercises for delete to authenticated using (true);
