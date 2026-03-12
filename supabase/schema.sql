-- Sylla MVP Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends auth.users)
-- id matches auth.users.id
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  school text,
  created_at timestamptz default now()
);

-- Study sessions
create table public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  location text,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.users enable row level security;
alter table public.study_sessions enable row level security;

-- Users: anyone can read profiles, users can update own
create policy "Users are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Note: User profiles are created by trigger on auth signup, not by client insert

-- Study sessions: anyone can read (for feed), users can insert own
create policy "Study sessions are viewable by everyone"
  on public.study_sessions for select
  using (true);

create policy "Users can insert own sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.study_sessions for delete
  using (auth.uid() = user_id);

-- Indexes for common queries
create index study_sessions_created_at_idx on public.study_sessions(created_at desc);
create index study_sessions_user_id_idx on public.study_sessions(user_id);

-- Trigger: create public.users row when a new auth user signs up
-- Uses raw_user_meta_data (username, school) passed from client signUp
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
