"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CityData,
  IndicatorData,
  AuditEntry,
  AuditLog,
  DOMAINS,
  getStatus,
  getStatusScore,
} from "./grme-data";

const STORAGE_KEY = "grme-data";
const CURRENT_USER = "Stakeholder";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadAllData(): Record<string, CityData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllData(data: Record<string, CityData>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useGRMEData() {
  const [allData, setAllData] = useState<Record<string, CityData>>({});
  const [selectedCity, setSelectedCity] = useState<string>("thimphu");

  useEffect(() => {
    setAllData(loadAllData());
  }, []);

  const cityData = allData[selectedCity] || {
    cityId: selectedCity,
    cityName: selectedCity,
    year: new Date().getFullYear(),
    indicators: {},
    auditLog: [],
  };

  const updateIndicator = useCallback(
    (indicatorId: string, value: number | string, notes?: string) => {
      const existing = cityData.indicators[indicatorId];
      const newValue = String(value);

      const auditEntry: AuditEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        user: CURRENT_USER,
        action: existing ? "update" : "create",
        field: "value",
        oldValue: existing?.value !== undefined ? String(existing.value) : undefined,
        newValue,
        notes,
      };

      const indicatorData: IndicatorData = {
        indicatorId,
        value,
        notes,
        lastUpdated: new Date().toISOString(),
        updatedBy: CURRENT_USER,
      };

      const existingAudit = cityData.auditLog.find(
        (a) => a.indicatorId === indicatorId
      );

      let newAuditLog: AuditLog[];
      if (existingAudit) {
        newAuditLog = cityData.auditLog.map((a) =>
          a.indicatorId === indicatorId
            ? { ...a, entries: [...a.entries, auditEntry] }
            : a
        );
      } else {
        newAuditLog = [
          ...cityData.auditLog,
          { indicatorId, entries: [auditEntry] },
        ];
      }

      const updatedCityData: CityData = {
        ...cityData,
        indicators: {
          ...cityData.indicators,
          [indicatorId]: indicatorData,
        },
        auditLog: newAuditLog,
      };

      const newData = {
        ...allData,
        [selectedCity]: updatedCityData,
      };

      setAllData(newData);
      saveAllData(newData);
    },
    [cityData, allData, selectedCity]
  );

  const addAuditNote = useCallback(
    (indicatorId: string, note: string) => {
      const auditEntry: AuditEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        user: CURRENT_USER,
        action: "review",
        field: "notes",
        newValue: note,
      };

      const existingAudit = cityData.auditLog.find(
        (a) => a.indicatorId === indicatorId
      );

      let newAuditLog: AuditLog[];
      if (existingAudit) {
        newAuditLog = cityData.auditLog.map((a) =>
          a.indicatorId === indicatorId
            ? { ...a, entries: [...a.entries, auditEntry] }
            : a
        );
      } else {
        newAuditLog = [
          ...cityData.auditLog,
          { indicatorId, entries: [auditEntry] },
        ];
      }

      const updatedCityData: CityData = {
        ...cityData,
        auditLog: newAuditLog,
      };

      const newData = {
        ...allData,
        [selectedCity]: updatedCityData,
      };

      setAllData(newData);
      saveAllData(newData);
    },
    [cityData, allData, selectedCity]
  );

  const getDomainScore = useCallback(
    (domainId: string): number => {
      const domain = DOMAINS.find((d) => d.id === domainId);
      if (!domain) return 50;
      const allIndicators = domain.subdomains.flatMap((s) => s.indicators);
      if (allIndicators.length === 0) return 50;
      const scores = allIndicators.map((ind) => {
        const data = cityData.indicators[ind.id];
        if (data && typeof data.value === "number") {
          const status = getStatus(data.value, ind);
          return getStatusScore(status);
        }
        return 50;
      });
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    },
    [cityData]
  );

  const getOverallScore = useCallback((): number => {
    const scores = DOMAINS.map((d) => getDomainScore(d.id));
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [getDomainScore]);

  const getDataEntryStats = useCallback((): {
    total: number;
    filled: number;
    percentage: number;
  } => {
    const total = DOMAINS.reduce(
      (sum, d) =>
        sum + d.subdomains.reduce((s, sub) => s + sub.indicators.length, 0),
      0
    );
    const filled = Object.keys(cityData.indicators).length;
    return { total, filled, percentage: Math.round((filled / total) * 100) };
  }, [cityData]);

  return {
    allData,
    cityData,
    selectedCity,
    setSelectedCity,
    updateIndicator,
    addAuditNote,
    getDomainScore,
    getOverallScore,
    getDataEntryStats,
  };
}
