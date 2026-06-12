"use client";

import { useState, useMemo } from "react";
import {
  CITIES,
  getStatusFromScore,
  getStatusColor,
  getStatusBg,
} from "@/lib/grme-data";
import { useGRMEData } from "@/lib/grme-store";
import { useGRMEFramework } from "@/lib/grme-framework-store";
import RadarChart from "@/components/RadarChart";
import DataEntryForm from "@/components/DataEntryForm";
import AuditPanel from "@/components/AuditPanel";
import FrameworkEditor from "@/components/FrameworkEditor";

type Tab = "dashboard" | "entry" | "framework" | "audit";

export default function GRMEPage() {
  const framework = useGRMEFramework();

  const {
    cityData,
    selectedCity,
    setSelectedCity,
    updateIndicator,
    addAuditNote,
    getDomainScore,
    getOverallScore,
    getDataEntryStats,
  } = useGRMEData(framework.domains);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedDomain, setSelectedDomain] = useState<string>(
    framework.domains[0]?.id || ""
  );
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>(
    framework.domains[0]?.subdomains[0]?.id || ""
  );

  // Update selections when framework changes
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

  const overallScore = getOverallScore();
  const stats = getDataEntryStats();
  const overallStatus = getStatusFromScore(overallScore);
  const overallColor = getStatusColor(overallStatus);

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

      {/* City Selector + Stats Bar */}
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
            <div className="flex-1" />
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
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 flex-wrap">
            {([
              {
                id: "dashboard",
                label: "Dashboard",
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
              },
              {
                id: "entry",
                label: "Data Entry",
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
              },
              {
                id: "framework",
                label: "Framework",
                icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
              },
              {
                id: "audit",
                label: "Audit Trail",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              },
            ] as const).map((tab) => (
              <button
                key={tab.id}
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
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Domain Profile
                </h2>
                <div className="max-w-md mx-auto">
                  <RadarChart
                    domains={framework.domains}
                    getDomainScore={getDomainScore}
                    size={400}
                  />
                </div>
              </div>

              {/* Domain Scores */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Domain Scores
                </h2>
                <div className="space-y-3">
                  {framework.domains.map((domain) => {
                    const score = domainScores[domain.id];
                    const status = getStatusFromScore(score);
                    const color = getStatusColor(status);
                    const filled = domain.subdomains
                      .flatMap((s) => s.indicators)
                      .filter(
                        (i) => cityData.indicators[i.id]?.value !== undefined
                      ).length;
                    const total = domain.subdomains.flatMap(
                      (s) => s.indicators
                    ).length;

                    return (
                      <div
                        key={domain.id}
                        className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDomain(domain.id);
                          setSelectedSubdomain(domain.subdomains[0]?.id || "");
                          setActiveTab("entry");
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: domain.color }}
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {domain.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {filled}/{total}
                            </span>
                            <span
                              className="text-sm font-bold"
                              style={{ color }}
                            >
                              {Math.round(score)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${score}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: getStatusBg(status),
                              color,
                            }}
                          >
                            {status}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Click to enter data →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">
                  {Math.round(overallScore)}
                </div>
                <div className="text-xs text-gray-500">Overall Score</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats.filled}
                </div>
                <div className="text-xs text-gray-500">
                  Indicators Entered
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">
                  {stats.total - stats.filled}
                </div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {stats.percentage}%
                </div>
                <div className="text-xs text-gray-500">Completion</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data Entry Tab */}
      {activeTab === "entry" && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Domain/Subdomain Navigation */}
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
                              cityData.indicators[i.id]?.value !== undefined
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
                              cityData.indicators[i.id]?.value !== undefined
                          ).length;
                          const subScore =
                            subIndicators.length > 0
                              ? (subIndicators.reduce((sum, ind) => {
                                  const data = cityData.indicators[ind.id];
                                  if (
                                    data &&
                                    typeof data.value === "number"
                                  ) {
                                    const indicatorScore =
                                      getDomainScore(currentDomain.id);
                                    return sum + indicatorScore;
                                  }
                                  return sum + 50;
                                }, 0) /
                                  subIndicators.length)
                              : 50;
                          const subStatus = getStatusFromScore(subScore);
                          const color = getStatusColor(subStatus);

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
                                <span
                                  className="font-bold ml-2"
                                  style={{ color }}
                                >
                                  {filledCount}/{subIndicators.length}
                                </span>
                              </div>
                              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${subIndicators.length > 0 ? (filledCount / subIndicators.length) * 100 : 0}%`,
                                    backgroundColor: color,
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

              {/* Indicator Forms */}
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
                        cityData.indicators[indicator.id]?.value ?? null
                      }
                      notes={cityData.indicators[indicator.id]?.notes}
                      onValueChange={(value, notes) =>
                        updateIndicator(indicator.id, value, notes)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Framework Tab */}
      {activeTab === "framework" && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FrameworkEditor
              domains={framework.domains}
              pendingProposals={framework.pendingProposals}
              reviewedProposals={framework.reviewedProposals}
              onAddDomain={framework.proposeAddDomain}
              onEditDomain={framework.proposeEditDomain}
              onDeleteDomain={framework.proposeDeleteDomain}
              onAddSubDomain={framework.proposeAddSubDomain}
              onEditSubDomain={framework.proposeEditSubDomain}
              onDeleteSubDomain={framework.proposeDeleteSubDomain}
              onAddIndicator={framework.proposeAddIndicator}
              onEditIndicator={framework.proposeEditIndicator}
              onDeleteIndicator={framework.proposeDeleteIndicator}
              onApprove={framework.approveProposal}
              onReject={framework.rejectProposal}
              newDomain={framework.newDomain}
              newSubDomain={framework.newSubDomain}
              newIndicator={framework.newIndicator}
            />
          </div>
        </section>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <AuditPanel
              domains={framework.domains}
              auditLog={cityData.auditLog}
              onAddNote={addAuditNote}
            />
          </div>
        </section>
      )}
    </div>
  );
}
