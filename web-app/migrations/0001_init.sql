-- Certi-Mate D1 schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email_verify', 'password_reset')),
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS diagnostic_results (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  result_json TEXT NOT NULL,
  tool_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  diagnostic_id TEXT REFERENCES diagnostic_results(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  content TEXT,
  r2_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subsidy_programs (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('bizinfo', 'kstartup')),
  title TEXT NOT NULL,
  agency TEXT,
  category TEXT,
  description TEXT,
  target TEXT,
  application_period TEXT,
  deadline_date TEXT,
  official_url TEXT NOT NULL,
  application_url TEXT,
  hashtags TEXT DEFAULT '[]',
  status TEXT DEFAULT 'open',
  raw_json TEXT,
  synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (source, external_id)
);

CREATE TABLE IF NOT EXISTS subsidy_bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES subsidy_programs(id) ON DELETE SET NULL,
  announcement_id TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  official_url TEXT,
  deadline TEXT,
  deadline_status TEXT DEFAULT 'unknown',
  remind_deadline INTEGER DEFAULT 1,
  bookmarked_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, source, announcement_id)
);

CREATE TABLE IF NOT EXISTS subsidy_sync_logs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  synced_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user ON diagnostic_results(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_subsidy_programs_status ON subsidy_programs(status);
CREATE INDEX IF NOT EXISTS idx_subsidy_bookmarks_user ON subsidy_bookmarks(user_id);
