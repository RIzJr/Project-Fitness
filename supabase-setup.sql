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

-- 6. Let people delete their own account (same as supabase-update-1.sql)
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from public.reports     where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.coach_links where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.coach_codes where coach_id = auth.uid();
  delete from public.docs        where user_id = auth.uid();
  delete from auth.users         where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;


-- 7. Planned sessions, written by the coach, readable by that client only (while they're linked)
create table if not exists public.plans (
  coach_id   uuid not null default auth.uid() references auth.users on delete cascade,
  client_id  uuid not null references auth.users on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (coach_id, client_id, id)
);
alter table public.plans enable row level security;
drop policy if exists "coach plans for linked clients" on public.plans;
create policy "coach plans for linked clients" on public.plans for all
  using (auth.uid() = coach_id and exists (
    select 1 from public.coach_links l where l.coach_id = auth.uid() and l.client_id = plans.client_id))
  with check (auth.uid() = coach_id and exists (
    select 1 from public.coach_links l where l.coach_id = auth.uid() and l.client_id = plans.client_id));
drop policy if exists "client reads own plans" on public.plans;
create policy "client reads own plans" on public.plans for select
  using (auth.uid() = client_id and exists (
    select 1 from public.coach_links l where l.client_id = auth.uid() and l.coach_id = plans.coach_id));
drop policy if exists "client can remove own plans" on public.plans;
create policy "client can remove own plans" on public.plans for delete using (auth.uid() = client_id);
drop trigger if exists plans_touch on public.plans;
create trigger plans_touch before insert or update on public.plans
  for each row execute function public.touch_updated_at();
create index if not exists plans_client_updated on public.plans (client_id, updated_at);

-- account deletion also removes planned sessions
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from public.plans       where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.reports     where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.coach_links where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.coach_codes where coach_id = auth.uid();
  delete from public.docs        where user_id = auth.uid();
  delete from auth.users         where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;


-- 8. Where to send notifications for each person's phones (each person can only see and change their own)
create table if not exists public.push_subs (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  tz         text,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);
alter table public.push_subs enable row level security;
drop policy if exists "own push subscriptions" on public.push_subs;
create policy "own push subscriptions" on public.push_subs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 9. Server-only settings and a record of what was sent (no policies = nobody but the server can read them)
create table if not exists public.push_config (
  id          int primary key default 1,
  public_key  text,
  private_key text,
  cron_secret text
);
alter table public.push_config enable row level security;
insert into public.push_config (id, cron_secret) values (1, gen_random_uuid()::text) on conflict (id) do nothing;
create table if not exists public.push_log (
  user_id uuid not null references auth.users on delete cascade,
  kind    text not null,
  key     text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, kind, key)
);
alter table public.push_log enable row level security;

-- 10. Check for due reminders every 15 minutes
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('pf-reminders') where exists (select 1 from cron.job where jobname = 'pf-reminders');
select cron.schedule('pf-reminders', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://agcmdqfjyiiolnuvgzbw.supabase.co/functions/v1/reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select cron_secret from public.push_config where id = 1)),
    body := '{}'::jsonb)
$$);

-- account deletion also removes notification settings
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from public.push_subs   where user_id = auth.uid();
  delete from public.push_log    where user_id = auth.uid();
  delete from public.plans       where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.reports     where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.coach_links where client_id = auth.uid() or coach_id = auth.uid();
  delete from public.coach_codes where coach_id = auth.uid();
  delete from public.docs        where user_id = auth.uid();
  delete from auth.users         where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
