-- Project Fitness update 3: phone reminders (food, morning check-in, coach's session, workout left running)
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Then deploy the "reminders" Edge Function (supabase/functions/reminders/index.ts) and turn off "Verify JWT" for it.

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
