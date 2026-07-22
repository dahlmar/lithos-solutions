-- Lithos Solutions — auth roles & profiles
-- Run in the Supabase SQL editor, or `supabase db push` with the CLI.
--
-- Role model:
--   * The authoritative role lives in auth.users.raw_app_meta_data->>'role'
--     ("admin" | "client"). Only the service role can write app_metadata, so
--     users cannot escalate their own role. It is embedded in the JWT, which
--     is what proxy.ts and the app's data access layer read.
--   * public.profiles mirrors the role for app data and joins.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'client');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  role       public.app_role not null default 'client',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: read the caller's role from their JWT (no table lookup, no recursion).
create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'client');
$$;

-- Users can read their own profile.
create policy "read own profile"
  on public.profiles for select
  using (id = (select auth.uid()));

-- Admins can read and manage every profile.
create policy "admins read all profiles"
  on public.profiles for select
  using (public.jwt_role() = 'admin');

create policy "admins update profiles"
  on public.profiles for update
  using (public.jwt_role() = 'admin')
  with check (public.jwt_role() = 'admin');

-- No insert/delete policies: rows are created by the trigger below and
-- removed via the auth.users cascade.

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up / is invited
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_app_meta_data ->> 'role')::public.app_role, 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Promoting an admin (run manually per admin user, AFTER they exist):
-- ---------------------------------------------------------------------------
-- update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
--   where email = 'you@example.com';
-- update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- The user must sign in again (or refresh their session) to get the new JWT.
