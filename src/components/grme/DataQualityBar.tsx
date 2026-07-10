"use client";

import { useMemo } from "react";
import { Domain, getStatusFromScore } from "@/lib/grme-data";

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
    <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">Coverage</div>
          <h3 className="mt-1 text-base font-bold text-slate-900">Data Quality</h3>
        </div>
          <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {stats.filled} / {stats.total}
        </div>
      </div>

      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">{stats.percentage}%</div>
          <div className="text-xs text-slate-600">{stats.confidence}% confidence</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white px-3 py-2 text-right ring-1 ring-sky-100/60">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">Missing</div>
          <div className="text-sm font-bold text-slate-900">{stats.missing}</div>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="relative mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
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
      <div className="flex h-2 gap-1">
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

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-600">
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
    </div>
  );
}
