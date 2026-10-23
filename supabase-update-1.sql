-- Project Fitness update 1: let people delete their own account
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.

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
