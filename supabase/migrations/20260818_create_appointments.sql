-- Create appointments table supporting dual-patient allocation per time slot
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  patient_name text not null,
  slot_time text not null, -- e.g., '08:00 AM', '08:30 AM'
  bed_number text not null default 'bed1', -- 'bed1' (Patient 1) or 'bed2' (Patient 2)
  appointment_date date not null default current_date,
  duration_minutes integer not null default 60,
  treatment_type text default 'Physiotherapy Session',
  therapist_name text default 'Dr. Alex Rivera',
  status text not null default 'Scheduled', -- Scheduled, In Progress, Completed, Cancelled
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot_time, bed_number, appointment_date)
);

-- Enable Row Level Security
alter table public.appointments enable row level security;
