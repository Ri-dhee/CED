"use client";

import { Domain, getStatusFromScore, getStatusColor } from "@/lib/grme-data";

interface RadarChartProps {
  domains: Domain[];
  getDomainScore: (domainId: string) => number;
  size?: number;
}

export default function RadarChart({
  domains,
  getDomainScore,
  size = 400,
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.65;
  const levels = 4;
  const angleStep = (2 * Math.PI) / domains.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const scores = domains.map((d) => getDomainScore(d.id));

  const getPolygonPoints = () => {
    return scores
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

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgStatus = getStatusFromScore(avgScore);

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

        <polygon
          points={getPolygonPoints()}
          fill="rgba(5, 150, 105, 0.15)"
          stroke="#059669"
          strokeWidth="2.5"
        />

        {domains.map((domain, i) => {
          const score = scores[i];
          const point = getPoint(i, score);
          const status = getStatusFromScore(score);
          const color = getStatusColor(status);
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

        {domains.map((domain, i) => {
          const point = getPoint(i, 125);
          const score = Math.round(scores[i]);
          const status = getStatusFromScore(score);
          const color = getStatusColor(status);
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
