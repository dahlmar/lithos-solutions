-- Lithos Solutions — core CRM tables
-- Depends on 0001_auth_roles.sql (public.app_role, public.profiles, public.jwt_role()).
-- Run in the Supabase SQL editor, or `supabase db push` with the CLI.
--
-- Access model:
--   * admin  → full read/write on everything (enforced via jwt_role()).
--   * client → read-only, scoped to their own client via profiles.client_id:
--              their client row, its projects, non-draft invoices,
--              deliverables, and client-visible notes only.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.client_status      as enum ('active', 'onboarding', 'paused');
create type public.project_type       as enum ('creative', 'infrastructure');
create type public.project_status     as enum ('planning', 'on_track', 'at_risk', 'delivered');
create type public.invoice_status     as enum ('draft', 'issued', 'paid', 'overdue', 'void');
create type public.deliverable_status as enum ('upcoming', 'in_progress', 'in_review', 'approved', 'delivered');
create type public.note_visibility    as enum ('internal', 'client');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_email text,
  status        public.client_status not null default 'onboarding',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- Link portal users to the client they belong to (null for staff/admins).
alter table public.profiles
  add column client_id uuid references public.clients (id) on delete set null;

create index profiles_client_id_idx on public.profiles (client_id);

-- Helper: the caller's client_id. SECURITY DEFINER so table policies can use
-- it without depending on profiles' own RLS.
create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select client_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  -- restrict: deleting a client with history should be an explicit, deliberate act
  client_id  uuid not null references public.clients (id) on delete restrict,
  name       text not null,
  type       public.project_type not null,
  status     public.project_status not null default 'planning',
  progress   smallint not null default 0 check (progress between 0 and 100),
  manager_id uuid references public.profiles (id) on delete set null,
  started_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_client_id_idx on public.projects (client_id);
create index projects_manager_id_idx on public.projects (manager_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
create table public.invoices (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  number       text not null unique,                    -- e.g. 'INV-0142'
  amount_cents bigint not null check (amount_cents >= 0),
  currency     char(3) not null default 'SEK',
  status       public.invoice_status not null default 'draft',
  issued_on    date,
  due_on       date,
  paid_on      date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index invoices_project_id_idx on public.invoices (project_id);

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deliverables
-- ---------------------------------------------------------------------------
create table public.deliverables (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  name        text not null,
  description text not null default '',
  status      public.deliverable_status not null default 'upcoming',
  version     text,                                     -- e.g. 'v3.0'
  due_on      date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index deliverables_project_id_idx on public.deliverables (project_id);

create trigger deliverables_set_updated_at
  before update on public.deliverables
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  visibility public.note_visibility not null default 'internal',
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_project_id_idx on public.notes (project_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.clients      enable row level security;
alter table public.projects     enable row level security;
alter table public.invoices     enable row level security;
alter table public.deliverables enable row level security;
alter table public.notes        enable row level security;

-- Admins: full access everywhere.
create policy "admins full access" on public.clients
  for all using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "admins full access" on public.projects
  for all using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "admins full access" on public.invoices
  for all using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "admins full access" on public.deliverables
  for all using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');
create policy "admins full access" on public.notes
  for all using (public.jwt_role() = 'admin') with check (public.jwt_role() = 'admin');

-- Client users: read-only, scoped to their own client.
create policy "clients read own client" on public.clients
  for select using (id = public.current_client_id());

create policy "clients read own projects" on public.projects
  for select using (client_id = public.current_client_id());

-- Drafts stay internal until issued.
create policy "clients read own invoices" on public.invoices
  for select using (
    status <> 'draft'
    and exists (
      select 1 from public.projects p
      where p.id = invoices.project_id
        and p.client_id = public.current_client_id()
    )
  );

create policy "clients read own deliverables" on public.deliverables
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = deliverables.project_id
        and p.client_id = public.current_client_id()
    )
  );

-- Only client-visible notes; internal notes never leave the team.
create policy "clients read client-visible notes" on public.notes
  for select using (
    visibility = 'client'
    and exists (
      select 1 from public.projects p
      where p.id = notes.project_id
        and p.client_id = public.current_client_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Linking a portal user to their client (run manually per invited user):
-- ---------------------------------------------------------------------------
-- update public.profiles
--   set client_id = (select id from public.clients where name = 'Aveline Studio')
--   where id = (select id from auth.users where email = 'client@aveline.studio');
