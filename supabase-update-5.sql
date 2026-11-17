-- Project Fitness update 5: Pulse, the in-app motivator chat
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Then deploy the "companion" Edge Function (supabase/functions/companion/index.ts) with Verify JWT OFF (the code checks the user itself),
-- and add the secret ANTHROPIC_API_KEY under Project Settings → Edge Functions → Secrets.

-- 12. How many Pulse messages each person has sent today, so costs stay predictable. Only the server can read or change it
--     (row level security is on with no policies). Deleted with the account.
create table if not exists public.companion_usage (
  user_id uuid not null references auth.users on delete cascade,
  day     date not null default current_date,
  n       int  not null default 0,
  primary key (user_id, day)
);
alter table public.companion_usage enable row level security;

-- adds one to today's count and returns it, or -1 once the daily limit is reached
create or replace function public.companion_bump(uid uuid, lim int) returns int
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.companion_usage (user_id, day, n) values (uid, current_date, 1)
  on conflict (user_id, day) do update set n = public.companion_usage.n + 1 where public.companion_usage.n < lim
  returning n into c;
  return coalesce(c, -1);
end $$;
revoke all on function public.companion_bump(uuid, int) from public, anon, authenticated;
