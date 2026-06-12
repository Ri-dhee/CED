# Year Tracking Feature — Implementation Plan

## Context

Currently data is stored per-city with a single `year` field. The user wants to save data across years and track changes over time. This requires restructuring the data model to support multiple assessment years per city.

---

## Data Model Change

### Before (current)
```ts
interface CityData {
  cityId: string;
  cityName: string;
  year: number;                          // single year
  indicators: Record<string, IndicatorData>;
  auditLog: AuditLog[];
}
```

### After (new)
```ts
interface AssessmentYear {
  year: number;
  indicators: Record<string, IndicatorData>;
  auditLog: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

interface CityData {
  cityId: string;
  cityName: string;
  assessments: Record<number, AssessmentYear>;  // keyed by year
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/grme-data.ts` | MODIFY | Add `AssessmentYear` interface, update `CityData` |
| `src/lib/grme-store.ts` | REWRITE | Year-aware data management, migration from old format |
| `src/components/YearSelector.tsx` | CREATE | Year dropdown + add new year + year-over-year comparison |
| `src/components/TrendChart.tsx` | CREATE | Simple bar chart comparing scores across years |
| `src/app/grme/page.tsx` | MODIFY | Add year selector, pass year context, show trends |

---

## Year Selector UI

Placed in the stats bar next to the city selector:

```
[City: Thimphu ▾] [Year: 2026 ▾] [+ New Year] [Compare Years]
```

Features:
- Dropdown of existing years for the selected city
- "Add New Year" button — creates new assessment, optionally copies data from previous year
- "Compare" button — opens a view showing scores side-by-side across years
- Current year highlighted

---

## Year-over-Year Comparison

A simple comparison view on the dashboard:
- Bar chart showing overall score per year
- Domain scores compared across years
- Shows improvement/decline with arrows

---

## Migration Strategy

On first load after update:
- Check if old format exists (`cityData.indicators` is directly on CityData)
- If so, migrate to new format: wrap indicators in `assessments[currentYear]`
- Save migrated data, remove old format

---

## Implementation Order

1. Update `grme-data.ts` — add AssessmentYear, update CityData
2. Rewrite `grme-store.ts` — year-aware CRUD, migration
3. Create `YearSelector.tsx` — year dropdown + add new year
4. Create `TrendChart.tsx` — year comparison chart
5. Update `page.tsx` — integrate year selector and trends
6. TypeScript check, build, deploy
