-- DentRay Supabase schema
-- Run this in the Supabase SQL editor after creating a project.

-- Enable UUID helper
create extension if not exists "pgcrypto";

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scan sessions table
create table if not exists public.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  total_images integer default 0,
  highest_indication text,
  summary text
);

-- Scan results table
create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.scan_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  view_type text not null,
  original_image_url text,
  mask_image_url text,
  overlay_image_url text,
  segmented_area_pixels integer,
  segmented_area_percentage numeric,
  interpretation_level text,
  interpretation_text text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.scan_sessions enable row level security;
alter table public.scan_results enable row level security;

-- Profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Scan sessions policies
drop policy if exists "Users can view own scan sessions" on public.scan_sessions;
create policy "Users can view own scan sessions"
on public.scan_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own scan sessions" on public.scan_sessions;
create policy "Users can insert own scan sessions"
on public.scan_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own scan sessions" on public.scan_sessions;
create policy "Users can update own scan sessions"
on public.scan_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own scan sessions" on public.scan_sessions;
create policy "Users can delete own scan sessions"
on public.scan_sessions
for delete
to authenticated
using (auth.uid() = user_id);

-- Scan results policies
drop policy if exists "Users can view own scan results" on public.scan_results;
create policy "Users can view own scan results"
on public.scan_results
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own scan results" on public.scan_results;
create policy "Users can insert own scan results"
on public.scan_results
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own scan results" on public.scan_results;
create policy "Users can update own scan results"
on public.scan_results
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own scan results" on public.scan_results;
create policy "Users can delete own scan results"
on public.scan_results
for delete
to authenticated
using (auth.uid() = user_id);

-- Auto-create profile after user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.scan_sessions to authenticated;
grant select, insert, update, delete on public.scan_results to authenticated;
