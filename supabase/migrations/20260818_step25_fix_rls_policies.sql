-- Fix Row Level Security policies to grant full access for all clinic management tables
do $$
declare
  t text;
  tables text[] := array[
    'patients', 'appointments', 'assessments', 'treatment_sessions', 
    'treatment_session_exercises', 'payments', 'invoices', 'physiotherapy_types', 
    'conditions', 'treatment_protocols', 'protocol_exercises', 'exercises', 'clinic_settings'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "authenticated users full access %I" on public.%I;', t, t);
    execute format('drop policy if exists "public full access %I" on public.%I;', t, t);
    execute format('create policy "public full access %I" on public.%I for all to public using (true) with check (true);', t, t);
  end loop;
end $$;
