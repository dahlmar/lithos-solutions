-- Lithos Solutions — development seed
-- Ports the mock data from src/features/*/data.ts (originally index.html).
-- Fixed UUIDs so re-running is idempotent and rows are easy to reference.
-- Run AFTER migrations 0001 + 0002. Dev/staging only.

-- ---------------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------------
insert into public.clients (id, name, contact_email, status) values
  ('c0000000-0000-0000-0000-000000000001', 'Aveline Studio', 'client@aveline.studio', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'Meridian Group', 'ops@meridian.com',      'active'),
  ('c0000000-0000-0000-0000-000000000003', 'Northwind Co',   'hello@northwind.co',    'active'),
  ('c0000000-0000-0000-0000-000000000004', 'Lumen Co',       'admin@lumen.co',        'onboarding'),
  ('c0000000-0000-0000-0000-000000000005', 'Atlas Labs',     'team@atlaslabs.io',     'active')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Projects (manager_id left null — assign real team profiles once they exist:
--   update public.projects set manager_id = (select id from auth.users where email = '…')
--   where name = '…';)
-- ---------------------------------------------------------------------------
insert into public.projects (id, client_id, name, type, status, progress, started_on) values
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Aveline Brand & Web Platform', 'creative', 'on_track', 68, '2026-05-12'),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002',
   'Meridian HQ Fit-out', 'infrastructure', 'at_risk', 42, '2026-04-02'),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002',
   'Meridian Network Backbone', 'infrastructure', 'planning', 8, '2026-07-01'),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003',
   'Northwind Rebrand', 'creative', 'on_track', 90, '2026-03-16'),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004',
   'Lumen Facilities Upgrade', 'infrastructure', 'planning', 15, '2026-06-22'),
  ('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005',
   'Atlas Product Launch', 'creative', 'delivered', 100, '2025-11-03'),
  ('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005',
   'Atlas Design Support', 'creative', 'on_track', 30, '2026-06-08')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------------
insert into public.invoices (id, project_id, number, amount_cents, currency, status, issued_on, due_on, paid_on) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'INV-0141', 18500000, 'SEK', 'paid',   '2026-05-15', '2026-06-14', '2026-06-02'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'INV-0142', 24000000, 'SEK', 'issued', '2026-07-16', '2026-08-15', null),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'INV-0139', 62000000, 'SEK', 'overdue', '2026-06-10', '2026-07-10', null),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
   'INV-0143', 9500000,  'SEK', 'draft',  null, null, null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Deliverables (Aveline milestones + docs from the prototype)
-- ---------------------------------------------------------------------------
insert into public.deliverables (id, project_id, name, description, status, version, due_on) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Identity System', 'Logo suite, type and color delivered and approved.', 'approved', 'v3.0', '2026-06-24'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Component Library', 'Buttons, forms and navigation complete. Data tables in review.', 'in_review', 'v0.9', '2026-07-15'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Design System Handoff', 'Tokens, documentation and Figma library package.', 'upcoming', null, '2026-08-04'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Website Build', 'Production build on approved component library.', 'upcoming', null, '2026-09-10'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
   'Structural Sign-off', 'Load-bearing review and structural approval package.', 'in_progress', null, '2026-07-28'),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004',
   'Brand Guidelines v2', 'Extended guidelines covering motion and social.', 'in_progress', 'v1.4', '2026-08-11')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Notes (author_id null until real team profiles exist)
-- ---------------------------------------------------------------------------
insert into public.notes (id, project_id, visibility, body) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'internal', 'Watch scope on marketing assets — client hinted at extra campaign work.'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'client', 'Design system on track for Aug 4 handoff. Nice work on the workshop feedback!'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002',
   'internal', 'Structural survey revealed load-bearing constraint — layout revision required, ~1 week schedule impact.')
on conflict (id) do nothing;
