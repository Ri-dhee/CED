"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Domain,
  CITIES,
  CityData,
  AssessmentYear,
  IndicatorData,
  AuditEntry,
  AuditLog,
  Thromde,
  calculateIndicatorScore,
  calculateDomainScore,
  reconcileDataWithDomains,
  resolveIndicatorData,
  getIndicatorConfidenceWeight,
  adjustScoreForConfidence,
  calculateWeightedOverallScore,
  SCORING_ENGINE_VERSION,
  computeBenchmarkSnapshotId,
  deepClone,
} from "./grme-data";
import * as api from "./grme-api";
import { supabase, hasSupabaseConfig, isStrictFreeTierMode } from "./supabase";
import { DataEntryWindowConfig, GrmeUser, canAccessDzongkhag, canAccessIndicator, canEnterDataDuringWindow, getAccessibleDzongkhags } from "./grme-user";

const STORAGE_KEY = "grme-data";
const MIGRATION_SENTINEL_KEY = "grme-migration-v1";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Backfill scoring metadata on legacy years ──────────────────

function backfillScoringMetadata(
  data: Record<string, CityData>,
  domains: Domain[]
): Record<string, CityData> {
  if (typeof window !== "undefined" && localStorage.getItem(MIGRATION_SENTINEL_KEY)) {
    return data;
  }

  let changed = false;
  const snapshotId = computeBenchmarkSnapshotId(domains);
  const next: Record<string, CityData> = {};

  for (const [cityId, city] of Object.entries(data)) {
    const nextAssessments: Record<number, AssessmentYear> = {};
    for (const [yearKey, assess] of Object.entries(city.assessments)) {
      if (assess.scoringMetadata) {
        nextAssessments[Number(yearKey)] = assess;
        continue;
      }
      changed = true;
      nextAssessments[Number(yearKey)] = {
        ...assess,
        scoringMetadata: {
          engineVersion: SCORING_ENGINE_VERSION,
          benchmarkSnapshotId: snapshotId,
          calculatedAt: new Date().toISOString(),
        },
      };
    }
    next[cityId] = { ...city, assessments: nextAssessments };
  }

  if (changed && typeof window !== "undefined") {
    localStorage.setItem(MIGRATION_SENTINEL_KEY, "done");
  }

  return changed ? next : data;
}

// ── Migration from old format ──────────────────────────────────

function migrateOldFormat(raw: Record<string, unknown>): Record<string, CityData> {
  const result: Record<string, CityData> = {};
  const currentYear = new Date().getFullYear();

  for (const [cityId, value] of Object.entries(raw)) {
    const oldData = value as Record<string, unknown>;

    if (isRecord(oldData.indicators) && !isRecord(oldData.assessments)) {
      result[cityId] = {
        cityId: typeof oldData.cityId === "string" ? oldData.cityId : cityId,
        cityName: typeof oldData.cityName === "string" ? oldData.cityName : cityId,
        assessments: {
          [typeof oldData.year === "number" ? oldData.year : currentYear]: {
            year: typeof oldData.year === "number" ? oldData.year : currentYear,
            indicators: oldData.indicators as Record<string, IndicatorData>,
            auditLog: Array.isArray(oldData.auditLog) ? (oldData.auditLog as AuditLog[]) : [],
            createdAt: typeof oldData.lastUpdated === "string" ? oldData.lastUpdated : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        thromdeAssessments: {},
      };
    } else if (isRecord(oldData.assessments)) {
      const sanitized = sanitizeCityData(oldData, cityId);
      if (sanitized) {
        result[cityId] = sanitized;
      }
    } else {
      result[cityId] = {
        cityId,
        cityName: cityId,
        assessments: {},
        thromdeAssessments: {},
      };
    }
  }
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeAssessmentYear(value: unknown, year: number): AssessmentYear | null {
  if (!isRecord(value) || !isRecord(value.indicators) || !Array.isArray(value.auditLog)) {
    return null;
  }

  return {
    year,
    indicators: value.indicators as Record<string, IndicatorData>,
    auditLog: value.auditLog as AuditLog[],
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
}

function sanitizeCityData(value: unknown, cityId: string): CityData | null {
  if (!isRecord(value) || !isRecord(value.assessments)) return null;

  const assessments: Record<number, AssessmentYear> = {};
  for (const [yearKey, assessValue] of Object.entries(value.assessments)) {
    const year = Number(yearKey);
    if (!Number.isFinite(year)) continue;
    const sanitized = sanitizeAssessmentYear(assessValue, year);
    if (sanitized) assessments[year] = sanitized;
  }

  const thromdeAssessments: Record<string, Record<number, AssessmentYear>> = {};
  if (isRecord(value.thromdeAssessments)) {
    for (const [thromdeId, yearsValue] of Object.entries(value.thromdeAssessments)) {
      if (!isRecord(yearsValue)) continue;
      const years: Record<number, AssessmentYear> = {};
      for (const [yearKey, assessValue] of Object.entries(yearsValue)) {
        const year = Number(yearKey);
        if (!Number.isFinite(year)) continue;
        const sanitized = sanitizeAssessmentYear(assessValue, year);
        if (sanitized) years[year] = { ...sanitized, thromdeId };
      }
      if (Object.keys(years).length > 0) thromdeAssessments[thromdeId] = years;
    }
  }

  return {
    cityId: typeof value.cityId === "string" ? value.cityId : cityId,
    cityName: typeof value.cityName === "string" ? value.cityName : cityId,
    assessments,
    thromdeAssessments,
  };
}

function loadAllData(): Record<string, CityData> {
  if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return {};
      const firstKey = Object.keys(parsed)[0];
      const firstEntry = firstKey ? parsed[firstKey] : undefined;
      if (firstKey && isRecord(firstEntry) && !isRecord(firstEntry.assessments)) {
        const migrated = migrateOldFormat(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      const sanitized: Record<string, CityData> = {};
    for (const [cityId, cityValue] of Object.entries(parsed)) {
      const city = sanitizeCityData(cityValue, cityId);
      if (city) sanitized[cityId] = city;
    }
    return sanitized;
  } catch {
    return {};
  }
}

function saveAllData(data: Record<string, CityData>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save GRME data:", e);
  }
}

// ── Offline mutation queue ─────────────────────────────────────

const QUEUE_KEY = "grme-pending-mutations";

interface PendingMutation {
  id: string;
  type: "saveIndicator" | "addAuditEntry" | "createYear" | "deleteYear";
  cityId: string;
  year: number;
  thromdeId?: string;
  actor?: string;
  indicatorId?: string;
  data?: IndicatorData;
  entry?: AuditEntry;
  indicators?: Record<string, IndicatorData>;
}

function isPendingMutation(v: unknown): v is PendingMutation {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return typeof m.cityId === "string" && typeof m.year === "number" && typeof m.type === "string";
}

function loadQueue(): PendingMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPendingMutation);
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingMutation[]): void {
  if (typeof window === "undefined") return;
  try {
    if (queue.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (e) {
    console.error("Failed to save offline queue:", e);
  }
}

function enqueueMutation(mutation: PendingMutation): void {
  const queue = loadQueue();

  if (mutation.type === "addAuditEntry") {
    queue.push(mutation);
    saveQueue(queue);
    return;
  }

  const key = `${mutation.type}:${mutation.cityId}:${mutation.thromdeId || "dz"}:${mutation.year}`;
  const idx = queue.findIndex((m) => {
    if (m.type !== mutation.type) return false;
    return `${m.type}:${m.cityId}:${m.thromdeId || "dz"}:${m.year}` === key;
  });

  if (idx >= 0) queue[idx] = mutation;
  else queue.push(mutation);
  saveQueue(queue);
}

/** Overlay pending mutation values onto server data for live display.
 *  This ensures offline edits still show in the UI before they're synced. */
function applyPendingMutationsToData(
  data: Record<string, CityData>
): Record<string, CityData> {
  const queue = loadQueue();
  const next: Record<string, CityData> = deepClone(data);

  for (const m of queue) {
    if (m.type === "saveIndicator" && m.data) {
      const city = next[m.cityId] = next[m.cityId] || {
        cityId: m.cityId, cityName: m.cityId, assessments: {}, thromdeAssessments: {},
      };
      const target = m.thromdeId
        ? ((city.thromdeAssessments ||= {})[m.thromdeId] ||= {})
        : city.assessments;
      const year = target[m.year] = target[m.year] || {
        year: m.year, indicators: {}, auditLog: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        thromdeId: m.thromdeId,
      };
      year.indicators[m.indicatorId!] = m.data;
    }
    if (m.type === "addAuditEntry" && m.entry) {
      const city = next[m.cityId] = next[m.cityId] || {
        cityId: m.cityId, cityName: m.cityId, assessments: {}, thromdeAssessments: {},
      };
      const target = m.thromdeId
        ? ((city.thromdeAssessments ||= {})[m.thromdeId] ||= {})
        : city.assessments;
      const year = target[m.year] = target[m.year] || {
        year: m.year, indicators: {}, auditLog: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        thromdeId: m.thromdeId,
      };
      const existing = year.auditLog.find((a) => a.indicatorId === m.indicatorId);
      if (existing) {
        existing.entries.push(m.entry);
      } else {
        year.auditLog.push({ indicatorId: m.indicatorId!, entries: [m.entry] });
      }
    }
    if (m.type === "createYear") {
      const city = next[m.cityId] = next[m.cityId] || {
        cityId: m.cityId, cityName: m.cityId, assessments: {}, thromdeAssessments: {},
      };
      const target = m.thromdeId
        ? ((city.thromdeAssessments ||= {})[m.thromdeId] ||= {})
        : city.assessments;
      if (!target[m.year]) {
        target[m.year] = {
          year: m.year, indicators: m.indicators || {}, auditLog: [],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), thromdeId: m.thromdeId,
        };
      }
    }
    if (m.type === "deleteYear") {
      const city = next[m.cityId];
      if (city) {
        if (m.thromdeId) {
          if (city.thromdeAssessments?.[m.thromdeId]) delete city.thromdeAssessments[m.thromdeId][m.year];
        } else {
          delete city.assessments[m.year];
        }
      }
    }
  }

  return next;
}

// deepClone imported from grme-data

/** Replay all pending offline mutations to Supabase. */
async function drainQueue(): Promise<number> {
  const queue = loadQueue();
  if (queue.length === 0) return 0;

  const stillPending: PendingMutation[] = [];
  for (const m of queue) {
    try {
      switch (m.type) {
        case "saveIndicator":
          if (m.data) await api.saveAssessment(m.cityId, m.year, m.indicatorId!, m.data, m.thromdeId, m.actor || m.data.updatedBy || "system");
          break;
        case "addAuditEntry":
          if (m.entry) await api.addAuditEntry(m.cityId, m.year, m.indicatorId!, m.entry);
          break;
        case "createYear":
          await api.saveAssessments(m.cityId, m.year, m.indicators || {}, m.thromdeId, m.actor || "system");
          break;
        case "deleteYear":
          await api.deleteYear(m.cityId, m.year, m.thromdeId);
          break;
      }
    } catch (err) {
      console.error(`drainQueue: mutation failed for ${m.cityId}/${m.year} type=${m.type}:`, err);
      stillPending.push(m);
    }
  }
  saveQueue(stillPending);
  return stillPending.length;
}

/** In a multi-stakeholder system the server is the source of truth.
 *  Local (cached) data never overrides remote data — only fills gaps
 *  when the server doesn't have a given city/year yet. */
function mergeAssessmentYear(
  remote: AssessmentYear | undefined,
  local: AssessmentYear | undefined
): AssessmentYear | undefined {
  if (!remote) return local;
  return remote;
}

function mergeCityData(remote: CityData, local: CityData): CityData {
  const assessments: Record<number, AssessmentYear> = { ...remote.assessments };
  const thromdeAssessments: Record<string, Record<number, AssessmentYear>> = {
    ...(remote.thromdeAssessments || {}),
  };

  for (const [yearKey, localAssessment] of Object.entries(local.assessments)) {
    const year = Number(yearKey);
    assessments[year] = mergeAssessmentYear(assessments[year], localAssessment) || localAssessment;
  }

  for (const [thromdeId, years] of Object.entries(local.thromdeAssessments || {})) {
    thromdeAssessments[thromdeId] = thromdeAssessments[thromdeId] || {};
    for (const [yearKey, localAssessment] of Object.entries(years)) {
      const year = Number(yearKey);
      thromdeAssessments[thromdeId][year] =
        mergeAssessmentYear(thromdeAssessments[thromdeId][year], localAssessment) || localAssessment;
    }
  }

  return {
    ...remote,
    cityId: local.cityId || remote.cityId,
    cityName: local.cityName || remote.cityName,
    assessments,
    thromdeAssessments,
  };
}

function mergeAuditLogsIntoData(
  data: Record<string, CityData>,
  auditLogs: Record<string, Record<number, AuditLog[]>>
): Record<string, CityData> {
  const next: Record<string, CityData> = {};
  for (const [cityId, city] of Object.entries(data)) {
    const nextAssessments: Record<number, AssessmentYear> = {};
    for (const [yearKey, assess] of Object.entries(city.assessments)) {
      const year = Number(yearKey);
      let merged = assess;
      const remoteLogs = auditLogs[cityId]?.[year];
      if (remoteLogs && remoteLogs.length > 0) {
        const existingIds = new Set<string>();
        for (const log of assess.auditLog) {
          for (const e of log.entries) existingIds.add(e.id);
        }
        const mergedLogs = [...assess.auditLog];
        for (const remoteLog of remoteLogs) {
          const unseen = remoteLog.entries.filter((e) => !existingIds.has(e.id));
          if (unseen.length === 0) continue;
          const existing = mergedLogs.find(
            (l) => l.indicatorId === remoteLog.indicatorId
          );
          if (existing) {
            existing.entries.push(...unseen);
          } else {
            mergedLogs.push({ ...remoteLog, entries: unseen });
          }
        }
        merged = { ...assess, auditLog: mergedLogs };
      }
      nextAssessments[year] = merged;
    }
    const nextThromdeAssessments: Record<string, Record<number, AssessmentYear>> = {};
    for (const [thromdeId, years] of Object.entries(city.thromdeAssessments || {})) {
      nextThromdeAssessments[thromdeId] = {};
      for (const [yearKey, assess] of Object.entries(years)) {
        const year = Number(yearKey);
        let merged = assess;
        const remoteLogs = auditLogs[cityId]?.[year];
        if (remoteLogs && remoteLogs.length > 0) {
          const existingIds = new Set<string>();
          for (const log of assess.auditLog) {
            for (const e of log.entries) existingIds.add(e.id);
          }
          const mergedLogs = [...assess.auditLog];
          for (const remoteLog of remoteLogs) {
            const unseen = remoteLog.entries.filter((e) => !existingIds.has(e.id));
            if (unseen.length === 0) continue;
            const existing = mergedLogs.find((l) => l.indicatorId === remoteLog.indicatorId);
            if (existing) existing.entries.push(...unseen);
            else mergedLogs.push({ ...remoteLog, entries: unseen });
          }
          merged = { ...assess, auditLog: mergedLogs };
        }
        nextThromdeAssessments[thromdeId][year] = merged;
      }
    }
    next[cityId] = { ...city, assessments: nextAssessments, thromdeAssessments: nextThromdeAssessments };
  }
  return next;
}

function mergeDataSources(
  remoteData: Record<string, CityData>,
  localData: Record<string, CityData>
): Record<string, CityData> {
  const merged: Record<string, CityData> = { ...remoteData };

  for (const [cityId, localCity] of Object.entries(localData)) {
    if (!localCity || !isRecord(localCity) || !isRecord(localCity.assessments)) {
      continue;
    }
    merged[cityId] = merged[cityId]
      ? mergeCityData(merged[cityId], localCity)
      : localCity;
  }

  return merged;
}

function findIndicatorInDomains(
  domains: Domain[],
  indicatorId: string
) {
  for (const domain of domains) {
    for (const sub of domain.subdomains) {
      const ind = sub.indicators.find(
        (i) => i.id === indicatorId || (i.aliases || []).includes(indicatorId)
      );
      if (ind) return ind;
    }
  }
  return null;
}

function getOrCreateAssessment(
  city: CityData,
  year: number
): AssessmentYear {
  if (city.assessments[year]) return city.assessments[year];
  return {
    year,
    indicators: {},
    auditLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getOrCreateScopedAssessment(
  city: CityData,
  year: number,
  thromdeId?: string
): AssessmentYear {
  if (!thromdeId) return getOrCreateAssessment(city, year);

  city.thromdeAssessments = city.thromdeAssessments || {};
  city.thromdeAssessments[thromdeId] = city.thromdeAssessments[thromdeId] || {};
  if (city.thromdeAssessments[thromdeId][year]) return city.thromdeAssessments[thromdeId][year];

  const assessment = {
    year,
    indicators: {},
    auditLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thromdeId,
  };
  city.thromdeAssessments[thromdeId][year] = assessment;
  return assessment;
}

function getAvailableYears(city: CityData): number[] {
  return Object.keys(city.assessments)
    .map(Number)
    .sort((a, b) => b - a);
}

function getAvailableThromdeYears(city: CityData, thromdeId: string): number[] {
  const years = city.thromdeAssessments?.[thromdeId] || {};
  return Object.keys(years).map(Number).sort((a, b) => b - a);
}

// ── Hook ───────────────────────────────────────────────────────

export function useGRMEData(
  domains: Domain[],
  userName?: string,
  selectedYear?: number,
  user?: GrmeUser
) {
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueFlushPromiseRef = useRef<Promise<void> | null>(null);
  const queueFlushResolveRef = useRef<(() => void) | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const lastAuditCityRef = useRef<string | null>(null);
  const lastAutoRefreshAtRef = useRef<number>(0);

  const [allData, setAllData] = useState<Record<string, CityData>>({});
  const [selectedCity, setSelectedCity] = useState<string>("thimphu");
  const [selectedThromdeId, setSelectedThromdeId] = useState<string>("");
  const [thromdes, setThromdes] = useState<Thromde[]>([]);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);
  const [adminEvents, setAdminEvents] = useState<AuditLog[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [dataEntryWindow, setDataEntryWindow] = useState<DataEntryWindowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const domainsRef = useRef(domains);
  const currentUser = userName || "Stakeholder";
  const currentYear = selectedYear || new Date().getFullYear();
  const accessibleCityIds = useMemo(() => {
    if (!user || user.role === "admin") return new Set(CITIES.map((c) => c.id));
    return new Set(getAccessibleDzongkhags(user).map((c) => c.id));
  }, [user]);
  const activeCityId = useMemo(() => {
    if (accessibleCityIds.size === 0) return selectedCity;
    return accessibleCityIds.has(selectedCity) ? selectedCity : [...accessibleCityIds][0] || selectedCity;
  }, [accessibleCityIds, selectedCity]);

  useEffect(() => {
    domainsRef.current = domains;
  }, [domains]);

  const scheduleQueueFlush = useCallback(async () => {
    if (!hasSupabaseConfig || !apiAvailable) return;

    if (!queueFlushPromiseRef.current) {
      queueFlushPromiseRef.current = new Promise<void>((resolve) => {
        queueFlushResolveRef.current = resolve;
      });
    }

    if (queueFlushTimerRef.current) clearTimeout(queueFlushTimerRef.current);
    queueFlushTimerRef.current = setTimeout(async () => {
      try {
        const pending = await drainQueue();
        setSyncError(pending > 0 ? `${pending} change${pending === 1 ? "" : "s"} still waiting to sync.` : null);
      } finally {
        const resolve = queueFlushResolveRef.current;
        queueFlushResolveRef.current = null;
        queueFlushPromiseRef.current = null;
        queueFlushTimerRef.current = null;
        resolve?.();
      }
    }, 900);

    return queueFlushPromiseRef.current;
  }, [apiAvailable]);

  // ── Debounced refresh data from Supabase ───────────────────────
  // Prevents cascading refreshes when multiple mutations fire rapidly.

  const refreshData = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const run = (async () => {
    if (!hasSupabaseConfig) {
      const localData = backfillScoringMetadata(loadAllData(), domainsRef.current);
      saveAllData(localData);
      setAllData(localData);
      setThromdes([]);
      setApiAvailable(false);
      setSyncError(null);
      setDataEntryWindow(null);
      lastAutoRefreshAtRef.current = Date.now();
      return;
    }
    try {
      const apiData = await api.loadAssessments(activeCityId);
      const apiThromdes = await api.loadThromdes().catch(() => []);
      const windowConfig = await api.loadDataEntryWindowConfig().catch(() => null);
      const reconciled = reconcileDataWithDomains(apiData, domainsRef.current);
      const localData = loadAllData();
      // Server is source of truth; local fills gaps (cities/years not in Supabase)
      let merged = backfillScoringMetadata(mergeDataSources(reconciled, localData), domainsRef.current);

      const auditLogs = await api.loadAuditLogsForAssessment(activeCityId);
      merged = mergeAuditLogsIntoData(merged, auditLogs);

      if (user?.role === "admin") {
        setAdminEvents(await api.loadAdminEvents());
      }

      // Overlay pending offline mutations so they still display before syncing
      merged = applyPendingMutationsToData(merged);

      setAllData(merged);
      setThromdes(apiThromdes);
      setDataEntryWindow(windowConfig);
      saveAllData(merged);
      setApiAvailable(true);
      lastAutoRefreshAtRef.current = Date.now();
      const pending = await drainQueue();
      setSyncError(pending > 0 ? `${pending} change${pending === 1 ? "" : "s"} still waiting to sync.` : null);
    } catch {
      setThromdes([]);
      setApiAvailable(false);
      setDataEntryWindow(null);
      setSyncError("Unable to sync with the server right now. Changes remain saved locally.");
    }
    })();

    refreshPromiseRef.current = run.finally(() => {
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  }, [activeCityId]);

  const debouncedRefresh = useCallback(() => {
    if (Date.now() - lastAutoRefreshAtRef.current < 30000) return;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      refreshData();
    }, 300);
  }, [refreshData]);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (queueFlushTimerRef.current) clearTimeout(queueFlushTimerRef.current);
    };
  }, []);

  // Load on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!hasSupabaseConfig) {
        if (!cancelled) {
          const localData = backfillScoringMetadata(loadAllData(), domainsRef.current);
          saveAllData(localData);
          setAllData(localData);
          setThromdes([]);
          setApiAvailable(false);
          setAdminEvents([]);
          setSyncError(null);
          setDataEntryWindow(null);
          setLoading(false);
        }
        return;
      }
      try {
        const apiData = await api.loadAssessments(activeCityId);
        const apiThromdes = await api.loadThromdes().catch(() => []);
        const windowConfig = await api.loadDataEntryWindowConfig().catch(() => null);
        if (!cancelled) {
          const reconciled = reconcileDataWithDomains(apiData, domainsRef.current);
          const localData = loadAllData();
          let merged = backfillScoringMetadata(mergeDataSources(reconciled, localData), domainsRef.current);

          const auditLogs = await api.loadAuditLogsForAssessment(activeCityId);
          merged = mergeAuditLogsIntoData(merged, auditLogs);

          if (user?.role === "admin") {
            setAdminEvents(await api.loadAdminEvents());
          }

          merged = applyPendingMutationsToData(merged);

          setAllData(merged);
          setThromdes(apiThromdes);
          setDataEntryWindow(windowConfig);
          saveAllData(merged);
          setApiAvailable(true);
          setLoading(false);
          const pending = await drainQueue();
          setSyncError(pending > 0 ? `${pending} change${pending === 1 ? "" : "s"} still waiting to sync.` : null);
        }
      } catch {
        if (!cancelled) {
          const localData = backfillScoringMetadata(loadAllData(), domainsRef.current);
          const withPending = applyPendingMutationsToData(localData);
          saveAllData(withPending);
          setAllData(withPending);
          setThromdes([]);
          setApiAvailable(false);
          setAdminEvents([]);
          setSyncError("Unable to sync with the server right now. Changes remain saved locally.");
          setDataEntryWindow(null);
          setLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!apiAvailable) return;
    if (lastAuditCityRef.current === null) {
      lastAuditCityRef.current = activeCityId;
      return;
    }
    if (lastAuditCityRef.current === activeCityId) return;
    lastAuditCityRef.current = activeCityId;
    debouncedRefresh();
  }, [activeCityId, apiAvailable, debouncedRefresh]);

  useEffect(() => {
    setAllData((prev) => {
      const reconciled = reconcileDataWithDomains(prev, domainsRef.current);
      saveAllData(reconciled);
      return reconciled;
    });
  }, [domains]);

  // Real-time subscription — auto-refresh when data changes in Supabase
  useEffect(() => {
    if (!hasSupabaseConfig || isStrictFreeTierMode) return;
    const channel = supabase()
      .channel("assessment-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assessment_data" },
        () => {
          debouncedRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, [debouncedRefresh]);

  // Refresh when window gets focus (catches any missed changes)
  useEffect(() => {
    if (isStrictFreeTierMode) return;
    const handleFocus = () => debouncedRefresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [debouncedRefresh]);

  const ensureCity = useCallback(
    (cityId: string): CityData => {
      if (allData[cityId]) return allData[cityId];
      return {
        cityId,
        cityName: cityId,
        assessments: {},
        thromdeAssessments: {},
      };
    },
    [allData]
  );

  const visibleAllData = useMemo(() => {
    if (!user || user.role === "admin") return allData;
    const next: Record<string, CityData> = {};
    for (const cityId of accessibleCityIds) {
      if (allData[cityId]) next[cityId] = allData[cityId];
    }
    return next;
  }, [allData, accessibleCityIds, user]);

  const visibleCityData = useMemo(
    () =>
      visibleAllData[activeCityId] || {
        cityId: activeCityId,
        cityName: activeCityId,
        assessments: {},
        thromdeAssessments: {},
      },
    [activeCityId, visibleAllData]
  );
  const availableThromdes = useMemo(
    () => thromdes.filter((t) => t.dzongkhagId === activeCityId),
    [thromdes, activeCityId]
  );
  const validSelectedThromdeId = useMemo(
    () => (availableThromdes.some((t) => t.id === selectedThromdeId) ? selectedThromdeId : ""),
    [availableThromdes, selectedThromdeId]
  );
  const selectedThromde = useMemo(
    () => availableThromdes.find((t) => t.id === validSelectedThromdeId) || null,
    [availableThromdes, validSelectedThromdeId]
  );
  const assessment = useMemo(() => {
    if (selectedThromde) {
      return (
        visibleCityData.thromdeAssessments?.[selectedThromde.id]?.[currentYear] || {
          year: currentYear,
          indicators: {},
          auditLog: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          thromdeId: selectedThromde.id,
        }
      );
    }
    return visibleCityData.assessments[currentYear] || getOrCreateAssessment(visibleCityData, currentYear);
  }, [currentYear, selectedThromde, visibleCityData]);
  const availableYears = selectedThromde
    ? getAvailableThromdeYears(visibleCityData, selectedThromde.id)
    : getAvailableYears(visibleCityData);
  const scopedCityData = selectedThromde
    ? {
        ...visibleCityData,
        assessments: visibleCityData.thromdeAssessments?.[selectedThromde.id] || {},
      }
    : visibleCityData;

  // ── Create new year ────────────────────────────────────────

  const createYear = useCallback(
    async (year: number, copyFrom?: number) => {
      if (user && (!canEnterDataDuringWindow(user, dataEntryWindow) || !canAccessDzongkhag(user, activeCityId))) return;
      let indicators: Record<string, IndicatorData> = {};
      let auditLog: AuditLog[] = [];

      const city = ensureCity(activeCityId);
      const copySource = selectedThromde
        ? city.thromdeAssessments?.[selectedThromde.id]?.[copyFrom || 0]
        : city.assessments[copyFrom || 0];
      if (copyFrom && copySource) {
        indicators = JSON.parse(
          JSON.stringify(copySource.indicators)
        );
        auditLog = [];
      }

      const newAssessment: AssessmentYear = {
        year,
        indicators,
        auditLog,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thromdeId: selectedThromde?.id,
        scoringMetadata: {
          engineVersion: SCORING_ENGINE_VERSION,
          benchmarkSnapshotId: computeBenchmarkSnapshotId(domainsRef.current),
          calculatedAt: new Date().toISOString(),
        },
      };

      const updatedCity: CityData = {
        ...city,
        assessments: {
          ...city.assessments,
        },
        thromdeAssessments: { ...(city.thromdeAssessments || {}) },
      };

      if (selectedThromde) {
        updatedCity.thromdeAssessments![selectedThromde.id] = {
          ...(updatedCity.thromdeAssessments![selectedThromde.id] || {}),
          [year]: newAssessment,
        };
      } else {
        updatedCity.assessments = {
          ...city.assessments,
          [year]: newAssessment,
        };
      }

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [activeCityId]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      enqueueMutation({
        id: generateId(),
        type: "createYear",
        cityId: activeCityId,
        year,
        thromdeId: selectedThromde?.id,
        actor: currentUser,
        indicators,
      });
      if (apiAvailable) {
        await scheduleQueueFlush();
      }
    },
    [activeCityId, dataEntryWindow, ensureCity, apiAvailable, user, selectedThromde, scheduleQueueFlush]
  );

  // ── Delete year ────────────────────────────────────────────

  const deleteYear = useCallback(
    async (year: number) => {
      if (user && (!canEnterDataDuringWindow(user, dataEntryWindow) || !canAccessDzongkhag(user, activeCityId))) return;
      const city = ensureCity(activeCityId);
      const newAssessments = { ...city.assessments };
      const nextThromdeAssessments = { ...(city.thromdeAssessments || {}) };
      if (selectedThromde) {
        const scoped = { ...(nextThromdeAssessments[selectedThromde.id] || {}) };
        delete scoped[year];
        nextThromdeAssessments[selectedThromde.id] = scoped;
      } else {
        delete newAssessments[year];
      }

      const updatedCity: CityData = {
        ...city,
        assessments: newAssessments,
        thromdeAssessments: nextThromdeAssessments,
      };

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [activeCityId]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      enqueueMutation({
        id: generateId(),
        type: "deleteYear",
        cityId: activeCityId,
        year,
        thromdeId: selectedThromde?.id,
        actor: currentUser,
      });
      if (apiAvailable) {
        await scheduleQueueFlush();
      }
    },
    [activeCityId, dataEntryWindow, ensureCity, apiAvailable, user, selectedThromde, scheduleQueueFlush]
  );

  // ── Update indicator ───────────────────────────────────────

  const updateIndicator = useCallback(
    async (indicatorId: string, value: number | string | boolean, notes?: string) => {
      if (user && (!canEnterDataDuringWindow(user, dataEntryWindow) || !canAccessDzongkhag(user, activeCityId))) return;
      const indicator = findIndicatorInDomains(domainsRef.current, indicatorId);
      if (user && indicator && !canAccessIndicator(user, indicator)) return;
      const city = ensureCity(activeCityId);
      const assess = getOrCreateScopedAssessment(city, currentYear, selectedThromde?.id);
      const existing = assess.indicators[indicatorId];
      const newValue = String(value);

      const auditEntry: AuditEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: existing ? "update" : "create",
        field: "value",
        oldValue:
          existing?.value !== undefined
            ? String(existing.value)
            : undefined,
        newValue,
        notes,
      };

      const indicatorData: IndicatorData = {
        indicatorId,
        value,
        notes,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser,
      };

      const existingAudit = assess.auditLog.find(
        (a) => a.indicatorId === indicatorId
      );

      let newAuditLog: AuditLog[];
      if (existingAudit) {
        newAuditLog = assess.auditLog.map((a) =>
          a.indicatorId === indicatorId
            ? { ...a, entries: [...a.entries, auditEntry] }
            : a
        );
      } else {
        newAuditLog = [
          ...assess.auditLog,
          { indicatorId, entries: [auditEntry] },
        ];
      }

      const updatedAssessment: AssessmentYear = {
        ...assess,
        indicators: {
          ...assess.indicators,
          [indicatorId]: indicatorData,
        },
        auditLog: newAuditLog,
        updatedAt: new Date().toISOString(),
        scoringMetadata: assess.scoringMetadata || {
          engineVersion: SCORING_ENGINE_VERSION,
          benchmarkSnapshotId: computeBenchmarkSnapshotId(domainsRef.current),
          calculatedAt: new Date().toISOString(),
        },
      };

      const updatedCity: CityData = {
        ...city,
        assessments: {
          ...city.assessments,
        },
        thromdeAssessments: { ...(city.thromdeAssessments || {}) },
      };

      if (selectedThromde) {
        updatedCity.thromdeAssessments![selectedThromde.id] = {
          ...(updatedCity.thromdeAssessments![selectedThromde.id] || {}),
          [currentYear]: { ...updatedAssessment, thromdeId: selectedThromde.id },
        };
      } else {
        updatedCity.assessments = {
          ...city.assessments,
          [currentYear]: updatedAssessment,
        };
      }

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [activeCityId]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      enqueueMutation({
        id: generateId(),
        type: "saveIndicator",
        cityId: activeCityId,
        year: currentYear,
        thromdeId: selectedThromde?.id,
        indicatorId,
        data: indicatorData,
      });
      enqueueMutation({
        id: generateId(),
        type: "addAuditEntry",
        cityId: activeCityId,
        year: currentYear,
        thromdeId: selectedThromde?.id,
        indicatorId,
        entry: auditEntry,
      });
      if (apiAvailable) {
        await scheduleQueueFlush();
      }
    },
    [activeCityId, currentYear, currentUser, dataEntryWindow, ensureCity, apiAvailable, user, selectedThromde, scheduleQueueFlush]
  );

  // ── Add audit note ─────────────────────────────────────────

  const addAuditNote = useCallback(
    async (indicatorId: string, note: string) => {
      if (user && (!canEnterDataDuringWindow(user, dataEntryWindow) || !canAccessDzongkhag(user, activeCityId))) return;
      const indicator = findIndicatorInDomains(domainsRef.current, indicatorId);
      if (user && indicator && !canAccessIndicator(user, indicator)) return;
      const city = ensureCity(activeCityId);
      const assess = getOrCreateScopedAssessment(city, currentYear, selectedThromde?.id);

      const auditEntry: AuditEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: "review",
        field: "notes",
        newValue: note,
      };

      const existingAudit = assess.auditLog.find(
        (a) => a.indicatorId === indicatorId
      );

      let newAuditLog: AuditLog[];
      if (existingAudit) {
        newAuditLog = assess.auditLog.map((a) =>
          a.indicatorId === indicatorId
            ? { ...a, entries: [...a.entries, auditEntry] }
            : a
        );
      } else {
        newAuditLog = [
          ...assess.auditLog,
          { indicatorId, entries: [auditEntry] },
        ];
      }

      const updatedAssessment: AssessmentYear = {
        ...assess,
        auditLog: newAuditLog,
        updatedAt: new Date().toISOString(),
        scoringMetadata: assess.scoringMetadata || {
          engineVersion: SCORING_ENGINE_VERSION,
          benchmarkSnapshotId: computeBenchmarkSnapshotId(domainsRef.current),
          calculatedAt: new Date().toISOString(),
        },
      };

      const updatedCity: CityData = {
        ...city,
        assessments: {
          ...city.assessments,
        },
        thromdeAssessments: { ...(city.thromdeAssessments || {}) },
      };

      if (selectedThromde) {
        updatedCity.thromdeAssessments![selectedThromde.id] = {
          ...(updatedCity.thromdeAssessments![selectedThromde.id] || {}),
          [currentYear]: { ...updatedAssessment, thromdeId: selectedThromde.id },
        };
      } else {
        updatedCity.assessments = {
          ...city.assessments,
          [currentYear]: updatedAssessment,
        };
      }

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [activeCityId]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      enqueueMutation({
        id: generateId(),
        type: "addAuditEntry",
        cityId: activeCityId,
        year: currentYear,
        thromdeId: selectedThromde?.id,
        indicatorId,
        entry: auditEntry,
      });
      if (apiAvailable) {
        await scheduleQueueFlush();
      }
    },
    [activeCityId, currentYear, currentUser, dataEntryWindow, ensureCity, apiAvailable, user, selectedThromde, scheduleQueueFlush]
  );

  // ── Scoring ────────────────────────────────────────────────

  const getIndicatorScore = useCallback(
    (indicatorId: string): number | null => {
      const indicator = findIndicatorInDomains(
        domainsRef.current,
        indicatorId
      );
      if (!indicator) return null;
      const data = resolveIndicatorData(assessment, indicator);
      if (!data || data.value === null || data.value === undefined) return null;
      if (typeof data.value === "string") return null;
      return calculateIndicatorScore(data.value as number | boolean, indicator);
    },
    [assessment]
  );

  const getAssessmentStats = useCallback(
    (assess: AssessmentYear | undefined): {
      total: number;
      filled: number;
      missing: number;
      percentage: number;
      confidence: number;
    } => {
      const total = domainsRef.current.reduce(
        (sum, d) =>
          sum +
          d.subdomains.reduce((s, sub) => s + sub.indicators.length, 0),
        0
      );

      if (!assess) {
        return { total, filled: 0, missing: total, percentage: 0, confidence: 0 };
      }

      let totalWeight = 0;
      let filledWeight = 0;

      for (const domain of domainsRef.current) {
        for (const sub of domain.subdomains) {
          for (const indicator of sub.indicators) {
            const weight = getIndicatorConfidenceWeight(indicator) * (sub.weight ?? 1);
            totalWeight += weight;
            const data = resolveIndicatorData(assess, indicator);
            if (data && data.value !== null && data.value !== undefined) {
              filledWeight += weight;
            }
          }
        }
      }

      const filled = domainsRef.current.reduce((count, domain) => {
        return (
          count +
          domain.subdomains.reduce((subCount, sub) => {
            return (
              subCount +
              sub.indicators.filter((indicator) => {
                const data = resolveIndicatorData(assess, indicator);
                return data !== null && data.value !== null && data.value !== undefined;
              }).length
            );
          }, 0)
        );
      }, 0);
      const confidence = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;
      const missing = Math.max(total - filled, 0);

      return {
        total,
        filled,
        missing,
        percentage: confidence,
        confidence,
      };
    },
    []
  );

  const getDomainStatsForAssessment = useCallback(
    (domain: Domain, assess: AssessmentYear | undefined): { confidence: number } => {
      if (!assess) return { confidence: 0 };
      let totalWeight = 0;
      let filledWeight = 0;
      for (const sub of domain.subdomains) {
        for (const indicator of sub.indicators) {
          const weight = getIndicatorConfidenceWeight(indicator) * (sub.weight ?? 1);
          totalWeight += weight;
          const data = resolveIndicatorData(assess, indicator);
          if (data && data.value !== null && data.value !== undefined) {
            filledWeight += weight;
          }
        }
      }
      return { confidence: totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0 };
    },
    []
  );

  const getDomainScore = useCallback(
    (domainId: string): number => {
      const domain = domainsRef.current.find((d) => d.id === domainId);
      if (!domain) return 50;
      const raw = calculateDomainScore(domain, getIndicatorScore);
      const confidence = getDomainStatsForAssessment(domain, assessment).confidence;
      return adjustScoreForConfidence(raw, confidence);
    },
    [assessment, getDomainStatsForAssessment, getIndicatorScore]
  );

  const getOverallScore = useCallback((): number => {
    const raw = calculateWeightedOverallScore(domainsRef.current, (id) => {
      const domain = domainsRef.current.find((d) => d.id === id);
      if (!domain) return 50;
      return calculateDomainScore(domain, getIndicatorScore);
    });
    const confidence = getAssessmentStats(assessment).confidence;
    return adjustScoreForConfidence(raw, confidence);
  }, [assessment, getAssessmentStats, getIndicatorScore]);

  const getDataEntryStats = useCallback((): {
    total: number;
    filled: number;
    missing: number;
    percentage: number;
    confidence: number;
  } => {
    const total = domainsRef.current.reduce(
      (sum, d) =>
        sum +
        d.subdomains.reduce((s, sub) => s + sub.indicators.length, 0),
      0
    );
    const filled = Object.keys(assessment.indicators).length;
    const missing = Math.max(total - filled, 0);
    const confidence = total > 0 ? Math.round((filled / total) * 100) : 0;
    return {
      total,
      filled,
      missing,
      percentage: confidence,
      confidence,
    };
  }, [assessment]);

  const getDataEntryStatsForYear = useCallback(
    (year: number): {
      total: number;
      filled: number;
      missing: number;
      percentage: number;
      confidence: number;
    } => {
      const city = ensureCity(activeCityId);
      const assess = selectedThromde
        ? city.thromdeAssessments?.[selectedThromde.id]?.[year]
        : city.assessments[year];
      return getAssessmentStats(assess);
    },
    [ensureCity, getAssessmentStats, activeCityId, selectedThromde]
  );

  const getScoreForYear = useCallback(
    (year: number): number => {
      const city = ensureCity(activeCityId);
      const assess = selectedThromde
        ? city.thromdeAssessments?.[selectedThromde.id]?.[year]
        : city.assessments[year];
      if (!assess) return 0;

      const getScoreForIndicator = (indicatorId: string): number | null => {
        const indicator = findIndicatorInDomains(
          domainsRef.current,
          indicatorId
        );
        if (!indicator) return null;
        const data = resolveIndicatorData(assess, indicator);
        if (!data || data.value === null || data.value === undefined) return null;
        if (typeof data.value === "string") return null;
        return calculateIndicatorScore(data.value as number | boolean, indicator);
      };

      const raw = calculateWeightedOverallScore(domainsRef.current, (id) => {
        const domain = domainsRef.current.find((d) => d.id === id);
        if (!domain) return 50;
        return calculateDomainScore(domain, getScoreForIndicator);
      });
      const confidence = getAssessmentStats(assess).confidence;
      return adjustScoreForConfidence(raw, confidence);
    },
    [ensureCity, getAssessmentStats, activeCityId, selectedThromde]
  );

  const getDomainScoreForYear = useCallback(
    (domainId: string, year: number): number => {
      const city = ensureCity(activeCityId);
      const assess = selectedThromde
        ? city.thromdeAssessments?.[selectedThromde.id]?.[year]
        : city.assessments[year];
      if (!assess) return 50;

      const domain = domainsRef.current.find((d) => d.id === domainId);
      if (!domain) return 50;

      const getScoreForIndicator = (indicatorId: string): number | null => {
        const indicator = findIndicatorInDomains(
          domainsRef.current,
          indicatorId
        );
        if (!indicator) return null;
        const data = resolveIndicatorData(assess, indicator);
        if (!data || data.value === null || data.value === undefined) return null;
        if (typeof data.value === "string") return null;
        return calculateIndicatorScore(data.value as number | boolean, indicator);
      };

      const raw = calculateDomainScore(domain, getScoreForIndicator);
      const confidence = getDomainStatsForAssessment(domain, assess).confidence;
      return adjustScoreForConfidence(raw, confidence);
    },
    [ensureCity, getDomainStatsForAssessment, activeCityId, selectedThromde]
  );

  return {
    allData: visibleAllData,
    cityData: scopedCityData,
    assessment,
    selectedCity: activeCityId,
    setSelectedCity,
    selectedThromdeId: validSelectedThromdeId,
    setSelectedThromdeId,
    availableThromdes,
    selectedThromde,
    selectedYear: currentYear,
    availableYears,
    createYear,
    deleteYear,
    updateIndicator,
    addAuditNote,
    getIndicatorScore,
    getDomainScore,
    getDomainStatsForAssessment,
    getOverallScore,
    getDataEntryStats,
    getDataEntryStatsForYear,
    getScoreForYear,
    getDomainScoreForYear,
    apiAvailable,
    adminEvents,
    syncError,
    dataEntryWindow,
    loading,
    refreshData: debouncedRefresh,
  };
}
