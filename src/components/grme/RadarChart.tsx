"use client";

import { useState, useMemo } from "react";
import { Domain, getStatusFromScore, getStatusColor, isConfidenceReliable } from "@/lib/grme-data";

interface RadarChartProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  getDomainConfidence?: (domainId: string) => number;
  comparisonDomainScores?: Record<string, number> | null;
  comparisonLabel?: string;
  comparisonSeries?: Array<{
    label: string;
    scores: Record<string, number>;
    color: string;
  }> | null;
  size?: number;
  onDomainClick?: (domainId: string) => void;
}

export default function RadarChart({
  domains,
  getDomainScore,
  getDomainConfidence,
  comparisonDomainScores = null,
  comparisonLabel,
  comparisonSeries = null,
  size = 400,
  onDomainClick,
}: RadarChartProps) {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const center = size / 2;
  const radius = (size / 2) * 0.65;
  const levels = 4;
  const angleStep = domains.length > 0 ? (2 * Math.PI) / domains.length : 0;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const scores = useMemo(
    () => domains.map((d) => getDomainScore(d.id)),
    [domains, getDomainScore]
  );

  const comparisonScores = useMemo(() => {
    if (!comparisonDomainScores) return null;
    return domains.map((d) => comparisonDomainScores[d.id] || 0);
  }, [domains, comparisonDomainScores]);

  const multiComparisonSeries = useMemo(() => {
    if (!comparisonSeries) return null;
    return comparisonSeries.map((series) => ({
      ...series,
      values: domains.map((d) => series.scores[d.id] || 0),
    }));
  }, [domains, comparisonSeries]);

  const getPolygonPoints = (vals: number[]) => {
    return vals
      .map((score, i) => {
        const point = getPoint(i, score);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  };

  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelValue = ((i + 1) / levels) * 100;
    return domains
      .map((_, j) => {
        const point = getPoint(j, levelValue);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  });

  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgStatus = getStatusFromScore(avgScore);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const hoveredIndex = hoveredDomain
    ? domains.findIndex((d) => d.id === hoveredDomain)
    : -1;

  if (domains.length === 0) return null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        role="img"
        aria-label="Radar chart showing domain scores"
        onMouseMove={handleMouseMove}
      >
        <title>GRME Domain Scores</title>
        <desc>Radar chart displaying scores across {domains.length} domains</desc>

        {/* Grid */}
        {gridLevels.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity={0.4 + (i / levels) * 0.6}
          />
        ))}

        {/* Axis lines */}
        {domains.map((_, i) => {
          const point = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Comparison polygon (single) */}
        {comparisonScores && !multiComparisonSeries && (
          <polygon
            points={getPolygonPoints(comparisonScores)}
            fill="rgba(99, 102, 241, 0.08)"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="6 3"
            className="transition-all duration-300"
          />
        )}

        {/* Comparison polygons (multi-series) */}
        {multiComparisonSeries &&
          multiComparisonSeries.map((series, idx) => (
            <polygon
              key={series.label}
              points={getPolygonPoints(series.values)}
              fill={`${series.color}22`}
              stroke={series.color}
              strokeWidth="2"
              strokeDasharray={idx === 0 ? "6 3" : "2 2"}
              className="transition-all duration-300"
              opacity={0.75}
            />
          ))}

        {/* Main polygon */}
        <polygon
          points={getPolygonPoints(scores)}
          fill="rgba(5, 150, 105, 0.15)"
          stroke="#059669"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {domains.map((domain, i) => {
          const score = scores[i];
          const point = getPoint(i, score);
          const status = getStatusFromScore(score);
          const color = getStatusColor(status);
          const isHovered = hoveredDomain === domain.id;
          const confidence = getDomainConfidence?.(domain.id) ?? 100;
          const reliable = isConfidenceReliable(confidence);

          return (
            <g
              key={domain.id}
              onMouseEnter={() => setHoveredDomain(domain.id)}
              onMouseLeave={() => setHoveredDomain(null)}
              onClick={() => onDomainClick?.(domain.id)}
              className={onDomainClick ? "cursor-pointer" : ""}
            >
              {/* Hover hit area */}
              <circle cx={point.x} cy={point.y} r="16" fill="transparent" />
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? 9 : 7}
                fill={color}
                stroke="white"
                strokeWidth="2.5"
                className="transition-all duration-200"
                opacity={reliable ? 1 : 0.5}
                style={reliable ? undefined : { filter: "grayscale(1)" }}
              />
              {isHovered && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="14"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.3"
                />
              )}
              {/* Reliability ghost ring for low-confidence */}
              {!reliable && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="11"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  opacity="0.5"
                />
              )}
            </g>
          );
        })}

        {/* Labels */}
        {domains.map((domain, i) => {
          const point = getPoint(i, 125);
          const score = Math.round(scores[i]);
          const status = getStatusFromScore(score);
          const color = getStatusColor(status);
          const isHovered = hoveredDomain === domain.id;
          const confidence = getDomainConfidence?.(domain.id) ?? 100;
          const reliable = isConfidenceReliable(confidence);

          return (
            <g key={domain.id} opacity={reliable ? 1 : 0.55}>
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className={`text-[11px] font-semibold transition-all duration-200 ${
                  isHovered ? "fill-gray-900" : "fill-gray-500"
                }`}
              >
                {domain.shortName}
                {!reliable && (
                  <tspan
                    dx="3"
                    className="fill-amber-500"
                    style={{ textDecoration: "none" }}
                  >
                    (?)
                  </tspan>
                )}
              </text>
              <text
                x={point.x}
                y={point.y + 6}
                textAnchor="middle"
                className={`text-[13px] font-bold transition-all duration-200 ${
                  isHovered ? "fill-gray-900" : ""
                }`}
                style={!isHovered ? { fill: color } : undefined}
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Center score */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="text-[11px] font-semibold"
          fill="#9ca3af"
        >
          GRME
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          className="text-[22px] font-bold"
          fill={getStatusColor(avgStatus)}
        >
          {Math.round(avgScore)}
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredDomain && (
        <div
          className="absolute pointer-events-none z-50 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs"
          style={{
            left: Math.min(tooltipPos.x + 12, size - 140),
            top: tooltipPos.y - 10,
          }}
        >
          <div className="font-semibold text-gray-900 mb-1">
            {domains.find((d) => d.id === hoveredDomain)?.name}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: getStatusColor(
                  getStatusFromScore(scores[hoveredIndex])
                ),
              }}
            />
            <span className="text-gray-600">Score:</span>
            <span className="font-bold text-gray-900">
              {Math.round(scores[hoveredIndex])}
            </span>
          </div>
          {(() => {
            const conf = getDomainConfidence?.(hoveredDomain!) ?? 100;
            return (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-gray-500">Confidence:</span>
                <span
                  className={`font-semibold ${
                    isConfidenceReliable(conf)
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {conf}%
                </span>
                {!isConfidenceReliable(conf) && (
                  <span className="text-amber-500 text-[10px]">(preliminary)</span>
                )}
              </div>
            );
          })()}
          {(comparisonScores || multiComparisonSeries) && (
            <div className="flex items-center gap-2 mt-1">
              {comparisonScores && !multiComparisonSeries && (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-gray-600">{comparisonLabel || "Previous"}:</span>
                  <span className="font-bold text-indigo-600">
                    {Math.round(comparisonScores[hoveredIndex])}
                  </span>
                </>
              )}
              {multiComparisonSeries && (
                <div className="space-y-1">
                  {multiComparisonSeries.map((series) => (
                    <div key={series.label} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: series.color }} />
                      <span className="text-gray-600">{series.label}:</span>
                      <span className="font-bold" style={{ color: series.color }}>
                        {Math.round(series.values[hoveredIndex])}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {onDomainClick && (
            <div className="text-gray-400 mt-1 text-[10px]">Click to view details</div>
          )}
        </div>
      )}

      {/* Comparison legend */}
      {comparisonScores && !multiComparisonSeries && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-gray-500">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-500 rounded border-dashed" style={{ borderTop: "2px dashed #6366f1", height: 0 }} />
            <span className="text-gray-500">{comparisonLabel || "Previous"}</span>
          </div>
        </div>
      )}
      {multiComparisonSeries && (
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-3 text-[10px] px-2">
          {multiComparisonSeries.map((series) => (
            <div key={series.label} className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: series.color }} />
              <span className="text-gray-500">{series.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
