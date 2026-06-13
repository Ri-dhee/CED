"use client";

import { useMemo } from "react";
import { Domain, getStatusFromScore, getStatusColor, getStatusBg, ScoreStatus, isConfidenceReliable } from "@/lib/grme-data";

interface InsightsPanelProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  getDomainConfidence?: (domainId: string) => number;
  getDomainScoreForYear: (domainId: string, year: number) => number;
  selectedYear: number;
  availableYears: number[];
  confidence: number;
  filled: number;
  total: number;
}

interface Insight {
  icon: string;
  label: string;
  value: string;
  color: string;
  bg: string;
}

const STATUS_ORDER: ScoreStatus[] = ["Critical", "Developing", "Progressive", "Exemplary"];

export default function InsightsPanel({
  domains,
  getDomainScore,
  getDomainConfidence,
  getDomainScoreForYear,
  selectedYear,
  availableYears,
  confidence,
  filled,
  total,
}: InsightsPanelProps) {
  const insights = useMemo(() => {
    const domainScores = domains.map((d) => ({
      domain: d,
      score: getDomainScore(d.id),
      confidence: getDomainConfidence?.(d.id) ?? 100,
    }));

    // Only consider reliable domains for ranking insights
    const reliable = domainScores.filter((ds) =>
      isConfidenceReliable(ds.confidence)
    );

    const sorted = [...domainScores].sort((a, b) => b.score - a.score);
    const reliableSorted = [...reliable].sort((a, b) => b.score - a.score);
    const strongest = reliableSorted[0] || sorted[0];
    const weakest = sorted.filter(
      (ds) =>
        isConfidenceReliable(ds.confidence) && ds.domain.id !== strongest?.domain.id
    ).pop() || sorted[sorted.length - 1];

    const allHighest = sorted[0]?.score ?? 0;
    const allLowest = sorted[sorted.length - 1]?.score ?? 0;
    const spread = Math.round(allHighest - allLowest);

    const result: Insight[] = [];

    if (confidence < 80) {
      result.push({
        icon: "⚠️",
        label: "Data Status",
        value: `Preliminary (${confidence}% confidence, ${filled}/${total} indicators)`,
        color: confidence < 50 ? "#dc2626" : "#d97706",
        bg: confidence < 50 ? "#fef2f2" : "#fffbeb",
      });
    }

    // Strongest domain (from reliable set only)
    if (strongest) {
      const status = getStatusFromScore(strongest.score);
      const preliminaryNote =
        !isConfidenceReliable(strongest.confidence) ? ` (${strongest.confidence}% conf)` : "";
      result.push({
        icon: "🏆",
        label: "Strongest Domain",
        value: `${strongest.domain.shortName} (${Math.round(strongest.score)})${preliminaryNote}`,
        color: getStatusColor(status),
        bg: getStatusBg(status),
      });
    }

    // Weakest domain (exclude dom with insufficient confidence)
    if (weakest && weakest.domain.id !== strongest?.domain.id) {
      const status = getStatusFromScore(weakest.score);
      const preliminaryNote =
        !isConfidenceReliable(weakest.confidence) ? ` (${weakest.confidence}% conf)` : "";
      result.push({
        icon: "🎯",
        label: "Needs Attention",
        value: `${weakest.domain.shortName} (${Math.round(weakest.score)})${preliminaryNote}`,
        color: getStatusColor(status),
        bg: getStatusBg(status),
      });
    }

    // Year-over-year changes (prefer reliable domains for highlights)
    const previousYear = availableYears
      .filter((y) => y < selectedYear)
      .sort((a, b) => b - a)[0];

    if (previousYear) {
      const changes = domainScores.map((ds) => ({
        domain: ds.domain,
        current: ds.score,
        previous: getDomainScoreForYear(ds.domain.id, previousYear),
        confidence: ds.confidence,
      }));

      const improved = changes
        .filter((c) => c.current > c.previous)
        .sort((a, b) => (b.current - b.previous) - (a.current - a.previous));

      const declined = changes
        .filter((c) => c.current < c.previous)
        .sort((a, b) => (a.current - a.previous) - (b.current - b.previous));

      // Prefer reliable domains for Most Improved
      const topImproved = improved.find((c) =>
        isConfidenceReliable(c.confidence)
      ) || improved[0];
      if (topImproved) {
        const diff = Math.round(topImproved.current - topImproved.previous);
        const flag = !isConfidenceReliable(topImproved.confidence)
          ? ` (${topImproved.confidence}% conf)`
          : "";
        result.push({
          icon: "📈",
          label: "Most Improved",
          value: `${topImproved.domain.shortName} (+${diff})${flag}`,
          color: "#059669",
          bg: "#ecfdf5",
        });
      }

      // Prefer reliable domains for Biggest Decline
      const topDeclined = declined.find((c) =>
        isConfidenceReliable(c.confidence)
      ) || declined[0];
      if (topDeclined) {
        const diff = Math.round(topDeclined.current - topDeclined.previous);
        const flag = !isConfidenceReliable(topDeclined.confidence)
          ? ` (${topDeclined.confidence}% conf)`
          : "";
        result.push({
          icon: "📉",
          label: "Biggest Decline",
          value: `${topDeclined.domain.shortName} (${diff})${flag}`,
          color: "#dc2626",
          bg: "#fef2f2",
        });
      }
    }

    // Balance check
    if (sorted.length > 0) {
      const balanceStatus =
        spread >= 40 ? "Critical" : spread >= 25 ? "Developing" : "Progressive";
      result.push({
        icon: "⚖️",
        label: "Balance Check",
        value:
          spread >= 40
            ? `Highly uneven (${spread} pt spread)`
            : spread >= 25
              ? `Moderately uneven (${spread} pt spread)`
              : `Balanced (${spread} pt spread)`,
        color: getStatusColor(balanceStatus),
        bg: getStatusBg(balanceStatus),
      });
    }

    // Status distribution
    const statusCounts: Record<ScoreStatus, number> = {
      Critical: 0,
      Developing: 0,
      Progressive: 0,
      Exemplary: 0,
    };
    domainScores.forEach(({ score }) => {
      statusCounts[getStatusFromScore(score)]++;
    });

    const dominantStatus = STATUS_ORDER.filter((s) => statusCounts[s] > 0).pop();
    if (dominantStatus) {
      result.push({
        icon: "📊",
        label: "Status Distribution",
        value: `${statusCounts.Exemplary}E · ${statusCounts.Progressive}P · ${statusCounts.Developing}D · ${statusCounts.Critical}C`,
        color: getStatusColor(dominantStatus),
        bg: getStatusBg(dominantStatus),
      });
    }

    return result;
  }, [domains, getDomainScore, getDomainConfidence, getDomainScoreForYear, selectedYear, availableYears, confidence, filled, total]);

  if (insights.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Key Insights</h3>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-gray-50"
          >
            <span className="text-lg flex-shrink-0">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                {insight.label}
              </div>
              <div className="text-sm font-semibold text-gray-800 truncate">
                {insight.value}
              </div>
            </div>
            <div
              className="w-2 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: insight.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
