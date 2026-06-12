"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Domain,
  CityData,
  AssessmentYear,
  IndicatorData,
  AuditEntry,
  AuditLog,
  calculateIndicatorScore,
  calculateDomainScore,
  reconcileDataWithDomains,
  resolveIndicatorData,
  getIndicatorConfidenceWeight,
  adjustScoreForConfidence,
  calculateWeightedOverallScore,
} from "./grme-data";
import * as api from "./grme-api";
import { supabase, hasSupabaseConfig } from "./supabase";

const STORAGE_KEY = "grme-data";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── Migration from old format ──────────────────────────────────

function migrateOldFormat(
  raw: Record<string, any>
): Record<string, CityData> {
  const result: Record<string, CityData> = {};
  const currentYear = new Date().getFullYear();

  for (const [cityId, oldData] of Object.entries(raw)) {
    if (oldData.indicators && !oldData.assessments) {
      result[cityId] = {
        cityId: oldData.cityId || cityId,
        cityName: oldData.cityName || cityId,
        assessments: {
          [oldData.year || currentYear]: {
            year: oldData.year || currentYear,
            indicators: oldData.indicators || {},
            auditLog: oldData.auditLog || [],
            createdAt: oldData.lastUpdated || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    } else if (oldData.assessments) {
      result[cityId] = oldData;
    } else {
      result[cityId] = {
        cityId,
        cityName: cityId,
        assessments: {},
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

  return {
    cityId: typeof value.cityId === "string" ? value.cityId : cityId,
    cityName: typeof value.cityName === "string" ? value.cityName : cityId,
    assessments,
  };
}

function loadAllData(): Record<string, CityData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const firstKey = Object.keys(parsed)[0];
    if (firstKey && parsed[firstKey] && !parsed[firstKey].assessments) {
      const migrated = migrateOldFormat(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    if (!isRecord(parsed)) return {};
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

function mergeAssessmentYear(
  remote: AssessmentYear | undefined,
  local: AssessmentYear | undefined
): AssessmentYear | undefined {
  if (!remote) return local;
  if (!local) return remote;

  const remoteTs = remote.updatedAt || remote.createdAt || "";
  const localTs = local.updatedAt || local.createdAt || "";
  return localTs >= remoteTs ? local : remote;
}

function mergeCityData(remote: CityData, local: CityData): CityData {
  const assessments: Record<number, AssessmentYear> = { ...remote.assessments };

  for (const [yearKey, localAssessment] of Object.entries(local.assessments)) {
    const year = Number(yearKey);
    assessments[year] = mergeAssessmentYear(assessments[year], localAssessment) || localAssessment;
  }

  return {
    ...remote,
    cityId: local.cityId || remote.cityId,
    cityName: local.cityName || remote.cityName,
    assessments,
  };
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

function getAvailableYears(city: CityData): number[] {
  return Object.keys(city.assessments)
    .map(Number)
    .sort((a, b) => b - a);
}

// ── Hook ───────────────────────────────────────────────────────

export function useGRMEData(
  domains: Domain[],
  userName?: string,
  selectedYear?: number
) {
  const [allData, setAllData] = useState<Record<string, CityData>>({});
  const [selectedCity, setSelectedCity] = useState<string>("thimphu");
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);
  const domainsRef = useRef(domains);
  domainsRef.current = domains;
  const currentUser = userName || "Stakeholder";
  const currentYear = selectedYear || new Date().getFullYear();

  // ── Refresh data from Supabase ───────────────────────────────

  const refreshData = useCallback(async () => {
    if (!hasSupabaseConfig) {
      setAllData(loadAllData());
      setApiAvailable(false);
      return;
    }
    try {
      const apiData = await api.loadAssessments();
      const reconciled = reconcileDataWithDomains(apiData, domainsRef.current);
      const localData = loadAllData();
      const merged = mergeDataSources(reconciled, localData);
      setAllData(merged);
      saveAllData(merged);
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!hasSupabaseConfig) {
        if (!cancelled) {
          setAllData(loadAllData());
          setApiAvailable(false);
        }
        return;
      }
      try {
        const apiData = await api.loadAssessments();
        if (!cancelled) {
          const reconciled = reconcileDataWithDomains(apiData, domainsRef.current);
          const localData = loadAllData();
          const merged = mergeDataSources(reconciled, localData);
          setAllData(merged);
          saveAllData(merged);
          setApiAvailable(true);
        }
      } catch {
        if (!cancelled) {
          setAllData(loadAllData());
          setApiAvailable(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setAllData((prev) => {
      const reconciled = reconcileDataWithDomains(prev, domainsRef.current);
      saveAllData(reconciled);
      return reconciled;
    });
  }, [domains]);

  // Real-time subscription — auto-refresh when data changes in Supabase
  useEffect(() => {
    if (!hasSupabaseConfig) return;
    const channel = supabase
      .channel("assessment-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assessment_data" },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  // Refresh when window gets focus (catches any missed changes)
  useEffect(() => {
    const handleFocus = () => refreshData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshData]);

  const ensureCity = useCallback(
    (cityId: string): CityData => {
      if (allData[cityId]) return allData[cityId];
      return {
        cityId,
        cityName: cityId,
        assessments: {},
      };
    },
    [allData]
  );

  const cityData = ensureCity(selectedCity);
  const assessment =
    cityData.assessments[currentYear] ||
    getOrCreateAssessment(cityData, currentYear);
  const availableYears = getAvailableYears(cityData);

  // ── Create new year ────────────────────────────────────────

  const createYear = useCallback(
    async (year: number, copyFrom?: number) => {
      let indicators: Record<string, IndicatorData> = {};
      let auditLog: AuditLog[] = [];

      const city = ensureCity(selectedCity);
      if (copyFrom && city.assessments[copyFrom]) {
        indicators = JSON.parse(
          JSON.stringify(city.assessments[copyFrom].indicators)
        );
        auditLog = [];
      }

      const newAssessment: AssessmentYear = {
        year,
        indicators,
        auditLog,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCity: CityData = {
        ...city,
        assessments: {
          ...city.assessments,
          [year]: newAssessment,
        },
      };

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [selectedCity]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      if (apiAvailable) {
        await api.saveAssessments(selectedCity, year, indicators);
      }
    },
    [selectedCity, ensureCity, apiAvailable]
  );

  // ── Delete year ────────────────────────────────────────────

  const deleteYear = useCallback(
    async (year: number) => {
      const city = ensureCity(selectedCity);
      const newAssessments = { ...city.assessments };
      delete newAssessments[year];

      const updatedCity: CityData = {
        ...city,
        assessments: newAssessments,
      };

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [selectedCity]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      if (apiAvailable) {
        await api.deleteYear(selectedCity, year);
      }
    },
    [selectedCity, ensureCity, apiAvailable]
  );

  // ── Update indicator ───────────────────────────────────────

  const updateIndicator = useCallback(
    async (indicatorId: string, value: number | string | boolean, notes?: string) => {
      const city = ensureCity(selectedCity);
      const assess = getOrCreateAssessment(city, currentYear);
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
      };

      const updatedCity: CityData = {
        ...city,
        assessments: {
          ...city.assessments,
          [currentYear]: updatedAssessment,
        },
      };

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [selectedCity]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      if (apiAvailable) {
        await api.saveAssessment(selectedCity, currentYear, indicatorId, indicatorData);
        await api.addAuditEntry(selectedCity, currentYear, indicatorId, auditEntry);
      }
    },
    [selectedCity, currentYear, currentUser, ensureCity, apiAvailable]
  );

  // ── Add audit note ─────────────────────────────────────────

  const addAuditNote = useCallback(
    async (indicatorId: string, note: string) => {
      const city = ensureCity(selectedCity);
      const assess = getOrCreateAssessment(city, currentYear);

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
      };

      const updatedCity: CityData = {
        ...city,
        assessments: {
          ...city.assessments,
          [currentYear]: updatedAssessment,
        },
      };

      setAllData((prev) => {
        const nextData = {
          ...prev,
          [selectedCity]: updatedCity,
        };
        saveAllData(nextData);
        return nextData;
      });

      if (apiAvailable) {
        await api.addAuditEntry(selectedCity, currentYear, indicatorId, auditEntry);
      }
    },
    [selectedCity, currentYear, currentUser, ensureCity, apiAvailable]
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
  }, [assessment, getAssessmentStats]);

  const getDataEntryStatsForYear = useCallback(
    (year: number): {
      total: number;
      filled: number;
      missing: number;
      percentage: number;
      confidence: number;
    } => {
      const city = ensureCity(selectedCity);
      const assess = city.assessments[year];
      return getAssessmentStats(assess);
    },
    [ensureCity, getAssessmentStats, selectedCity]
  );

  const getScoreForYear = useCallback(
    (year: number): number => {
      const city = ensureCity(selectedCity);
      const assess = city.assessments[year];
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
    [ensureCity, getAssessmentStats, selectedCity]
  );

  const getDomainScoreForYear = useCallback(
    (domainId: string, year: number): number => {
      const city = ensureCity(selectedCity);
      const assess = city.assessments[year];
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
    [ensureCity, getDomainStatsForAssessment, selectedCity]
  );

  return {
    allData,
    cityData,
    assessment,
    selectedCity,
    setSelectedCity,
    selectedYear: currentYear,
    availableYears,
    createYear,
    deleteYear,
    updateIndicator,
    addAuditNote,
    getIndicatorScore,
    getDomainScore,
    getOverallScore,
    getDataEntryStats,
    getDataEntryStatsForYear,
    getScoreForYear,
    getDomainScoreForYear,
    apiAvailable,
    refreshData,
  };
}
