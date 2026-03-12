-- Fix signup RLS: use trigger to create user profile instead of client insert
-- Run this in Supabase SQL Editor if you already ran the main schema

-- Drop the old insert policy (client no longer inserts)
drop policy if exists "Users can insert own profile" on public.users;

-- Trigger: create public.users row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, school)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    (new.raw_user_meta_data->>'school')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Remove trigger if it exists (for re-runs), then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
