-- Lithos Solutions — operations features
-- Depends on 0001_auth_roles.sql and 0002_core_tables.sql.
-- Run in the Supabase SQL editor, or `supabase db push` with the CLI.
--
-- Adds:
--   * profiles.email mirror (for the in-app user management UI)
--   * projects.budget_cents (budget vs. invoiced view)
--   * deliverable_files + a private "deliverables" storage bucket
--   * client comment policy on notes
--   * review_deliverable() — client approve / request-changes
--   * recompute_project_progress() — progress derived from deliverables
--   * audit_log + triggers on all core tables

-- ---------------------------------------------------------------------------
-- profiles.email — mirror auth.users.email so admins can list users in-app
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_app_meta_data ->> 'role')::public.app_role, 'client'),
    new.email
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- projects.budget_cents — optional budget, compared against invoiced total
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists budget_cents bigint
  check (budget_cents is null or budget_cents >= 0);

-- ---------------------------------------------------------------------------
-- deliverable_files — file metadata; binaries live in the storage bucket
-- ---------------------------------------------------------------------------
create table public.deliverable_files (
  id             uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  name           text not null,
  path           text not null unique,  -- <client_id>/<deliverable_id>/<file>
  size_bytes     bigint not null default 0,
  content_type   text,
  created_at     timestamptz not null default now()
);

create index deliverable_files_deliverable_id_idx
  on public.deliverable_files (deliverable_id);

alter table public.deliverable_files enable row level security;

create policy "admins full access" on public.deliverable_files
  for all using (public.jwt_role() = 'admin')
  with check (public.jwt_role() = 'admin');

create policy "clients read own deliverable files" on public.deliverable_files
  for select using (
    exists (
      select 1
      from public.deliverables d
      join public.projects p on p.id = d.project_id
      where d.id = deliverable_files.deliverable_id
        and p.client_id = public.current_client_id()
    )
  );

-- Private bucket; object paths start with the owning client's id so the
-- client read policy can scope by folder.
insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false)
on conflict (id) do nothing;

create policy "admins manage deliverable objects" on storage.objects
  for all using (bucket_id = 'deliverables' and public.jwt_role() = 'admin')
  with check (bucket_id = 'deliverables' and public.jwt_role() = 'admin');

create policy "clients read own deliverable objects" on storage.objects
  for select using (
    bucket_id = 'deliverables'
    and (storage.foldername(name))[1] = public.current_client_id()::text
  );

-- ---------------------------------------------------------------------------
-- notes — clients may comment on their own projects (client-visible only)
-- ---------------------------------------------------------------------------
create policy "clients comment on own projects" on public.notes
  for insert with check (
    visibility = 'client'
    and author_id = (select auth.uid())
    and exists (
      select 1 from public.projects p
      where p.id = notes.project_id
        and p.client_id = public.current_client_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Progress derived from deliverables (weights per stage)
-- ---------------------------------------------------------------------------
create or replace function public.recompute_project_progress(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_progress smallint;
begin
  select round(avg(case status
    when 'upcoming'    then 0
    when 'in_progress' then 35
    when 'in_review'   then 70
    when 'approved'    then 85
    when 'delivered'   then 100
  end))::smallint
  into v_progress
  from public.deliverables
  where project_id = p_project_id;

  -- No deliverables → leave the manually set progress untouched.
  if v_progress is not null then
    update public.projects set progress = v_progress where id = p_project_id;
  end if;
end;
$$;

revoke all on function public.recompute_project_progress(uuid) from public;
grant execute on function public.recompute_project_progress(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Client review: approve or request changes on a deliverable in review
-- ---------------------------------------------------------------------------
create or replace function public.review_deliverable(
  p_deliverable_id uuid,
  p_approve boolean,
  p_comment text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project_id uuid;
  v_status public.deliverable_status;
  v_client uuid;
begin
  select d.project_id, d.status, p.client_id
    into v_project_id, v_status, v_client
  from public.deliverables d
  join public.projects p on p.id = d.project_id
  where d.id = p_deliverable_id;

  if v_project_id is null then
    raise exception 'Deliverable not found';
  end if;
  if v_client is null or v_client is distinct from public.current_client_id() then
    raise exception 'Not allowed';
  end if;
  if v_status <> 'in_review' then
    raise exception 'This deliverable is not awaiting review';
  end if;

  if p_approve then
    update public.deliverables
      set status = 'approved'
      where id = p_deliverable_id;
  else
    if p_comment is null or btrim(p_comment) = '' then
      raise exception 'A comment is required when requesting changes';
    end if;
    update public.deliverables
      set status = 'in_progress'
      where id = p_deliverable_id;
  end if;

  if p_comment is not null and btrim(p_comment) <> '' then
    insert into public.notes (project_id, author_id, visibility, body)
    values (v_project_id, auth.uid(), 'client', btrim(p_comment));
  end if;

  perform public.recompute_project_progress(v_project_id);
end;
$$;

revoke all on function public.review_deliverable(uuid, boolean, text) from public;
grant execute on function public.review_deliverable(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Audit log — every insert/update/delete on core tables, admin-readable
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,          -- INSERT | UPDATE | DELETE
  table_name text not null,
  row_id     uuid,
  summary    text not null default '',
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

create policy "admins read audit log" on public.audit_log
  for select using (public.jwt_role() = 'admin');

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rec jsonb;
begin
  if tg_op = 'DELETE' then
    v_rec := to_jsonb(old);
  else
    v_rec := to_jsonb(new);
  end if;

  insert into public.audit_log (actor_id, action, table_name, row_id, summary)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    (v_rec ->> 'id')::uuid,
    coalesce(v_rec ->> 'name', v_rec ->> 'number', left(v_rec ->> 'body', 80), '')
  );
  return null;
end;
$$;

create trigger clients_audit
  after insert or update or delete on public.clients
  for each row execute function public.log_audit();
create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function public.log_audit();
create trigger invoices_audit
  after insert or update or delete on public.invoices
  for each row execute function public.log_audit();
create trigger deliverables_audit
  after insert or update or delete on public.deliverables
  for each row execute function public.log_audit();
create trigger notes_audit
  after insert or update or delete on public.notes
  for each row execute function public.log_audit();
