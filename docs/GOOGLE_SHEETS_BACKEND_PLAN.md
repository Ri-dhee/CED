# Google Sheets Backend Integration Plan

## Overview
Replace localStorage with Google Sheets as a shared, persistent database. All users see the same data. Data survives browser cache clears.

## Architecture
```
Browser (React) → fetch() → Google Apps Script (Web App) → Google Sheet (Database)
```

---

## Step 1: Google Sheet Structure

Create a Google Sheet with 3 tabs:

### Tab 1: `assessment_data`
| Column | Type | Example |
|--------|------|---------|
| city_id | string | thimphu |
| year | number | 2026 |
| indicator_id | string | ss-1 |
| value | string | 75 |
| evidence | string | (optional) |
| notes | string | (optional) |
| last_updated | ISO string | 2026-06-12T... |
| updated_by | string | admin |

One row per indicator per city per year. ~85 indicators × 4 cities × N years.

### Tab 2: `audit_log`
| Column | Type | Example |
|--------|------|---------|
| city_id | string | thimphu |
| year | number | 2026 |
| indicator_id | string | ss-1 |
| entry_id | string | aud-xxx |
| timestamp | ISO string | 2026-06-12T... |
| user | string | admin |
| action | string | update |
| field | string | value |
| old_value | string | 60 |
| new_value | string | 75 |
| notes | string | (optional) |

### Tab 3: `framework`
| Column | Type | Example |
|--------|------|---------|
| key | string | domains |
| value | JSON string | [{id:"safety",...}] |
| last_updated | ISO string | 2026-06-12T... |

Stores the entire framework as a single JSON blob (simple, atomic reads/writes).

### Tab 4: `managed_users`
| Column | Type | Example |
|--------|------|---------|
| id | string | usr-xxx |
| name | string | admin |
| role | string | admin |
| password_hash | string | sha256hex... |
| created_at | ISO string | 2026-06-12T... |
| last_login_at | ISO string | null |
| active | boolean | true |

### Tab 5: `config`
| Column | Type | Example |
|--------|------|---------|
| key | string | schema_version |
| value | string | 1 |

---

## Step 2: Google Apps Script API

Deploy as Web App (Execute as: Me, Access: Anyone with the link).

### Endpoints (via GET/POST `action` parameter)

| Action | Method | Description |
|--------|--------|-------------|
| `health` | GET | Returns OK |
| `loadAssessments` | GET | Returns all assessment_data rows as JSON |
| `saveAssessment` | POST | Upserts one indicator value (city_id + year + indicator_id as key) |
| `saveAssessments` | POST | Batch upsert multiple indicator values |
| `loadAuditLog` | GET | Returns all audit_log rows as JSON |
| `addAuditEntry` | POST | Appends one audit entry |
| `loadFramework` | GET | Returns framework JSON from config tab |
| `saveFramework` | POST | Saves framework JSON to config tab |
| `loadUsers` | GET | Returns all managed_users rows as JSON |
| `saveUsers` | POST | Replaces all managed_users rows |
| `loadConfig` | GET | Returns all config rows |
| `saveConfig` | POST | Saves a config key-value pair |

### Response format
```json
{ "status": "ok", "data": { ... } }
// or
{ "status": "error", "message": "..." }
```

---

## Step 3: Frontend API Client

Create `src/lib/grme-api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_SHEETS_API_URL || "";

// Generic fetch wrapper
async function apiCall(action: string, method: string, body?: any)

// Assessment CRUD
loadAssessments(): Promise<Record<string, CityData>>
saveAssessment(cityId, year, indicatorId, data): Promise<void>
saveAssessments(cityId, year, indicators): Promise<void>

// Audit
loadAuditLog(): Promise<AuditLog[]>
addAuditEntry(cityId, year, indicatorId, entry): Promise<void>

// Framework
loadFramework(): Promise<FrameworkStorage>
saveFramework(framework): Promise<void>

// Users
loadUsers(): Promise<ManagedUser[]>
saveUsers(users): Promise<void>

// Config
loadConfig(): Promise<Record<string, string>>
saveConfig(key, value): Promise<void>
```

---

## Step 4: Update Existing Stores

### `grme-store.ts`
- Replace `loadAllData()` → calls `api.loadAssessments()`, transforms to `Record<string, CityData>`
- Replace `saveAllData()` → calls `api.saveAssessments()` for changed indicators
- Add loading state, error handling, offline fallback to localStorage

### `grme-framework.ts`
- Replace `loadFramework()` → calls `api.loadFramework()`
- Replace `saveFramework()` → calls `api.saveFramework()`
- Keep localStorage as offline fallback

### `grme-managed-users.ts`
- Replace `loadUsers()` → calls `api.loadUsers()`
- Replace `saveUsers()` → calls `api.saveUsers()`

### `grme-user.ts`
- **Keep in localStorage** (session-only, per-browser, no need to sync)

---

## Step 5: Offline Fallback Strategy

Each store implements:
1. Try API call first
2. On network error, fall back to localStorage
3. Show a subtle "offline" indicator in the UI
4. On reconnection, sync pending changes

This ensures the app works even without internet.

---

## Step 6: Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_SHEETS_API_URL=https://script.google.com/macros/s/XXXX/exec
```

---

## Step 7: Files to Create/Modify

### New files:
1. `src/lib/grme-api.ts` — API client
2. `google-apps-script/Code.gs` — Apps Script backend
3. `google-apps-script/README.md` — Setup instructions

### Modified files:
4. `src/lib/grme-store.ts` — Use API instead of localStorage
5. `src/lib/grme-framework.ts` — Use API instead of localStorage
6. `src/lib/grme-framework-store.ts` — Update resetFramework
7. `src/lib/grme-managed-users.ts` — Use API instead of localStorage
8. `.env.local` — Add API URL

---

## Setup Instructions (for user)

1. Create a Google Sheet
2. Share it with your Google account
3. Open Apps Script editor (Extensions → Apps Script)
4. Paste the Code.gs script
5. Deploy as Web App
6. Copy the Web App URL
7. Add it to `.env.local` as `NEXT_PUBLIC_SHEETS_API_URL`
8. Redeploy to Vercel

Estimated setup time: ~15 minutes.
