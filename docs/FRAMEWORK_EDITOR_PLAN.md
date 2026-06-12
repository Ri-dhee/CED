# GRME Framework Editor — Implementation Plan

## Context

Currently, the GRME Index has a hardcoded `DOMAINS` array in `grme-data.ts` with 8 domains, 26 sub-domains, and 85 indicators. Users can only enter data for existing indicators. The user wants full CRUD: any stakeholder can propose changes to the framework (domains, sub-domains, indicators), and admins approve/reject them. The framework is global (shared across all cities).

---

## Architecture Decisions

1. **Framework stored in localStorage** under a new key `"grme-framework"`. On first load, seeded from the static `DOMAINS` constant.
2. **Proposal-based workflow**: Changes are submitted as `FrameworkProposal` objects. An approval step promotes proposals into the active framework.
3. **New `useGRMEFramework` hook** manages framework state + proposals, separate from the existing `useGRMEData` hook (which manages indicator values per city).
4. **New "Framework" tab** in the GRME page with sub-views: Browse, Propose, Review.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/grme-framework.ts` | **CREATE** | Types for proposals, CRUD helpers, localStorage persistence, default framework seed |
| `src/lib/grme-framework-store.ts` | **CREATE** | React hook `useGRMEFramework()` — manages framework + proposals in localStorage |
| `src/components/FrameworkEditor.tsx` | **CREATE** | Main framework management component (browse domains, subdomains, indicators) |
| `src/components/DomainForm.tsx` | **CREATE** | Form for adding/editing a domain |
| `src/components/SubDomainForm.tsx` | **CREATE** | Form for adding/editing a sub-domain |
| `src/components/IndicatorForm.tsx` | **CREATE** | Form for adding/editing an indicator |
| `src/components/ProposalReview.tsx` | **CREATE** | Queue of pending proposals with approve/reject actions |
| `src/app/grme/page.tsx` | **MODIFY** | Add "Framework" tab, pass framework data to all child components |
| `src/lib/grme-data.ts` | **MODIFY** | Keep `DOMAINS` as default seed only; add `DEFAULT_DOMAINS` export |
| `src/lib/grme-store.ts` | **MODIFY** | Accept framework as parameter instead of importing `DOMAINS` directly |
| `src/components/RadarChart.tsx` | **MODIFY** | Accept domains as prop instead of importing `DOMAINS` |
| `src/components/AuditPanel.tsx` | **MODIFY** | Accept domains as prop instead of importing `DOMAINS` |
| `src/components/DataEntryForm.tsx` | **MODIFY** | Minor — no DOMAINS import, but uses Indicator type (no change needed) |

---

## Data Model

### New Types (`grme-framework.ts`)

```ts
export type ProposalAction = "add" | "edit" | "delete";
export type ProposalEntity = "domain" | "subdomain" | "indicator";
export type ProposalStatus = "pending" | "approved" | "rejected";

export interface FrameworkProposal {
  id: string;
  timestamp: string;
  proposedBy: string;
  action: ProposalAction;        // add, edit, delete
  entity: ProposalEntity;        // domain, subdomain, indicator
  entityPath: string;            // e.g. "safety-security" or "safety-security/public-space-safety" or "safety-security/public-space-safety/ss-1"
  data: Domain | SubDomain | Indicator;  // The proposed new/edited entity
  originalData?: Domain | SubDomain | Indicator;  // For edits — what it was before
  status: ProposalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface FrameworkStorage {
  domains: Domain[];
  proposals: FrameworkProposal[];
  lastUpdated: string;
}
```

### CRUD Helpers (`grme-framework.ts`)

```ts
export function loadFramework(): FrameworkStorage
export function saveFramework(fw: FrameworkStorage): void
export function getDefaultFramework(): Domain[]  // returns clone of DOMAINS

// Entity lookups
export function findDomain(domains: Domain[], id: string): Domain | undefined
export function findSubDomain(domain: SubDomain[], id: string): SubDomain | undefined
export function findIndicatorById(entities: ..., id: string): Indicator | undefined

// Apply approved proposal to framework
export function applyProposal(domains: Domain[], proposal: FrameworkProposal): Domain[]
```

### React Hook (`grme-framework-store.ts`)

```ts
export function useGRMEFramework() {
  // State
  domains: Domain[]
  proposals: FrameworkProposal[]
  
  // Framework CRUD (creates proposals)
  proposeDomain(action, data): void
  proposeSubDomain(domainId, action, data): void
  proposeIndicator(domainId, subDomainId, action, data): void
  
  // Proposal management
  approveProposal(proposalId, notes?): void
  rejectProposal(proposalId, notes?): void
  
  // Helpers
  getIndicatorsForDomain(domainId): Indicator[]
  getIndicatorById(id): Indicator | undefined
}
```

---

## UI Design — New "Framework" Tab

### Tab Layout (4 tabs total)

```
[Dashboard] [Data Entry] [Framework] [Audit Trail]
```

### Framework Tab Sub-Views

Three sub-views within the Framework tab:

#### 1. Browse (default)
- Left sidebar: domain list with expand/collapse
- Right panel: selected domain details, subdomains, indicators
- Each item has an "Edit" button and "Delete" button (creates proposal)
- "Add Domain" / "Add Sub-Domain" / "Add Indicator" buttons

#### 2. Propose (form view)
- Multi-step form:
  - Step 1: Select entity type (Domain / Sub-Domain / Indicator)
  - Step 2: Select parent (if sub-domain or indicator)
  - Step 3: Fill in fields (contextual to entity type)
  - Step 4: Review & submit proposal
- Edit mode: pre-fills form with existing data

#### 3. Review (approval queue)
- Table of pending proposals
- Each row: proposer, entity type, action, timestamp, preview of change
- Approve / Reject buttons with optional notes
- History of reviewed proposals

---

## Field Forms

### Domain Form Fields
- Name (text, required)
- Short Name (text, required)
- Description (textarea)
- Icon (dropdown: shield, map, home, chart, heart, users, leaf, globe)
- Color (color picker, hex)

### Sub-Domain Form Fields
- Name (text, required)
- Parent Domain (dropdown, required)
- Weight (number, optional)

### Indicator Form Fields
- Name (text, required)
- Type (dropdown: Quantitative, Qualitative, Participatory)
- Data Type (dropdown: percentage, number, ratio, index, text, boolean)
- Unit (text)
- Description (textarea)
- Direction (dropdown: higher, lower)
- Source (text, optional)
- Weight (number, optional)
- Benchmark Critical (text, required)
- Benchmark Developing (text, required)
- Benchmark Progressive (text, required)
- Benchmark Exemplary (text, required)

---

## Changes to Existing Components

### `grme-data.ts`
- Rename `DOMAINS` to `DEFAULT_DOMAINS` internally, keep `DOMAINS` as deprecated re-export for backward compat
- Add `export const DEFAULT_DOMAINS: Domain[] = [...]` (same data)
- All scoring functions remain unchanged (they take Domain/Indicator as parameters)

### `grme-store.ts`
- Remove direct `DOMAINS` import
- Accept `domains: Domain[]` parameter in `useGRMEData(domains)` or use the framework hook
- Update `findIndicator`, `getDomainScore`, `getOverallScore`, `getDataEntryStats` to use provided domains

### `page.tsx`
- Add 4th tab "Framework"
- Use `useGRMEFramework()` to get `domains` and `proposals`
- Pass `domains` to `useGRMEData(domains)` and all child components
- Pass `domains` as props to RadarChart, AuditPanel

### `RadarChart.tsx`
- Add `domains: Domain[]` prop
- Remove `DOMAINS` import

### `AuditPanel.tsx`
- Add `domains: Domain[]` prop
- Remove `DOMAINS` import

---

## Implementation Order

1. **Phase 1: Data Layer**
   - Create `grme-framework.ts` (types, CRUD helpers, localStorage)
   - Create `grme-framework-store.ts` (React hook)

2. **Phase 2: Framework Editor Components**
   - Create `FrameworkEditor.tsx` (browse view)
   - Create `DomainForm.tsx`
   - Create `SubDomainForm.tsx`
   - Create `IndicatorForm.tsx`
   - Create `ProposalReview.tsx`

3. **Phase 3: Integration**
   - Update `grme-data.ts` (rename DOMAINS to DEFAULT_DOMAINS)
   - Update `grme-store.ts` (accept domains parameter)
   - Update `page.tsx` (add Framework tab, wire everything)
   - Update `RadarChart.tsx` (accept domains prop)
   - Update `AuditPanel.tsx` (accept domains prop)

4. **Phase 4: Polish & Deploy**
   - TypeScript check
   - Build verification
   - Test proposal workflow end-to-end
   - Deploy

---

## Verification

1. `npx tsc --noEmit` — zero errors
2. `npx next build` — succeeds
3. Manual test: Add a domain via Framework tab → verify it appears in Dashboard radar chart and Data Entry
4. Manual test: Edit an indicator benchmark → verify scoring updates
5. Manual test: Delete a subdomain → verify it disappears from Data Entry nav
6. Manual test: Propose → approve flow works
7. Manual test: Data entry for new indicators persists across page reload
