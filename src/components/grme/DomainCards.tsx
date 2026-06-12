"use client";

import { useMemo, useState } from "react";
import {
  Domain,
  AssessmentYear,
  getStatusFromScore,
  getStatusColor,
  getStatusBg,
} from "@/lib/grme-data";

interface DomainCardsProps {
  domains: Domain[];
  assessment: AssessmentYear;
  getDomainScore: (domainId: string) => number;
  getDomainScoreForYear?: (domainId: string, year: number) => number;
  previousYear?: number | null;
  selectedYear: number;
  onDomainClick?: (domainId: string) => void;
}

export default function DomainCards({
  domains,
  assessment,
  getDomainScore,
  getDomainScoreForYear,
  previousYear = null,
  selectedYear,
  onDomainClick,
}: DomainCardsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const data = useMemo(() => {
    return domains.map((domain) => {
      const score = getDomainScore(domain.id);
      const prevScore =
        previousYear && getDomainScoreForYear
          ? getDomainScoreForYear(domain.id, previousYear)
          : null;
      const trend = prevScore !== null ? score - prevScore : null;
      const status = getStatusFromScore(score);
      const color = getStatusColor(status);
      const bg = getStatusBg(status);
      const indicators = domain.subdomains.flatMap((s) => s.indicators);

      return {
        ...domain,
        score,
        trend,
        status,
        color,
        bg,
        indicatorCount: indicators.length,
      };
    });
  }, [domains, getDomainScore, getDomainScoreForYear, previousYear]);

  const sorted = [...data].sort((a, b) => b.score - a.score);

  const ringSize = 56;
  const stroke = 5;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sorted.map((domain) => {
        const isHovered = hovered === domain.id;
        const offset = circ - (domain.score / 100) * circ;

        return (
          <div
            key={domain.id}
            className={`group relative bg-white rounded-2xl border p-4 transition-all duration-200 ${
              isHovered
                ? "border-primary/30 shadow-md -translate-y-0.5"
                : "border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            } ${onDomainClick ? "cursor-pointer" : ""}`}
            onMouseEnter={() => setHovered(domain.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onDomainClick?.(domain.id)}
          >
            {/* Status badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: domain.bg, color: domain.color }}
              >
                {domain.status}
              </span>
              {domain.trend !== null && domain.trend !== 0 && (
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    domain.trend > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <svg
                    className={`w-2.5 h-2.5 ${domain.trend < 0 ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {domain.trend > 0 ? "+" : ""}
                  {Math.round(domain.trend)}
                </span>
              )}
            </div>

            {/* Ring + Score */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} className="transform -rotate-90">
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={r}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={stroke}
                  />
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={r}
                    fill="none"
                    stroke={domain.color}
                    strokeWidth={stroke}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: domain.color }}>
                    {Math.round(domain.score)}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{domain.name}</h4>
                <p className="text-[10px] text-gray-400">
                  {domain.indicatorCount} indicators
                </p>
              </div>
            </div>

            {/* Sub-domain breakdown */}
            <div className="space-y-1.5">
              {domain.subdomains.map((sub) => {
                const subIndicators = sub.indicators;
                const filledCount = subIndicators.filter(
                  (i) => assessment?.indicators?.[i.id]?.value !== undefined
                ).length;

                return (
                  <div key={sub.id} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(filledCount / (subIndicators.length || 1)) * 100}%`,
                          backgroundColor: domain.color,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 w-6 text-right tabular-nums">
                      {filledCount}/{subIndicators.length}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hover CTA */}
            {isHovered && onDomainClick && (
              <div className="absolute inset-x-0 bottom-0 p-3 pt-0">
                <div className="text-[10px] text-primary font-semibold text-center">
                  Click to enter data →
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
