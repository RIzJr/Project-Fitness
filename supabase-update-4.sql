-- Project Fitness update 4: "rest over" notifications that arrive even when the phone is locked
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Then redeploy the "reminders" Edge Function with the new supabase/functions/reminders/index.ts (Verify JWT stays off).

-- 11. When each person's current rest period ends (each person can only see and change their own row)
create table if not exists public.rest_timers (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  ends_at    timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.rest_timers enable row level security;
drop policy if exists "own rest timer" on public.rest_timers;
create policy "own rest timer" on public.rest_timers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 12. Every 10 seconds: if any rest period has ended, ask the server function to send the notifications.
-- Cheap: it only calls the function when a timer is actually due.
create or replace function public.pf_rest_tick()
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.rest_timers where ends_at <= now()) then
    perform net.http_post(
      url := 'https://agcmdqfjyiiolnuvgzbw.supabase.co/functions/v1/reminders',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select cron_secret from public.push_config where id = 1)),
      body := '{"rest":true}'::jsonb);
  end if;
end $$;
revoke all on function public.pf_rest_tick() from public;
select cron.unschedule('pf-rest') where exists (select 1 from cron.job where jobname = 'pf-rest');
select cron.schedule('pf-rest', '10 seconds', 'select public.pf_rest_tick()');

-- account deletion also removes the rest timer
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from public.rest_timers where user_id = auth.uid();
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
