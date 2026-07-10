-- Phase 1: Thromde & Stakeholder Data Model
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- 1. Thromdes table
CREATE TABLE IF NOT EXISTS thromdes (
  id TEXT PRIMARY KEY,
  dzongkhag_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add thromde_id to assessment_data (nullable = dzongkhag-level)
ALTER TABLE assessment_data ADD COLUMN IF NOT EXISTS thromde_id TEXT REFERENCES thromdes(id) ON DELETE SET NULL;

-- 3. Add new columns to managed_users
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS stakeholder_id TEXT DEFAULT '';
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS dzongkhag_id TEXT DEFAULT '';
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS thromde_id TEXT REFERENCES thromdes(id) ON DELETE SET NULL;
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS allowed_domain_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS allowed_indicator_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS allowed_dzongkhag_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE managed_users ADD COLUMN IF NOT EXISTS allowed_thromde_ids JSONB DEFAULT '[]'::jsonb;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_assessment_thromde ON assessment_data(thromde_id);
CREATE INDEX IF NOT EXISTS idx_thromdes_dzongkhag ON thromdes(dzongkhag_id);
CREATE INDEX IF NOT EXISTS idx_managed_users_scope ON managed_users(dzongkhag_id, thromde_id);

-- 5. Enable RLS on new table
ALTER TABLE thromdes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "thromdes_read_all" ON thromdes FOR SELECT USING (true);
CREATE POLICY "thromdes_insert_admin" ON thromdes FOR INSERT WITH CHECK (true);
CREATE POLICY "thromdes_update_admin" ON thromdes FOR UPDATE USING (true);
CREATE POLICY "thromdes_delete_admin" ON thromdes FOR DELETE USING (true);
