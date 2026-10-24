-- Project Fitness update 2: coaches can plan sessions for their linked clients
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.

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
