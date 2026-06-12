"use client";

import { DOMAINS, getScoreColor } from "@/lib/grme-data";

interface RadarChartProps {
  scores: Record<string, number>;
  size?: number;
}

export default function RadarChart({ scores, size = 400 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const levels = 4;
  const angleStep = (2 * Math.PI) / DOMAINS.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getPolygonPoints = () => {
    return DOMAINS.map((domain, i) => {
      const score = scores[domain.id] ?? 50;
      const point = getPoint(i, score);
      return `${point.x},${point.y}`;
    }).join(" ");
  };

  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelValue = ((i + 1) / levels) * 100;
    return DOMAINS.map((_, j) => {
      const point = getPoint(j, levelValue);
      return `${point.x},${point.y}`;
    }).join(" ");
  });

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        aria-label="Radar chart showing domain scores"
      >
        {/* Background circles */}
        {gridLevels.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity={0.5 + (i / levels) * 0.5}
          />
        ))}

        {/* Axis lines */}
        {DOMAINS.map((_, i) => {
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

        {/* Score polygon */}
        <polygon
          points={getPolygonPoints()}
          fill="rgba(5, 150, 105, 0.2)"
          stroke="#059669"
          strokeWidth="2"
        />

        {/* Score points */}
        {DOMAINS.map((domain, i) => {
          const score = scores[domain.id] ?? 50;
          const point = getPoint(i, score);
          return (
            <circle
              key={domain.id}
              cx={point.x}
              cy={point.y}
              r="6"
              fill={getScoreColor(score)}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {DOMAINS.map((domain, i) => {
          const point = getPoint(i, 120);
          const score = Math.round(scores[domain.id] ?? 50);
          return (
            <g key={domain.id}>
              <text
                x={point.x}
                y={point.y - 8}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-gray-700"
              >
                {domain.shortName}
              </text>
              <text
                x={point.x}
                y={point.y + 6}
                textAnchor="middle"
                className="text-[10px] font-bold"
                fill={getScoreColor(score)}
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="text-xs font-semibold fill-gray-500"
        >
          GRME
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          className="text-lg font-bold fill-primary"
        >
          {Math.round(
            Object.values(scores).reduce((a, b) => a + b, 0) / DOMAINS.length
          )}
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-500">Critical (0-25)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-500">Developing (26-50)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-500">Progressive (51-75)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-500">Exemplary (76-100)</span>
        </div>
      </div>
    </div>
  );
}
