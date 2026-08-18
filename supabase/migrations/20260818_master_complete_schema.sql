-- ========================================================
-- PHYSIO DYNAMICS CLINIC SYSTEM - MASTER DATABASE SCHEMA
-- ========================================================

-- 1. Patients Table
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
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Appointments Table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_date date not null,
  appointment_time time,
  slot_number text,
  status text not null default 'Scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Assessments Table
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  assessment_date date not null default current_date,
  chief_complaint text,
  history_of_present_illness text,
  pain_scale integer,
  pain_location text,
  posture_gait_notes text,
  range_of_motion_notes text,
  muscle_strength_notes text,
  special_tests text,
  diagnosis text,
  treatment_plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Physiotherapy Types Table
create table if not exists public.physiotherapy_types (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

-- 5. Conditions Table
create table if not exists public.conditions (
  id uuid primary key default gen_random_uuid(),
  physiotherapy_type_id uuid references public.physiotherapy_types(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 6. Treatment Protocols Table
create table if not exists public.treatment_protocols (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references public.conditions(id) on delete cascade,
  title text not null,
  description text,
  duration_weeks integer,
  frequency_per_week integer,
  created_at timestamptz not null default now()
);

-- 7. Exercises Table
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  instructions text,
  default_sets integer default 3,
  default_reps integer default 10,
  created_at timestamptz not null default now()
);

-- 8. Protocol Exercises Junction Table
create table if not exists public.protocol_exercises (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.treatment_protocols(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets integer default 3,
  reps integer default 10,
  notes text
);

-- 9. Treatment Sessions Table
create table if not exists public.treatment_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  condition_id uuid references public.conditions(id),
  protocol_id uuid references public.treatment_protocols(id),
  session_date date not null default current_date,
  pain_score integer,
  subjective_notes text,
  objective_notes text,
  treatment_provided text,
  patient_response text,
  next_plan text,
  created_at timestamptz not null default now()
);

-- 10. Treatment Session Exercises Table
create table if not exists public.treatment_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.treatment_sessions(id) on delete cascade,
  exercise_id uuid references public.exercises(id),
  exercise_name text not null,
  sets integer default 3,
  reps integer default 10,
  notes text,
  created_at timestamptz not null default now()
);

-- 11. Invoices Table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  invoice_number text not null,
  invoice_date date not null default current_date,
  due_date date,
  total_amount numeric(10, 2) not null default 0,
  paid_amount numeric(10, 2) not null default 0,
  balance_amount numeric(10, 2) not null default 0,
  status text not null default 'Unpaid',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. Payments Table (Cash & UPI)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric(10, 2) not null,
  payment_method text not null check (payment_method in ('Cash', 'UPI')),
  reference_number text,
  notes text,
  created_at timestamptz not null default now()
);

-- 13. Clinic Settings Table
create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null default 'Physio Dynamics',
  address text,
  phone text,
  email text,
  website text,
  therapist_name text,
  therapist_qualification text,
  initial_consultation_fee numeric(10, 2) default 500,
  followup_fee numeric(10, 2) default 300,
  treatment_session_fee numeric(10, 2) default 400,
  invoice_prefix text default 'PD-',
  receipt_footer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Default clinic settings row
insert into public.clinic_settings (
  clinic_name, address, phone, email, website, therapist_name, therapist_qualification
) select 
  'Physio Dynamics',
  'UB City Centre Building, Near Crescent Public School, Panamaram, Wayanad, Kerala 670721',
  '+91 6282929104',
  'physiodynamics10@gmail.com',
  'https://www.physio-dynamics.com',
  'Sandra Thomas',
  'BPT / MPT'
where not exists (select 1 from public.clinic_settings);

-- Enable RLS and set full access policies on all tables
do $$
declare
  t text;
  tables text[] := array[
    'patients', 'appointments', 'assessments', 'physiotherapy_types',
    'conditions', 'treatment_protocols', 'exercises', 'protocol_exercises',
    'treatment_sessions', 'treatment_session_exercises', 'invoices',
    'payments', 'clinic_settings'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "public full access %I" on public.%I;', t, t);
    execute format('create policy "public full access %I" on public.%I for all to public using (true) with check (true);', t, t);
  end loop;
end $$;
