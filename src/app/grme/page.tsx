"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CITIES,
  getStatusFromScore,
  getStatusColor,
  getStatusBg,
} from "@/lib/grme-data";
import { useGRMEData } from "@/lib/grme-store";
import { useGRMEFramework } from "@/lib/grme-framework-store";
import { useGrmeUser, canEditFramework, canEnterData } from "@/lib/grme-user";
import {
  exportYearCsv,
  exportAllYearsCsv,
  exportSummaryCsv,
} from "@/lib/grme-export";
import RadarChart from "@/components/grme/RadarChart";
import BarChart from "@/components/grme/BarChart";
import ProgressRings from "@/components/grme/ProgressRings";
import AnimatedScore from "@/components/grme/AnimatedScore";
import DataQualityBar from "@/components/grme/DataQualityBar";
import InsightsPanel from "@/components/grme/InsightsPanel";
import DomainCards from "@/components/grme/DomainCards";
import BenchmarkLegend from "@/components/grme/BenchmarkLegend";
import ComparisonView from "@/components/grme/ComparisonView";
import DataEntryForm from "@/components/grme/DataEntryForm";
import AuditPanel from "@/components/grme/AuditPanel";
import FrameworkEditor from "@/components/grme/FrameworkEditor";
import LoginScreen from "@/components/grme/LoginScreen";
import UserBadge from "@/components/grme/UserBadge";
import YearSelector from "@/components/grme/YearSelector";
import TrendChart from "@/components/grme/TrendChart";
import UserManagement from "@/components/grme/UserManagement";
import ApiStatus, { SyncProvider, useSync } from "@/components/grme/ApiStatus";

type Tab = "dashboard" | "entry" | "framework" | "audit";

export default function GRMEPage() {
  const { user, loaded: userLoaded, login, logout, switchRole } = useGrmeUser();

  // Show login screen if not logged in
  if (userLoaded && !user) {
    return <LoginScreen onLogin={login} />;
  }

  // Don't render until user is loaded
  if (!user || !userLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <SyncProvider>
      <GRMEApp user={user} onSwitchRole={switchRole} onLogout={logout} />
    </SyncProvider>
  );
}

function GRMEApp({
  user,
  onSwitchRole,
  onLogout,
}: {
  user: { name: string; role: "admin" | "editor" | "viewer"; loginAt: string };
  onSwitchRole: (role: "admin" | "editor" | "viewer") => void;
  onLogout: () => void;
}) {
  const framework = useGRMEFramework();
  const { trackSync } = useSync();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [overlayYear, setOverlayYear] = useState<number | null>(null);

  const {
    cityData,
    assessment,
    selectedCity,
    setSelectedCity,
    availableYears,
    createYear,
    deleteYear,
    updateIndicator,
    addAuditNote,
    getDomainScore,
    getOverallScore,
    getDataEntryStats,
    getDataEntryStatsForYear,
    getScoreForYear,
    getDomainScoreForYear,
    apiAvailable,
    refreshData,
  } = useGRMEData(framework.domains, user.name, selectedYear);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedDomain, setSelectedDomain] = useState<string>(
    framework.domains[0]?.id || ""
  );
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>(
    framework.domains[0]?.subdomains[0]?.id || ""
  );
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Sync-wrapped mutations — every save shows status
  const trackedUpdateIndicator = useCallback(
    async (indicatorId: string, value: number | string | boolean, notes?: string) => {
      const syncId = `indicator-${selectedCity}-${selectedYear}-${indicatorId}`;
      const { onSuccess, onError } = trackSync(syncId);
      try {
        await updateIndicator(indicatorId, value, notes);
        await refreshData();
        onSuccess();
      } catch {
        onError();
      }
    },
    [updateIndicator, trackSync, selectedCity, selectedYear, refreshData]
  );

  const trackedAddAuditNote = useCallback(
    async (indicatorId: string, note: string) => {
      const syncId = `audit-${selectedCity}-${selectedYear}-${indicatorId}`;
      const { onSuccess, onError } = trackSync(syncId);
      try {
        await addAuditNote(indicatorId, note);
        await refreshData();
        onSuccess();
      } catch {
        onError();
      }
    },
    [addAuditNote, trackSync, selectedCity, selectedYear, refreshData]
  );

  const trackedCreateYear = useCallback(
    async (year: number, copyFrom?: number) => {
      const syncId = `create-year-${selectedCity}-${year}`;
      const { onSuccess, onError } = trackSync(syncId);
      try {
        await createYear(year, copyFrom);
        await refreshData();
        onSuccess();
      } catch {
        onError();
      }
    },
    [createYear, trackSync, selectedCity, refreshData]
  );

  const trackedDeleteYear = useCallback(
    async (year: number) => {
      const syncId = `delete-year-${selectedCity}-${year}`;
      const { onSuccess, onError } = trackSync(syncId);
      try {
        await deleteYear(year);
        await refreshData();
        onSuccess();
      } catch {
        onError();
      }
    },
    [deleteYear, trackSync, selectedCity, refreshData]
  );

  const currentDomain =
    framework.domains.find((d) => d.id === selectedDomain) ||
    framework.domains[0];
  const currentSubdomain =
    currentDomain?.subdomains.find((s) => s.id === selectedSubdomain) ||
    currentDomain?.subdomains[0];

  const domainScores = useMemo(() => {
    const result: Record<string, number> = {};
    framework.domains.forEach((domain) => {
      result[domain.id] = getDomainScore(domain.id);
    });
    return result;
  }, [framework.domains, getDomainScore]);

  const previousYear = useMemo(() => {
    const sortedYears = [...availableYears].sort((a, b) => a - b);
    const currentIdx = sortedYears.indexOf(selectedYear);
    return currentIdx > 0 ? sortedYears[currentIdx - 1] : null;
  }, [availableYears, selectedYear]);
  const comparisonYear = overlayYear ?? previousYear;

  const overallScore = useMemo(() => getOverallScore(), [getOverallScore]);
  const stats = useMemo(() => getDataEntryStats(), [getDataEntryStats]);
  const currentStats = stats;
  const comparisonStats = useMemo(
    () => (comparisonYear ? getDataEntryStatsForYear(comparisonYear) : null),
    [comparisonYear, getDataEntryStatsForYear]
  );
  const lowConfidenceYears = useMemo(
    () => availableYears.filter((year) => getDataEntryStatsForYear(year).confidence < 80),
    [availableYears, getDataEntryStatsForYear]
  );
  const overallStatus = getStatusFromScore(overallScore);
  const overallColor = getStatusColor(overallStatus);
  const methodologyNotes = framework.domains
    .map((d) => d.methodologyNote)
    .filter((note): note is string => Boolean(note && note.trim()));
  const draftIndicators = framework.domains.reduce(
    (sum, d) =>
      sum +
      d.subdomains.reduce(
        (subSum, s) =>
          subSum + s.indicators.filter((i) => i.validationStatus === "draft").length,
        0
      ),
    0
  );
  const comparisonDomainScores = useMemo(() => {
    if (!comparisonYear) return null;
    return Object.fromEntries(
      framework.domains.map((d) => [d.id, getDomainScoreForYear(d.id, comparisonYear)])
    );
  }, [comparisonYear, framework.domains, getDomainScoreForYear]);

  const isAdmin = canEditFramework(user.role);
  const canEdit = canEnterData(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium mb-6 border border-primary/10">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Dynamic Assessment Dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              GRME <span className="gradient-text">Index</span>
            </h1>
            <p className="text-lg text-gray-500">
              Enter data from field assessments. The dashboard updates in
              real-time.
            </p>
          </div>
        </div>
      </section>

      {/* City + Year Selector + Stats Bar + User Badge */}
      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">
                City:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <YearSelector
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={setSelectedYear}
              onCreateYear={trackedCreateYear}
              onDeleteYear={trackedDeleteYear}
            />
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <ExportButton
              onExportCurrent={() =>
                exportYearCsv(framework.domains, cityData, selectedYear)
              }
              onExportAll={() =>
                exportAllYearsCsv(framework.domains, cityData, availableYears)
              }
              onExportSummary={() =>
                exportSummaryCsv(framework.domains, cityData, availableYears)
              }
            />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Data Entry:</span>
                  <span
                    className="ml-2 font-bold"
                    style={{ color: overallColor }}
                  >
                    {stats.filled}/{stats.total}
                  </span>
                  <span className="ml-1 text-gray-400">
                    ({stats.percentage}%)
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <div>
                  <span className="text-gray-400">Overall Score:</span>
                  <span
                    className="ml-2 text-xl font-bold"
                    style={{ color: overallColor }}
                  >
                    {Math.round(overallScore)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ApiStatus apiAvailable={apiAvailable} onRefresh={refreshData} />
                {isAdmin && (
                  <button
                    onClick={() => setShowUserManagement(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    aria-label="User management"
                    title="Manage users"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <UserBadge
                  user={user}
                  onSwitchRole={onSwitchRole}
                  onLogout={onLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 flex-wrap" role="tablist" aria-label="GRME sections">
            {([
              {
                id: "dashboard",
                label: "Dashboard",
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                show: true,
              },
              {
                id: "entry",
                label: "Data Entry",
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                show: canEdit,
              },
              {
                id: "framework",
                label: "Framework",
                icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
                show: isAdmin,
              },
              {
                id: "audit",
                label: "Audit Trail",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                show: true,
              },
            ] as const)
              .filter((t) => t.show)
              .map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-primary/30"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={tab.icon}
                    />
                  </svg>
                  {tab.label}
                  {tab.id === "framework" &&
                    framework.pendingProposals.length > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {framework.pendingProposals.length}
                      </span>
                    )}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <section className="pb-12" role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            {/* ═══ HERO ROW: Animated Score + Radar + Data Quality ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Animated Score — hero prominence */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                <AnimatedScore
                  score={overallScore}
                  previousScore={
                    previousYear ? getScoreForYear(previousYear) : null
                  }
                  confidence={currentStats.confidence}
                  size="xl"
                  showGrade
                  showTrend
                />
                <div className="mt-4 text-center">
                  <div className="text-xs font-medium text-gray-500">
                    Confidence {currentStats.confidence}%
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Based on {currentStats.filled}/{currentStats.total} indicators
                  </div>
                </div>
              </div>

              {/* Radar Chart — core visual */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Domain Profile
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Overlay:</span>
                    <select
                      value={overlayYear ?? "auto"}
                      onChange={(e) =>
                        setOverlayYear(
                          e.target.value === "auto" ? null : Number(e.target.value)
                        )
                      }
                      className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600"
                    >
                      <option value="auto">Auto (previous year)</option>
                      {availableYears
                        .filter((year) => year !== selectedYear)
                        .map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="max-w-sm mx-auto">
                  <RadarChart
                    domains={framework.domains}
                    getDomainScore={getDomainScore}
                    comparisonDomainScores={comparisonDomainScores || undefined}
                    comparisonLabel={comparisonYear ? String(comparisonYear) : undefined}
                    size={340}
                    onDomainClick={(id) => {
                      if (canEdit) {
                        setSelectedDomain(id);
                        setSelectedSubdomain(
                          framework.domains.find((d) => d.id === id)?.subdomains[0]?.id || ""
                        );
                        setActiveTab("entry");
                      }
                    }}
                  />
                </div>
              </div>

              {/* Right column: Data Quality + Benchmark Legend */}
              <div className="lg:col-span-4 space-y-6">
                <DataQualityBar
                  domains={framework.domains}
                  getDomainScore={getDomainScore}
                  getDataEntryStats={getDataEntryStats}
                />
                <BenchmarkLegend />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Methodology</h3>
                  <p className="text-[11px] leading-5 text-gray-500 mb-2">
                    Scores use weighted geometric mean with confidence adjustment.
                  </p>
                  <p className="text-[11px] leading-5 text-gray-500 mb-2">
                    {draftIndicators} indicators still need expert validation.
                  </p>
                  <div className="space-y-2">
                    {methodologyNotes.slice(0, 2).map((note, idx) => (
                      <div key={idx} className="rounded-xl bg-gray-50 p-3 text-[11px] text-gray-600 leading-5">
                        {note}
                      </div>
                    ))}
                    {methodologyNotes.length === 0 && (
                      <div className="rounded-xl bg-gray-50 p-3 text-[11px] text-gray-500 leading-5">
                        Add a methodology note to each domain to document weighting or interpretation guidance.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ INSIGHTS ROW ═══ */}
            <div className="mt-6">
              <InsightsPanel
                domains={framework.domains}
                getDomainScore={getDomainScore}
                getDomainScoreForYear={getDomainScoreForYear}
                selectedYear={selectedYear}
                availableYears={availableYears}
                confidence={currentStats.confidence}
                filled={currentStats.filled}
                total={currentStats.total}
              />
            </div>

            {/* ═══ DOMAIN CARDS ═══ */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Domains at a Glance
                </h2>
                {canEdit && (
                  <span className="text-xs text-gray-400">
                    Click a card to enter data
                  </span>
                )}
              </div>
              <DomainCards
                domains={framework.domains}
                assessment={assessment}
                getDomainScore={getDomainScore}
                getDomainScoreForYear={getDomainScoreForYear}
                previousYear={previousYear}
                selectedYear={selectedYear}
                onDomainClick={(id) => {
                  if (canEdit) {
                    setSelectedDomain(id);
                    setSelectedSubdomain(
                      framework.domains.find((d) => d.id === id)?.subdomains[0]?.id || ""
                    );
                    setActiveTab("entry");
                  }
                }}
              />
            </div>

            {/* ═══ COMPARISON ROW (2+ years) ═══ */}
            {availableYears.length >= 2 && comparisonYear && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {comparisonStats && (currentStats.confidence < 80 || comparisonStats.confidence < 80) && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This comparison is preliminary because one or both years have incomplete data.
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Year-over-Year Comparison
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
                      {previousYear}
                    </span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                      {selectedYear}
                    </span>
                  </div>
                </div>
                <ComparisonView
                  domains={framework.domains}
                  currentYear={selectedYear}
                  previousYear={comparisonYear}
                  getCurrentDomainScore={getDomainScore}
                  getPreviousDomainScore={(domainId) => getDomainScoreForYear(domainId, comparisonYear || selectedYear)}
                />
              </div>
            )}

            {/* ═══ TREND CHARTS (2+ years) ═══ */}
            {availableYears.length >= 2 && (
              <div className="mt-6">
                {lowConfidenceYears.length > 0 && (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Trend charts include preliminary years: {lowConfidenceYears.join(", ")}.
                  </div>
                )}
                <TrendChart
                  years={availableYears}
                  overallScores={Object.fromEntries(
                    availableYears.map((y) => [y, getScoreForYear(y)])
                  )}
                  domainScores={Object.fromEntries(
                    availableYears.map((y) => [
                      y,
                      Object.fromEntries(
                        framework.domains.map((d) => [
                          d.id,
                          getDomainScoreForYear(d.id, y),
                        ])
                      ),
                    ])
                  )}
                  domainLabels={Object.fromEntries(
                    framework.domains.map((d) => [d.id, d.name])
                  )}
                  domainColors={Object.fromEntries(
                    framework.domains.map((d) => [d.id, d.color])
                  )}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Data Entry Tab */}
      {activeTab === "entry" && canEdit && (
        <section className="pb-12" role="tabpanel" id="panel-entry" aria-labelledby="tab-entry">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Domains
                    </h3>
                    <div className="space-y-1.5">
                      {framework.domains.map((domain) => {
                        const score = domainScores[domain.id];
                        const status = getStatusFromScore(score);
                        const color = getStatusColor(status);
                        const filled = domain.subdomains
                          .flatMap((s) => s.indicators)
                          .filter(
                            (i) =>
                              assessment.indicators[i.id]?.value !== undefined
                          ).length;
                        const total = domain.subdomains.flatMap(
                          (s) => s.indicators
                        ).length;

                        return (
                          <button
                            key={domain.id}
                            onClick={() => {
                              setSelectedDomain(domain.id);
                              setSelectedSubdomain(
                                domain.subdomains[0]?.id || ""
                              );
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                              selectedDomain === domain.id
                                ? "bg-primary/5 border border-primary/20"
                                : "hover:bg-gray-50 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: domain.color }}
                                />
                                <span className="font-medium text-gray-800">
                                  {domain.shortName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">
                                  {filled}/{total}
                                </span>
                                <span
                                  className="text-xs font-bold"
                                  style={{ color }}
                                >
                                  {Math.round(score)}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {currentDomain && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {currentDomain.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        {currentDomain.description}
                      </p>
                      <div className="space-y-1.5">
                        {currentDomain.subdomains.map((sub) => {
                          const subIndicators = sub.indicators;
                          const filledCount = subIndicators.filter(
                            (i) =>
                              assessment.indicators[i.id]?.value !== undefined
                          ).length;

                          return (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubdomain(sub.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                                selectedSubdomain === sub.id
                                  ? "bg-white shadow-sm border border-gray-200"
                                  : "hover:bg-white/50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-700 truncate">
                                  {sub.name}
                                </span>
                                <span className="font-bold ml-2 text-gray-500">
                                  {filledCount}/{subIndicators.length}
                                </span>
                              </div>
                              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${subIndicators.length > 0 ? (filledCount / subIndicators.length) * 100 : 0}%`,
                                    backgroundColor: "#6366f1",
                                  }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentSubdomain?.name || "Select a sub-domain"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enter actual values from your field assessment data
                  </p>
                </div>
                <div className="space-y-3">
                  {currentSubdomain?.indicators.map((indicator) => (
                    <DataEntryForm
                      key={indicator.id}
                      indicator={indicator}
                      value={
                        assessment.indicators[indicator.id]?.value ?? null
                      }
                      notes={assessment.indicators[indicator.id]?.notes}
                      onValueChange={(value, notes) =>
                        trackedUpdateIndicator(indicator.id, value, notes)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Framework Tab (Admin only) */}
      {activeTab === "framework" && isAdmin && (
        <section className="pb-12" role="tabpanel" id="panel-framework" aria-labelledby="tab-framework">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FrameworkEditor
              domains={framework.domains}
              pendingProposals={framework.pendingProposals}
              reviewedProposals={framework.reviewedProposals}
              onUpdateDomain={framework.updateDomainField}
              onUpdateSubDomain={framework.updateSubDomainField}
              onUpdateIndicator={framework.updateIndicatorField}
              onAddDomain={framework.addDomainDirect}
              onAddSubDomain={framework.addSubDomainDirect}
              onAddIndicator={framework.addIndicatorDirect}
              onDeleteDomain={framework.deleteDomainDirect}
              onDeleteSubDomain={framework.deleteSubDomainDirect}
              onDeleteIndicator={framework.deleteIndicatorDirect}
              onApprove={framework.approveProposal}
              onReject={framework.rejectProposal}
            />
          </div>
        </section>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <section className="pb-12" role="tabpanel" id="panel-audit" aria-labelledby="tab-audit">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <AuditPanel
              domains={framework.domains}
              auditLog={assessment.auditLog}
              onAddNote={trackedAddAuditNote}
            />
          </div>
        </section>
      )}

      {/* User Management Modal */}
      {showUserManagement && isAdmin && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  );
}

// ── Export Button ────────────────────────────────────────────────

function ExportButton({
  onExportCurrent,
  onExportAll,
  onExportSummary,
}: {
  onExportCurrent: () => void;
  onExportAll: () => void;
  onExportSummary: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Export data"
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Download CSV
              </div>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  onExportCurrent();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="font-medium">Current Year</div>
                  <div className="text-[10px] text-gray-400">All indicators for selected year</div>
                </div>
              </button>
              <button
                onClick={() => {
                  onExportAll();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <div>
                  <div className="font-medium">All Years</div>
                  <div className="text-[10px] text-gray-400">Comparison across years</div>
                </div>
              </button>
              <button
                onClick={() => {
                  onExportSummary();
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <div className="font-medium">Summary</div>
                  <div className="text-[10px] text-gray-400">Domain scores overview</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
