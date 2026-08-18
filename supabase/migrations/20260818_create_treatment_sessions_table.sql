-- Create treatment_sessions table for tracking patient physiotherapy sessions
create table if not exists public.treatment_sessions (
  id uuid primary key default gen_random_uuid(),

  patient_id uuid not null
    references public.patients(id)
    on delete cascade,

  appointment_id uuid
    references public.appointments(id)
    on delete set null,

  session_number integer not null,

  session_date date not null default current_date,

  pain_score integer,

  subjective text,
  objective text,

  treatment_details text,

  response_to_treatment text,

  exercises_advice text,

  next_plan text,

  next_appointment date,

  notes text,

  created_by uuid
    references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists treatment_sessions_patient_id_idx
on public.treatment_sessions(patient_id);

create index if not exists treatment_sessions_date_idx
on public.treatment_sessions(session_date);

alter table public.treatment_sessions
enable row level security;

create policy "Authenticated users can view treatment sessions"
on public.treatment_sessions
for select
to authenticated
using (true);

create policy "Authenticated users can create treatment sessions"
on public.treatment_sessions
for insert
to authenticated
with check (true);

create policy "Authenticated users can update treatment sessions"
on public.treatment_sessions
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete treatment sessions"
on public.treatment_sessions
for delete
to authenticated
using (true);
