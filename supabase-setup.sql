-- GRME Index — Supabase Setup
-- Run this in the Supabase SQL Editor after creating a new project.

-- 1. assessment_data
CREATE TABLE assessment_data (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  indicator_id TEXT NOT NULL,
  value TEXT,
  evidence TEXT,
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE(city_id, year, indicator_id)
);

-- 2. audit_log
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  city_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  indicator_id TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  "user" TEXT,
  action TEXT,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  notes TEXT
);

-- 3. framework
CREATE TABLE framework (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. managed_users
CREATE TABLE managed_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

-- 5. config (health check)
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Enable Row Level Security (open access — no auth required)
ALTER TABLE assessment_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON assessment_data FOR ALL USING (true);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON audit_log FOR ALL USING (true);

ALTER TABLE framework ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON framework FOR ALL USING (true);

ALTER TABLE managed_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON managed_users FOR ALL USING (true);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON config FOR ALL USING (true);

-- Enable real-time subscriptions for these tables
-- (Run this in the Supabase dashboard: Database > Replication > enable for these tables)
-- Or run:
-- ALTER PUBLICATION supabase_realtime ADD TABLE assessment_data;
-- ALTER PUBLICATION supabase_realtime ADD TABLE framework;
-- ALTER PUBLICATION supabase_realtime ADD TABLE managed_users;

-- Insert health check row
INSERT INTO config (key, value) VALUES ('app_version', '1.0.0') ON CONFLICT (key) DO NOTHING;