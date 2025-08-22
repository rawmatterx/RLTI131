-- Assessments table for storing patient assessment data
create table if not exists public.assessments (
  id text primary key,
  patient_data jsonb,
  clinical_data jsonb,
  labs_data jsonb,
  risk_data jsonb,
  contraindications text[],
  medications text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.assessments enable row level security;

-- Allow authenticated users to read/write assessments
create policy if not exists "assessments_read_authenticated"
  on public.assessments for select
  to authenticated
  using (true);

create policy if not exists "assessments_write_authenticated"
  on public.assessments for all
  to authenticated
  using (true)
  with check (true);

-- For anon access (if needed for demo)
create policy if not exists "assessments_anon_access"
  on public.assessments for all
  to anon
  using (true)
  with check (true);
