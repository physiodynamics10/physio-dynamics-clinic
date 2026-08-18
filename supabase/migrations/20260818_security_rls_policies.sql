-- Secure public.patients table with RLS for authenticated clinic users
alter table public.patients enable row level security;

create policy "Authenticated users can view patients"
on public.patients
for select
to authenticated
using (true);

create policy "Authenticated users can create patients"
on public.patients
for insert
to authenticated
with check (true);

create policy "Authenticated users can update patients"
on public.patients
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete patients"
on public.patients
for delete
to authenticated
using (true);

-- Secure public.profiles table with RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
