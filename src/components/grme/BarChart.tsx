"use client";

import { useMemo, useState } from "react";
import { Domain, getStatusFromScore, getStatusColor, getStatusBg } from "@/lib/grme-data";

interface BarChartProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  comparisonDomainScores?: Record<string, number> | null;
  comparisonLabel?: string;
  onDomainClick?: (domainId: string) => void;
}

export default function BarChart({
  domains,
  getDomainScore,
  comparisonDomainScores = null,
  comparisonLabel,
  onDomainClick,
}: BarChartProps) {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const domainData = useMemo(() => {
    return domains
      .map((domain) => {
        const score = getDomainScore(domain.id);
        const comparison = comparisonDomainScores?.[domain.id] ?? null;
        return {
          ...domain,
          score,
          comparison,
          diff: comparison !== null ? score - comparison : null,
          status: getStatusFromScore(score),
          color: getStatusColor(getStatusFromScore(score)),
          bg: getStatusBg(getStatusFromScore(score)),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [domains, getDomainScore, comparisonDomainScores]);

  const maxScore = Math.max(...domainData.map((d) => d.score), 100);

  return (
    <div className="space-y-3">
      {comparisonDomainScores && comparisonLabel && (
        <div className="flex items-center justify-end gap-2 text-[10px] text-gray-400 -mt-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Overlay: {comparisonLabel}</span>
        </div>
      )}
      {domainData.map((domain) => {
        const isHovered = hoveredDomain === domain.id;
        const barWidth = (domain.score / maxScore) * 100;
        const compWidth = domain.comparison !== null ? (domain.comparison / maxScore) * 100 : 0;

        return (
          <div
            key={domain.id}
            className={`group p-3 rounded-xl border transition-all duration-200 ${
              isHovered
                ? "border-primary/30 bg-primary/5 shadow-sm"
                : "border-gray-100 hover:border-gray-200"
            } ${onDomainClick ? "cursor-pointer" : ""}`}
            onMouseEnter={() => setHoveredDomain(domain.id)}
            onMouseLeave={() => setHoveredDomain(null)}
            onClick={() => onDomainClick?.(domain.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: domain.color,
                    transform: isHovered ? "scale(1.2)" : "scale(1)",
                  }}
                />
                <span className={`text-sm font-medium transition-colors ${
                  isHovered ? "text-gray-900" : "text-gray-700"
                }`}>
                  {domain.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {domain.diff !== null && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      domain.diff > 0
                        ? "bg-green-50 text-green-600"
                        : domain.diff < 0
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {domain.diff > 0 ? "+" : ""}
                    {Math.round(domain.diff)}
                  </span>
                )}
                <span className="text-sm font-bold" style={{ color: domain.color }}>
                  {Math.round(domain.score)}
                </span>
              </div>
            </div>

            {/* Bar */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              {/* Comparison bar */}
              {domain.comparison !== null && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-30"
                  style={{
                    width: `${compWidth}%`,
                    backgroundColor: "#6366f1",
                  }}
                />
              )}
              {/* Main bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: domain.color,
                }}
              />
              {/* Shine effect */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/20 to-transparent"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            {/* Indicator count */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
              <span>
                {domain.subdomains
                  .flatMap((s) => s.indicators)
                  .filter((i) => {
                    const val = (domain as Record<string, unknown>)[`indicator_${i.id}`];
                    return val !== undefined;
                  }).length || "—"}{" "}
                / {domain.subdomains.flatMap((s) => s.indicators).length} indicators
              </span>
              {isHovered && onDomainClick && (
                <span className="text-primary font-medium">Click to view →</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
