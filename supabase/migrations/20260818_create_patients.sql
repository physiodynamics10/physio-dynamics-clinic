-- Create patients table
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  patient_code text unique not null,
  first_name text not null,
  last_name text,
  date_of_birth date,
  gender text,
  phone text,
  email text,
  address text,
  occupation text,
  emergency_contact_name text,
  emergency_contact_phone text,
  referral_source text,
  medical_history text,
  allergies text,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.patients enable row level security;
