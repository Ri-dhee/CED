"use client";

import { useMemo } from "react";
import { Domain, getStatusFromScore, getStatusColor, getStatusBg, ScoreStatus } from "@/lib/grme-data";

interface InsightsPanelProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  getDomainScoreForYear: (domainId: string, year: number) => number;
  selectedYear: number;
  availableYears: number[];
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
  getDomainScoreForYear,
  selectedYear,
  availableYears,
}: InsightsPanelProps) {
  const insights = useMemo(() => {
    const domainScores = domains.map((d) => ({
      domain: d,
      score: getDomainScore(d.id),
    }));

    const sorted = [...domainScores].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    const result: Insight[] = [];

    // Strongest domain
    if (strongest) {
      const status = getStatusFromScore(strongest.score);
      result.push({
        icon: "🏆",
        label: "Strongest Domain",
        value: `${strongest.domain.shortName} (${Math.round(strongest.score)})`,
        color: getStatusColor(status),
        bg: getStatusBg(status),
      });
    }

    // Weakest domain
    if (weakest && weakest !== strongest) {
      const status = getStatusFromScore(weakest.score);
      result.push({
        icon: "🎯",
        label: "Needs Attention",
        value: `${weakest.domain.shortName} (${Math.round(weakest.score)})`,
        color: getStatusColor(status),
        bg: getStatusBg(status),
      });
    }

    // Year-over-year changes
    const previousYear = availableYears
      .filter((y) => y < selectedYear)
      .sort((a, b) => b - a)[0];

    if (previousYear) {
      const changes = domains.map((d) => ({
        domain: d,
        current: getDomainScore(d.id),
        previous: getDomainScoreForYear(d.id, previousYear),
      }));

      const improved = changes
        .filter((c) => c.current > c.previous)
        .sort((a, b) => (b.current - b.previous) - (a.current - a.previous));

      const declined = changes
        .filter((c) => c.current < c.previous)
        .sort((a, b) => (a.current - a.previous) - (b.current - b.previous));

      if (improved.length > 0) {
        const top = improved[0];
        const diff = Math.round(top.current - top.previous);
        result.push({
          icon: "📈",
          label: "Most Improved",
          value: `${top.domain.shortName} (+${diff})`,
          color: "#059669",
          bg: "#ecfdf5",
        });
      }

      if (declined.length > 0) {
        const top = declined[0];
        const diff = Math.round(top.current - top.previous);
        result.push({
          icon: "📉",
          label: "Biggest Decline",
          value: `${top.domain.shortName} (${diff})`,
          color: "#dc2626",
          bg: "#fef2f2",
        });
      }
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
  }, [domains, getDomainScore, getDomainScoreForYear, selectedYear, availableYears]);

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
