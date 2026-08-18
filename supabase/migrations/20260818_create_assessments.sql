-- Create assessments table for physiotherapy patient evaluations
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),

  patient_id uuid not null
    references public.patients(id)
    on delete cascade,

  assessment_date date not null default current_date,

  chief_complaint text,
  history_of_present_condition text,

  pain_score integer,
  pain_location text,
  pain_duration text,
  pain_onset text,

  aggravating_factors text,
  relieving_factors text,

  posture text,
  range_of_motion text,
  muscle_strength text,
  special_tests text,
  functional_limitations text,

  diagnosis text,
  treatment_goals text,
  treatment_plan text,

  additional_notes text,

  created_by uuid references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS & Security Policies
alter table public.assessments enable row level security;

create policy "Authenticated users can view assessments"
on public.assessments
for select
to authenticated
using (true);

create policy "Authenticated users can create assessments"
on public.assessments
for insert
to authenticated
with check (true);

create policy "Authenticated users can update assessments"
on public.assessments
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete assessments"
on public.assessments
for delete
to authenticated
using (true);
