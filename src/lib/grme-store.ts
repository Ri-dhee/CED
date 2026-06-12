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
  geometricMean,
} from "./grme-data";
import * as api from "./grme-api";
import { supabase } from "./supabase";

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
    return parsed;
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

function findIndicatorInDomains(
  domains: Domain[],
  indicatorId: string
) {
  for (const domain of domains) {
    for (const sub of domain.subdomains) {
      const ind = sub.indicators.find((i) => i.id === indicatorId);
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
    try {
      const apiData = await api.loadAssessments();
      setAllData(apiData);
      saveAllData(apiData);
      setApiAvailable(true);
    } catch {
      setApiAvailable(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const apiData = await api.loadAssessments();
        if (!cancelled) {
          setAllData(apiData);
          saveAllData(apiData);
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

  // Real-time subscription — auto-refresh when data changes in Supabase
  useEffect(() => {
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
    (year: number, copyFrom?: number) => {
      const city = ensureCity(selectedCity);
      let indicators: Record<string, IndicatorData> = {};
      let auditLog: AuditLog[] = [];

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

      const newData = {
        ...allData,
        [selectedCity]: updatedCity,
      };

      setAllData(newData);
      saveAllData(newData);

      // Sync to API (fire-and-forget)
      if (apiAvailable) {
        api.saveAssessments(selectedCity, year, indicators).catch(() => {});
      }
    },
    [allData, selectedCity, ensureCity, apiAvailable]
  );

  // ── Delete year ────────────────────────────────────────────

  const deleteYear = useCallback(
    (year: number) => {
      const city = ensureCity(selectedCity);
      const newAssessments = { ...city.assessments };
      delete newAssessments[year];

      const updatedCity: CityData = {
        ...city,
        assessments: newAssessments,
      };

      const newData = {
        ...allData,
        [selectedCity]: updatedCity,
      };

      setAllData(newData);
      saveAllData(newData);

      // Sync to API (fire-and-forget)
      if (apiAvailable) {
        api.deleteYear(selectedCity, year).catch(() => {});
      }
    },
    [allData, selectedCity, ensureCity, apiAvailable]
  );

  // ── Update indicator ───────────────────────────────────────

  const updateIndicator = useCallback(
    (indicatorId: string, value: number | string, notes?: string) => {
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

      const newData = {
        ...allData,
        [selectedCity]: updatedCity,
      };

      setAllData(newData);
      saveAllData(newData);

      // Sync to API (fire-and-forget)
      if (apiAvailable) {
        api.saveAssessment(selectedCity, currentYear, indicatorId, indicatorData).catch(() => {});
        api.addAuditEntry(selectedCity, currentYear, indicatorId, auditEntry).catch(() => {});
      }
    },
    [allData, selectedCity, currentYear, currentUser, ensureCity, apiAvailable]
  );

  // ── Add audit note ─────────────────────────────────────────

  const addAuditNote = useCallback(
    (indicatorId: string, note: string) => {
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

      const newData = {
        ...allData,
        [selectedCity]: updatedCity,
      };

      setAllData(newData);
      saveAllData(newData);

      // Sync to API (fire-and-forget)
      if (apiAvailable) {
        api.addAuditEntry(selectedCity, currentYear, indicatorId, auditEntry).catch(() => {});
      }
    },
    [allData, selectedCity, currentYear, currentUser, ensureCity, apiAvailable]
  );

  // ── Scoring ────────────────────────────────────────────────

  const getIndicatorScore = useCallback(
    (indicatorId: string): number | null => {
      const data = assessment.indicators[indicatorId];
      if (
        data === undefined ||
        data.value === null ||
        data.value === undefined
      ) {
        return null;
      }
      const indicator = findIndicatorInDomains(
        domainsRef.current,
        indicatorId
      );
      if (!indicator) return null;
      if (typeof data.value === "string") return null;
      return calculateIndicatorScore(data.value, indicator);
    },
    [assessment]
  );

  const getDomainScore = useCallback(
    (domainId: string): number => {
      const domain = domainsRef.current.find((d) => d.id === domainId);
      if (!domain) return 50;
      return calculateDomainScore(domain, getIndicatorScore);
    },
    [getIndicatorScore]
  );

  const getOverallScore = useCallback((): number => {
    const scores = domainsRef.current.map((d) => getDomainScore(d.id));
    return geometricMean(scores);
  }, [getDomainScore]);

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

  const getScoreForYear = useCallback(
    (year: number): number => {
      const city = ensureCity(selectedCity);
      const assess = city.assessments[year];
      if (!assess) return 0;

      const getScoreForIndicator = (indicatorId: string): number | null => {
        const data = assess.indicators[indicatorId];
        if (data === undefined || data.value === null || data.value === undefined)
          return null;
        const indicator = findIndicatorInDomains(
          domainsRef.current,
          indicatorId
        );
        if (!indicator) return null;
        if (typeof data.value === "string") return null;
        return calculateIndicatorScore(data.value, indicator);
      };

      const domainScores = domainsRef.current.map((d) =>
        calculateDomainScore(d, getScoreForIndicator)
      );
      return geometricMean(domainScores);
    },
    [ensureCity, selectedCity]
  );

  const getDomainScoreForYear = useCallback(
    (domainId: string, year: number): number => {
      const city = ensureCity(selectedCity);
      const assess = city.assessments[year];
      if (!assess) return 50;

      const domain = domainsRef.current.find((d) => d.id === domainId);
      if (!domain) return 50;

      const getScoreForIndicator = (indicatorId: string): number | null => {
        const data = assess.indicators[indicatorId];
        if (data === undefined || data.value === null || data.value === undefined)
          return null;
        const indicator = findIndicatorInDomains(
          domainsRef.current,
          indicatorId
        );
        if (!indicator) return null;
        if (typeof data.value === "string") return null;
        return calculateIndicatorScore(data.value, indicator);
      };

      return calculateDomainScore(domain, getScoreForIndicator);
    },
    [ensureCity, selectedCity]
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
    getScoreForYear,
    getDomainScoreForYear,
    apiAvailable,
    refreshData,
  };
}
