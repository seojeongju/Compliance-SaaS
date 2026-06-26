-- 정부지원사업 캐시 및 북마크 테이블
-- Supabase SQL Editor에서 실행하세요.

-- 1. 지원사업 공고 캐시
create table if not exists public.subsidy_programs (
  id uuid default gen_random_uuid() primary key,
  external_id text not null,
  source text not null check (source in ('bizinfo', 'kstartup')),
  title text not null,
  agency text,
  category text,
  description text,
  target text,
  application_period text,
  deadline_date date,
  official_url text not null,
  application_url text,
  hashtags text[] default '{}',
  status text default 'open' check (status in ('open', 'closing_soon', 'closed', 'unknown')),
  raw_json jsonb,
  synced_at timestamptz default timezone('utc'::text, now()) not null,
  unique (source, external_id)
);

create index if not exists idx_subsidy_programs_status on public.subsidy_programs (status);
create index if not exists idx_subsidy_programs_synced_at on public.subsidy_programs (synced_at desc);
create index if not exists idx_subsidy_programs_hashtags on public.subsidy_programs using gin (hashtags);

-- 2. 사용자 북마크 (마감 알림용)
create table if not exists public.subsidy_bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  program_id uuid references public.subsidy_programs(id) on delete set null,
  announcement_id text not null,
  source text not null check (source in ('bizinfo', 'kstartup', 'ai')),
  title text not null,
  official_url text,
  deadline text,
  deadline_status text default 'unknown',
  remind_deadline boolean default true,
  bookmarked_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, source, announcement_id)
);

create index if not exists idx_subsidy_bookmarks_user on public.subsidy_bookmarks (user_id);

-- 3. 동기화 로그
create table if not exists public.subsidy_sync_logs (
  id uuid default gen_random_uuid() primary key,
  source text not null,
  synced_count int default 0,
  error_message text,
  started_at timestamptz default timezone('utc'::text, now()) not null,
  finished_at timestamptz
);

-- RLS
alter table public.subsidy_programs enable row level security;
alter table public.subsidy_bookmarks enable row level security;
alter table public.subsidy_sync_logs enable row level security;

-- 공고 캐시: 모든 인증 사용자 읽기 가능
create policy "Anyone authenticated can read subsidy programs"
  on public.subsidy_programs for select
  using (true);

-- 서비스 롤만 쓰기 (API sync에서 service role 사용)
create policy "Service role can manage subsidy programs"
  on public.subsidy_programs for all
  using (auth.role() = 'service_role');

-- 북마크: 본인 것만 관리
create policy "Users manage own subsidy bookmarks"
  on public.subsidy_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 동기화 로그: 읽기만 (관리용)
create policy "Anyone can read sync logs"
  on public.subsidy_sync_logs for select
  using (true);

create policy "Service role can write sync logs"
  on public.subsidy_sync_logs for insert
  with check (auth.role() = 'service_role');
