
create table if not exists public.patients (
  id text primary key,
  name text not null,
  mrn text not null,
  status text check (status in ('Pre-therapy','Therapy Day','Post-therapy','Follow-up')) not null,
  therapy text default 'I-131' not null,
  scheduled_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

alter table public.patients enable row level security;

create policy if not exists "patients_read_authenticated"
  on public.patients for select
  to authenticated
  using (true);

create policy if not exists "patients_write_admin"
  on public.patients for all
  to authenticated
  using (true)
  with check (true);
