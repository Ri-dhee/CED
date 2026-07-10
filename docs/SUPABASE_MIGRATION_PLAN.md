# Supabase Backend Migration Plan

## Overview
Replace Google Sheets + Apps Script with Supabase (free PostgreSQL).
No polling needed — Supabase has real-time subscriptions.

## Architecture
```
Browser → Supabase JS Client → Supabase Cloud (free tier)
```

## Supabase Free Tier
- 500MB database
- 50,000 monthly active users
- 500MB file storage
- 2GB bandwidth
- No runtime limits (unlike Apps Script 90 min/day)

## Step 1: Create Supabase Project
1. Go to supabase.com → Sign in with GitHub
2. Create new project → Name: "grme-index"
3. Note the Project URL and anon key

## Step 2: Database Schema

### Table: assessment_data
```sql
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
```

### Table: audit_log
```sql
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
```

### Table: framework
```sql
CREATE TABLE framework (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: managed_users
```sql
CREATE TABLE managed_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);
```

### Table: config
```sql
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

## Step 3: Row Level Security (RLS)
- Allow anonymous read access (anyone can view)
- Allow authenticated write access (anyone can save)
- No auth required for this use case

```sql
ALTER TABLE assessment_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON assessment_data FOR ALL USING (true);
-- Same for other tables
```

## Step 4: Real-time Subscriptions
- Subscribe to `assessment_data` changes → auto-refresh when others save
- Subscribe to `framework` changes → auto-refresh when admin edits framework
- No polling needed!

## Step 5: Frontend Changes

### New file: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export default supabase
```

### Updated: `src/lib/grme-api.ts`
Replace all fetch calls with Supabase queries:
- `loadAssessments()` → `supabase.from('assessment_data').select('*')`
- `saveAssessment()` → `supabase.from('assessment_data').upsert(...)`
- `deleteYear()` → `supabase.from('assessment_data').delete().eq(...)`
- Same for framework, users, audit log

### Updated: `src/lib/grme-store.ts`
- Remove polling interval
- Add Supabase real-time subscription:
```typescript
supabase
  .channel('assessment_data')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_data' }, payload => {
    // Refresh data
  })
  .subscribe()
```

## Step 6: Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
NEXT_PUBLIC_GRME_STRICT_FREE_TIER=true
```

- Set `NEXT_PUBLIC_GRME_STRICT_FREE_TIER=true` to disable realtime listeners and focus-triggered refreshes in low-quota deployments.

## Files to Create/Modify
1. `src/lib/supabase.ts` — Supabase client
2. `src/lib/grme-api.ts` — Rewrite with Supabase queries
3. `src/lib/grme-store.ts` — Add real-time subscription, remove polling
4. `src/lib/grme-framework-store.ts` — Add real-time subscription
5. `src/lib/grme-managed-users.ts` — Use Supabase for users
6. `.env.local` — Add Supabase credentials

## Benefits Over Google Sheets
- No 90 min/day runtime limit
- No polling needed (real-time push)
- Proper SQL database
- Handles 1000s of concurrent users
- 500MB free (enough for millions of indicator rows)
- Built-in dashboard to view data
- Automatic backups
