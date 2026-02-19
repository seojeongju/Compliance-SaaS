-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create mock users table (if not using Supabase Auth strictly yet)
-- or Profiles table linking to auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  company_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Diagnostics Results Table
create table public.diagnostic_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- can be null for anonymous for now
  product_name text not null,
  category text not null,
  description text,
  result_json jsonb not null, -- Stores the full AI result
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.diagnostic_results enable row level security;

-- Policies (Allow read/write for own data)
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- For diagnostics, allow anyone to insert for now (demo purpose), normally restrict to user
create policy "Anyone can insert diagnostics" on public.diagnostic_results for insert with check (true);
create policy "Users can see own diagnostics" on public.diagnostic_results for select using (auth.uid() = user_id);
