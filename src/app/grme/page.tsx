"use client";

import { useState, useMemo } from "react";
import { DOMAINS, calculateDomainScore, getScoreColor, getScoreLabel } from "@/lib/grme-data";
import RadarChart from "@/components/RadarChart";
import DomainCard from "@/components/DomainCard";
import IndicatorScorer from "@/components/IndicatorScorer";

export default function GRMEPage() {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    DOMAINS.forEach((domain) => {
      domain.subdomains.forEach((sub) => {
        sub.indicators.forEach((ind) => {
          initial[ind.id] = 50;
        });
      });
    });
    return initial;
  });

  const [selectedDomain, setSelectedDomain] = useState<string>(DOMAINS[0].id);
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>(
    DOMAINS[0].subdomains[0].id
  );

  const domainScores = useMemo(() => {
    const result: Record<string, number> = {};
    DOMAINS.forEach((domain) => {
      result[domain.id] = calculateDomainScore(domain, scores);
    });
    return result;
  }, [scores]);

  const overallScore = useMemo(() => {
    const values = Object.values(domainScores);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [domainScores]);

  const currentDomain = DOMAINS.find((d) => d.id === selectedDomain)!;
  const currentSubdomain = currentDomain.subdomains.find(
    (s) => s.id === selectedSubdomain
  );

  const handleScoreChange = (indicatorId: string, score: number) => {
    setScores((prev) => ({ ...prev, [indicatorId]: score }));
  };

  const overallColor = getScoreColor(overallScore);
  const overallLabel = getScoreLabel(overallScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium mb-6 border border-primary/10">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Gender Responsive Urban Assessment
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              GRME <span className="gradient-text">Index</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              A comprehensive framework for assessing and improving gender
              responsiveness in Bhutan&apos;s urban centres. Explore 8 domains, 26
              sub-domains, and 85 indicators.
            </p>
          </div>
        </div>
      </section>

      {/* Overall Score Card */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Overall GRME Index
                </h2>
                <p className="text-gray-500 mb-6">
                  Composite score across all 8 domains
                </p>
                <div className="flex items-end gap-4 mb-6">
                  <span
                    className="text-6xl font-bold"
                    style={{ color: overallColor }}
                  >
                    {Math.round(overallScore)}
                  </span>
                  <div className="pb-2">
                    <span
                      className="text-lg font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${overallColor}15`,
                        color: overallColor,
                      }}
                    >
                      {overallLabel}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {DOMAINS.map((domain) => (
                    <div key={domain.id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-24 shrink-0">
                        {domain.shortName}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${domainScores[domain.id]}%`,
                            backgroundColor: getScoreColor(
                              domainScores[domain.id]
                            ),
                          }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold w-8 text-right"
                        style={{
                          color: getScoreColor(domainScores[domain.id]),
                        }}
                      >
                        {Math.round(domainScores[domain.id])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <RadarChart scores={domainScores} size={400} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Explorer */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Explore <span className="gradient-text">Domains</span>
            </h2>
            <p className="text-gray-500">
              Click a domain to explore its sub-domains and indicators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOMAINS.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                score={domainScores[domain.id]}
                isSelected={selectedDomain === domain.id}
                onClick={() => {
                  setSelectedDomain(domain.id);
                  setSelectedSubdomain(domain.subdomains[0].id);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Indicator Scoring */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sub-domain tabs */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {currentDomain.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {currentDomain.description}
                </p>
                <div className="space-y-2">
                  {currentDomain.subdomains.map((sub) => {
                    const subScore =
                      sub.indicators.reduce(
                        (sum, ind) => sum + (scores[ind.id] ?? 50),
                        0
                      ) / sub.indicators.length;
                    const subColor = getScoreColor(subScore);

                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubdomain(sub.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedSubdomain === sub.id
                            ? "bg-primary/5 border-2 border-primary/20"
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 text-sm">
                            {sub.name}
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: subColor }}
                          >
                            {Math.round(subScore)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${subScore}%`,
                              backgroundColor: subColor,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick stats */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Domain Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Domain Score</span>
                      <span
                        className="font-bold"
                        style={{ color: getScoreColor(domainScores[selectedDomain]) }}
                      >
                        {Math.round(domainScores[selectedDomain])} -{" "}
                        {getScoreLabel(domainScores[selectedDomain])}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub-domains</span>
                      <span className="font-medium">
                        {currentDomain.subdomains.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Indicators</span>
                      <span className="font-medium">
                        {currentDomain.subdomains.reduce(
                          (sum, s) => sum + s.indicators.length,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {currentSubdomain?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Adjust the sliders to score each indicator (0-100)
                </p>
              </div>
              {currentSubdomain && (
                <IndicatorScorer
                  subdomain={currentSubdomain}
                  scores={scores}
                  onScoreChange={handleScoreChange}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Assessment <span className="gradient-text">Methodology</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quantitative</h3>
              <p className="text-sm text-gray-500">
                Measurable metrics normalized against national/regional benchmarks.
                Examples: wage gap, transport accessibility, health centre coverage.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Qualitative</h3>
              <p className="text-sm text-gray-500">
                Expert assessments using structured rubrics. Examples: policy
                existence, infrastructure quality, service integration.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Participatory</h3>
              <p className="text-sm text-gray-500">
                Women&apos;s lived experience through perception surveys and
                community consultations. Essential where administrative data
                diverges from reality.
              </p>
            </div>
          </div>

          {/* Scoring Scale */}
          <div className="mt-10 bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Scoring Scale</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-500 mb-1">0-25</div>
                <div className="text-sm font-semibold text-red-600">Critical</div>
                <div className="text-xs text-red-500 mt-1">
                  Immediate intervention required
                </div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-500 mb-1">26-50</div>
                <div className="text-sm font-semibold text-amber-600">Developing</div>
                <div className="text-xs text-amber-500 mt-1">
                  Targeted improvements needed
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-500 mb-1">51-75</div>
                <div className="text-sm font-semibold text-blue-600">Progressive</div>
                <div className="text-xs text-blue-500 mt-1">
                  Strengthen and scale programs
                </div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-500 mb-1">76-100</div>
                <div className="text-sm font-semibold text-emerald-600">Exemplary</div>
                <div className="text-xs text-emerald-500 mt-1">
                  Document and share best practices
                </div>
              </div>
            </div>
          </div>

          {/* Alignment */}
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Framework Alignment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-900 mb-1">SDG 5</div>
                <div className="text-xs text-gray-500">Gender Equality</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-900 mb-1">SDG 11</div>
                <div className="text-xs text-gray-500">Sustainable Cities</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-900 mb-1">13th FYP</div>
                <div className="text-xs text-gray-500">Bhutan Five Year Plan</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-900 mb-1">GNH</div>
                <div className="text-xs text-gray-500">Gross National Happiness</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
