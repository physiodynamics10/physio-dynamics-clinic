-- Add archived_at column to patients table if not exists
alter table public.patients
add column if not exists archived_at timestamptz;

create index if not exists patients_archived_at_idx on public.patients(archived_at);
