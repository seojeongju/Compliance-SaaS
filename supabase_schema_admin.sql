/*
Run this SQL in your Supabase SQL Editor to enable Admin roles.

-- Add 'role' column to users table if not exists (usually we add it to a public.profiles table linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user',  -- 'user' | 'admin'
  tier text default 'free',  -- 'free' | 'pro'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy to allow users to read their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy to allow admins to view all profiles
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, tier)
  values (new.id, new.email, 'user', 'free');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
*/
