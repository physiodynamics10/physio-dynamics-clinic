-- Enable Row Level Security on all tables
alter table if exists public.patients enable row level security;
alter table if exists public.appointments enable row level security;
alter table if exists public.assessments enable row level security;
alter table if exists public.treatment_sessions enable row level security;
alter table if exists public.treatment_session_exercises enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.invoices enable row level security;
alter table if exists public.physiotherapy_types enable row level security;
alter table if exists public.conditions enable row level security;
alter table if exists public.treatment_protocols enable row level security;
alter table if exists public.protocol_exercises enable row level security;
alter table if exists public.exercises enable row level security;
alter table if exists public.clinic_settings enable row level security;

-- Policy helper for authenticated users access
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access patients') then
    create policy "authenticated users full access patients" on public.patients for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access appointments') then
    create policy "authenticated users full access appointments" on public.appointments for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access assessments') then
    create policy "authenticated users full access assessments" on public.assessments for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access treatment_sessions') then
    create policy "authenticated users full access treatment_sessions" on public.treatment_sessions for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access treatment_session_exercises') then
    create policy "authenticated users full access treatment_session_exercises" on public.treatment_session_exercises for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access payments') then
    create policy "authenticated users full access payments" on public.payments for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access invoices') then
    create policy "authenticated users full access invoices" on public.invoices for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access physiotherapy_types') then
    create policy "authenticated users full access physiotherapy_types" on public.physiotherapy_types for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access conditions') then
    create policy "authenticated users full access conditions" on public.conditions for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access treatment_protocols') then
    create policy "authenticated users full access treatment_protocols" on public.treatment_protocols for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access protocol_exercises') then
    create policy "authenticated users full access protocol_exercises" on public.protocol_exercises for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access exercises') then
    create policy "authenticated users full access exercises" on public.exercises for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'authenticated users full access clinic_settings') then
    create policy "authenticated users full access clinic_settings" on public.clinic_settings for all to authenticated using (true) with check (true);
  end if;
end $$;
