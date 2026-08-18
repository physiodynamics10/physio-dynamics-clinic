-- Create clinic_settings table
create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),

  clinic_name text not null default 'Physio Dynamics',

  address text,
  phone text,
  email text,
  website text,

  therapist_name text,
  therapist_qualification text,

  consultation_fee numeric(10,2) default 0,
  followup_fee numeric(10,2) default 0,
  treatment_fee numeric(10,2) default 0,

  invoice_prefix text default 'PD',
  receipt_footer text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.clinic_settings enable row level security;

create policy "Authenticated users can view clinic settings"
on public.clinic_settings for select to authenticated using (true);

create policy "Authenticated users can create clinic settings"
on public.clinic_settings for insert to authenticated with check (true);

create policy "Authenticated users can update clinic settings"
on public.clinic_settings for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete clinic settings"
on public.clinic_settings for delete to authenticated using (true);

-- Insert initial record if table is empty
insert into public.clinic_settings (
  clinic_name,
  address,
  phone,
  email,
  website,
  therapist_name,
  therapist_qualification,
  invoice_prefix,
  receipt_footer
)
select
  'Physio Dynamics',
  'Panamaram, Wayanad, Kerala',
  '',
  '',
  'https://www.physio-dynamics.com/',
  'Sandra Thomas',
  'BPT / MPT',
  'PD',
  'Thank you for choosing Physio Dynamics.'
where not exists (
  select 1 from public.clinic_settings
);
