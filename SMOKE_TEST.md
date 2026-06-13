# GRME — Deployment Smoke Test Checklist

Run through this checklist before every production deployment.

---

## 1. Test Suite & Lint

- [ ] `npm run lint` — zero warnings, zero errors
- [ ] `npm test` — 85/85 tests passing, zero unhandled errors

## 2. Bootstrap Login Flow

- [ ] Open `/grme` in a **clean browser session** (no prior localStorage)
- [ ] Loading spinner appears briefly, then login form renders
- [ ] **First-time message** shows: "First time? Enter your name and role…"
- [ ] Enter a name, select a role, click Enter Dashboard
- [ ] Dashboard renders with 8 domain cards, hero score, radar chart
- [ ] User badge shows correct name and role

## 3. Admin Path

- [ ] Log out (clear localStorage or open a new incognito window)
- [ ] Enter a name, select **Admin** role
- [ ] **Admin password field** appears
- [ ] Submit with wrong password — error shown, no login
- [ ] Submit with correct password (`GRME-Admin-2026` by default)
- [ ] Dashboard loads with **Data Entry** and **Framework** tabs visible

## 4. Managed User Path

- [ ] Open `/grme/setup` (or pre-populate `grme-managed-users` via snapshot)
- [ ] Enter a name that matches a managed user
- [ ] **Account found** badge shows with assigned role
- [ ] Password field appears for that user
- [ ] Enter correct password → login succeeds
- [ ] **lastLoginAt** timestamp records in localStorage

## 5. Data Entry

- [ ] Navigate to Data Entry tab
- [ ] Select a domain → sub-domain indicator list loads
- [ ] Enter a value and notes
- [ ] **Sync badge** shows "verified" timestamp after save
- [ ] Switch year → data persists per-year
- [ ] Boolean indicator toggles correctly (yes/no)

## 6. Framework Editing

- [ ] Navigate to Framework tab
- [ ] Edit a domain methodology note
- [ ] Edit an indicator name → old ID preserved as alias
- [ ] Submit a proposal → appears in pending proposals
- [ ] Review and approve proposal → framework updates
- [ ] **Data entry still works** for renamed indicators (alias mapping)

## 7. Multi-Year & Comparison

- [ ] Create a new assessment year
- [ ] Enter data in 2+ different years
- [ ] Dashboard overlay selector shows year options
- [ ] **RadarChart** overlays multiple years
- [ ] **ComparisonView** shows side-by-side domain scores
- [ ] **TrendChart** renders time-series

## 8. Offline Resilience

- [ ] Open DevTools → Application → Storage → clear all `grme-*` keys
- [ ] Reload page — app recovers gracefully (no crash, login screen renders)
- [ ] Run `node scripts/snapshot-state.js save` → template generated
- [ ] **Manually verify:** no error boundaries appear during any flow
