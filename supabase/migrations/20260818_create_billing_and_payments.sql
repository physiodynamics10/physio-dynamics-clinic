-- Create invoices table for clinic billing
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
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create payments table supporting Cash & UPI
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric(10, 2) not null,
  payment_method text not null check (payment_method in ('Cash', 'UPI')),
  reference_number text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Create Indexes
create index if not exists invoices_patient_id_idx on public.invoices(patient_id);
create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_patient_id_idx on public.payments(patient_id);

-- Enable RLS & Security Policies
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

create policy "Authenticated users can view invoices"
on public.invoices for select to authenticated using (true);

create policy "Authenticated users can create invoices"
on public.invoices for insert to authenticated with check (true);

create policy "Authenticated users can update invoices"
on public.invoices for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete invoices"
on public.invoices for delete to authenticated using (true);

create policy "Authenticated users can view payments"
on public.payments for select to authenticated using (true);

create policy "Authenticated users can create payments"
on public.payments for insert to authenticated with check (true);

create policy "Authenticated users can update payments"
on public.payments for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete payments"
on public.payments for delete to authenticated using (true);
