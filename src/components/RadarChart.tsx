"use client";

import { DOMAINS, getStatusColor, getStatusScore, getStatus } from "@/lib/grme-data";

interface RadarChartProps {
  getDomainScore: (domainId: string) => number;
  size?: number;
}

export default function RadarChart({ getDomainScore, size = 400 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.65;
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

  const scores = DOMAINS.map((d) => getDomainScore(d.id));

  const getPolygonPoints = () => {
    return scores.map((score, i) => {
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

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgStatus = getStatus(avgScore, { benchmark: { critical: "0", developing: "25", progressive: "50", exemplary: "75" } } as any);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        aria-label="Radar chart showing domain scores"
      >
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

        <polygon
          points={getPolygonPoints()}
          fill="rgba(5, 150, 105, 0.15)"
          stroke="#059669"
          strokeWidth="2.5"
        />

        {DOMAINS.map((domain, i) => {
          const score = scores[i];
          const point = getPoint(i, score);
          const color = getStatusColor(getStatus(score, { benchmark: { critical: "0", developing: "25", progressive: "50", exemplary: "75" } } as any));
          return (
            <g key={domain.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill={color}
                stroke="white"
                strokeWidth="2.5"
              />
            </g>
          );
        })}

        {DOMAINS.map((domain, i) => {
          const point = getPoint(i, 125);
          const score = Math.round(scores[i]);
          const color = getStatusColor(getStatus(score, { benchmark: { critical: "0", developing: "25", progressive: "50", exemplary: "75" } } as any));
          return (
            <g key={domain.id}>
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="text-[11px] font-semibold"
                fill="#374151"
              >
                {domain.shortName}
              </text>
              <text
                x={point.x}
                y={point.y + 6}
                textAnchor="middle"
                className="text-[13px] font-bold"
                fill={color}
              >
                {score}
              </text>
            </g>
          );
        })}

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
    </div>
  );
}
