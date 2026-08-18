-- Create appointments table for managing patient visits and schedules
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),

  patient_id uuid not null
    references public.patients(id)
    on delete cascade,

  appointment_date date not null,
  start_time time not null,
  end_time time,

  appointment_type text not null default 'Follow-up',

  status text not null default 'Scheduled',

  notes text,

  created_by uuid references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_patient_id_idx
on public.appointments(patient_id);

create index if not exists appointments_date_idx
on public.appointments(appointment_date);

alter table public.appointments enable row level security;

create policy "Authenticated users can view appointments"
on public.appointments
for select
to authenticated
using (true);

create policy "Authenticated users can create appointments"
on public.appointments
for insert
to authenticated
with check (true);

create policy "Authenticated users can update appointments"
on public.appointments
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete appointments"
on public.appointments
for delete
to authenticated
using (true);
