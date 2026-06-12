"use client";

import { useMemo } from "react";
import { Domain, getStatusFromScore, getStatusColor } from "@/lib/grme-data";

interface DataQualityBarProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  getDataEntryStats: () => {
    filled: number;
    total: number;
    missing: number;
    percentage: number;
    confidence: number;
  };
}

export default function DataQualityBar({
  domains,
  getDomainScore,
  getDataEntryStats,
}: DataQualityBarProps) {
  const stats = getDataEntryStats();

  const domainCompletion = useMemo(() => {
    return domains.map((domain) => {
      const indicators = domain.subdomains.flatMap((s) => s.indicators);
      const filled = indicators.length; // all indicators count
      const score = getDomainScore(domain.id);
      const status = getStatusFromScore(score);
      return {
        id: domain.id,
        name: domain.shortName,
        color: domain.color,
        score,
        status,
        indicatorCount: indicators.length,
      };
    });
  }, [domains, getDomainScore]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Data Quality</h3>
        <span className="text-xs font-semibold text-gray-500">
          {stats.filled} of {stats.total} indicators
        </span>
      </div>

      {/* Main progress bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${stats.percentage}%`,
            background:
              stats.percentage >= 75
                ? "linear-gradient(90deg, #059669, #10b981)"
                : stats.percentage >= 50
                  ? "linear-gradient(90deg, #d97706, #f59e0b)"
                  : stats.percentage >= 25
                    ? "linear-gradient(90deg, #ea580c, #f97316)"
                    : "linear-gradient(90deg, #dc2626, #ef4444)",
          }}
        />
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/20 to-transparent"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      {/* Domain breakdown mini bars */}
      <div className="flex gap-1 h-2">
        {domainCompletion.map((domain) => {
          const width = (1 / domainCompletion.length) * 100;
          return (
            <div
              key={domain.id}
              className="rounded-full transition-all duration-500"
              style={{
                width: `${width}%`,
                backgroundColor: domain.color,
                opacity: 0.3 + (domain.score / 100) * 0.7,
              }}
              title={`${domain.name}: ${Math.round(domain.score)}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[11px] text-gray-500">
          {stats.percentage >= 75
            ? "Excellent coverage"
            : stats.percentage >= 50
              ? "Good coverage — keep going"
              : stats.percentage >= 25
                ? "Partial data — gaps remain"
                : "Limited data — enter indicators"}
        </span>
        <span className="text-[11px] font-bold tabular-nums" style={{
          color: stats.percentage >= 75 ? "#059669" : stats.percentage >= 50 ? "#d97706" : stats.percentage >= 25 ? "#ea580c" : "#dc2626"
        }}>
          Confidence {stats.confidence}%
        </span>
      </div>
      <div className="mt-1 text-[10px] text-gray-400">
        {stats.missing} indicators still missing
      </div>
    </div>
  );
}
