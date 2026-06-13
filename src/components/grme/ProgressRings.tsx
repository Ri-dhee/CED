"use client";

import { useMemo } from "react";
import { Domain, getStatusFromScore, getStatusColor } from "@/lib/grme-data";

interface ProgressRingsProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  onDomainClick?: (domainId: string) => void;
}

export default function ProgressRings({
  domains,
  getDomainScore,
  onDomainClick,
}: ProgressRingsProps) {
  const data = useMemo(() => {
    return domains.map((domain) => {
      const score = getDomainScore(domain.id);
      const status = getStatusFromScore(score);
      const color = getStatusColor(status);
      return { ...domain, score, status, color };
    });
  }, [domains, getDomainScore]);

  const overallScore =
    data.reduce((sum, d) => sum + d.score, 0) / (data.length || 1);
  const overallColor = getStatusColor(getStatusFromScore(overallScore));

  const ringSize = 80;
  const strokeWidth = 6;

  const renderRing = (
    score: number,
    color: string,
    size: number,
    stroke: number
  ) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Overall ring */}
      <div className="flex items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          onClick={() => onDomainClick?.("overall")}
          role={onDomainClick ? "button" : undefined}
          tabIndex={onDomainClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onDomainClick?.("overall");
            }
          }}
        >
          {renderRing(overallScore, overallColor, 120, 8)}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: overallColor }}>
              {Math.round(overallScore)}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Overall</span>
          </div>
        </div>
      </div>

      {/* Domain rings grid */}
      <div className="grid grid-cols-4 gap-3">
        {data.map((domain) => (
          <div
            key={domain.id}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              onDomainClick
                ? "cursor-pointer hover:bg-gray-50"
                : ""
            }`}
            onClick={() => onDomainClick?.(domain.id)}
            role={onDomainClick ? "button" : undefined}
            tabIndex={onDomainClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onDomainClick?.(domain.id);
              }
            }}
          >
            <div className="relative flex items-center justify-center">
              {renderRing(domain.score, domain.color, ringSize, strokeWidth)}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: domain.color }}>
                  {Math.round(domain.score)}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 font-medium mt-1 text-center leading-tight">
              {domain.shortName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
