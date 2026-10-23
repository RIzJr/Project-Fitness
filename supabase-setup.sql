-- Project Fitness: cloud accounts, sync and coach sharing
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Row Level Security (RLS) means each person can only read and write their own data.
-- Coaches can only read the weekly summary reports their linked clients choose to share.

-- 1. Everyone's own app data (food, training, body, check-ins, settings), one row per item
create table if not exists public.docs (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.docs enable row level security;
drop policy if exists "own docs" on public.docs;
create policy "own docs" on public.docs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- keep updated_at on the server clock so syncing never misses a change
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before insert or update on public.docs
  for each row execute function public.touch_updated_at();
create index if not exists docs_user_updated on public.docs (user_id, updated_at);

-- 2. Coach codes (a coach creates one and gives it to clients)
create table if not exists public.coach_codes (
  coach_id uuid primary key default auth.uid() references auth.users on delete cascade,
  code     text not null unique,
  name     text
);
alter table public.coach_codes enable row level security;
drop policy if exists "coach manages own code" on public.coach_codes;
create policy "coach manages own code" on public.coach_codes for all
  using (auth.uid() = coach_id) with check (auth.uid() = coach_id);

-- 3. Links: a client chooses to share with a coach
create table if not exists public.coach_links (
  client_id     uuid not null default auth.uid() references auth.users on delete cascade,
  coach_id      uuid not null references auth.users on delete cascade,
  coach_name    text,
  client_name   text,
  include_notes boolean not null default true,
  created_at    timestamptz not null default now(),
  primary key (client_id, coach_id)
);
alter table public.coach_links enable row level security;
drop policy if exists "client manages links" on public.coach_links;
create policy "client manages links" on public.coach_links for all
  using (auth.uid() = client_id) with check (auth.uid() = client_id);
drop policy if exists "coach sees links" on public.coach_links;
create policy "coach sees links" on public.coach_links for select using (auth.uid() = coach_id);
drop policy if exists "coach can remove link" on public.coach_links;
create policy "coach can remove link" on public.coach_links for delete using (auth.uid() = coach_id);

-- 4. Weekly summary reports, written by the client, readable by their linked coach only
create table if not exists public.reports (
  client_id  uuid not null default auth.uid() references auth.users on delete cascade,
  coach_id   uuid not null references auth.users on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (client_id, coach_id)
);
alter table public.reports enable row level security;
drop policy if exists "client writes own reports" on public.reports;
create policy "client writes own reports" on public.reports for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id and exists (
    select 1 from public.coach_links l where l.client_id = auth.uid() and l.coach_id = reports.coach_id));
drop policy if exists "linked coach reads reports" on public.reports;
create policy "linked coach reads reports" on public.reports for select
  using (auth.uid() = coach_id and exists (
    select 1 from public.coach_links l where l.coach_id = auth.uid() and l.client_id = reports.client_id));
drop policy if exists "coach can remove report" on public.reports;
create policy "coach can remove report" on public.reports for delete using (auth.uid() = coach_id);
drop trigger if exists reports_touch on public.reports;
create trigger reports_touch before insert or update on public.reports
  for each row execute function public.touch_updated_at();

-- 5. Linking by code without letting anyone browse the list of coaches
create or replace function public.link_coach(p_code text, p_name text default null)
returns text language plpgsql security definer set search_path = public as $$
declare c record;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select coach_id, name into c from public.coach_codes where code = upper(trim(p_code));
  if not found then raise exception 'No coach with that code'; end if;
  if c.coach_id = auth.uid() then raise exception 'That is your own code'; end if;
  insert into public.coach_links (client_id, coach_id, coach_name, client_name)
  values (auth.uid(), c.coach_id, c.name, p_name)
  on conflict (client_id, coach_id) do update set coach_name = excluded.coach_name, client_name = excluded.client_name;
  return coalesce(c.name, 'your coach');
end $$;
revoke all on function public.link_coach(text, text) from public;
grant execute on function public.link_coach(text, text) to authenticated;
