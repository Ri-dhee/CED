"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";

interface TrendChartProps {
  years: number[];
  overallScores: Record<number, number>;
  domainScores: Record<number, Record<string, number>>;
  domainLabels: Record<string, string>;
  domainColors: Record<string, string>;
  comparabilityWarning?: string | null;
}

// ── Custom Tooltip ──────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-700">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-900">
              {Math.round(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom Legend ────────────────────────────────────────────────

function ChartLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] text-slate-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────

function OverviewTab({
  sortedYears,
  overallScores,
}: {
  sortedYears: number[];
  overallScores: Record<number, number>;
}) {
  const data = useMemo(
    () =>
      sortedYears.map((y) => ({
        year: String(y),
        score: Math.round(overallScores[y] || 0),
      })),
    [sortedYears, overallScores]
  );

  const first = overallScores[sortedYears[0]] || 0;
  const last = overallScores[sortedYears[sortedYears.length - 1]] || 0;
  const diff = last - first;
  const avg = sortedYears.reduce((s, y) => s + (overallScores[y] || 0), 0) / sortedYears.length;
  const max = Math.max(...sortedYears.map((y) => overallScores[y] || 0));
  const min = Math.min(...sortedYears.map((y) => overallScores[y] || 0));

  return (
    <div className="space-y-5">
      {sortedYears.length >= 2 ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#475569" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="4 4" label={{ value: "50", position: "right", fontSize: 10, fill: "#d1d5db" }} />
            <Area
              type="monotone"
              dataKey="score"
              name="Overall"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ r: 4, fill: "white", strokeWidth: 2, stroke: "#6366f1" }}
              activeDot={{ r: 6, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Add at least 2 years to see trends
        </div>
      )}

      {/* Stats */}
      {sortedYears.length >= 2 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: `${sortedYears[0]}`, value: Math.round(first), color: "text-slate-800" },
            { label: `${sortedYears[sortedYears.length - 1]}`, value: Math.round(last), color: "text-indigo-700" },
            {
              label: "Change",
              value: `${diff > 0 ? "+" : ""}${Math.round(diff)}`,
              color: diff > 0 ? "text-emerald-700" : diff < 0 ? "text-rose-600" : "text-slate-500",
            },
            { label: "Average", value: Math.round(avg), color: "text-sky-700" },
            { label: "Range", value: `${Math.round(min)}–${Math.round(max)}`, color: "text-slate-700" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-slate-50 p-3 text-center">
              <div className="mb-1 text-[11px] font-medium text-slate-500">{stat.label}</div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Domains Tab ──────────────────────────────────────────────────

function DomainsTab({
  sortedYears,
  domainScores,
  domainLabels,
  domainColors,
}: {
  sortedYears: number[];
  domainScores: Record<number, Record<string, number>>;
  domainLabels: Record<string, string>;
  domainColors: Record<string, string>;
}) {
  const domainIds = Object.keys(domainLabels);

  const data = useMemo(
    () =>
      sortedYears.map((y) => {
        const row: Record<string, string | number> = { year: String(y) };
        domainIds.forEach((id) => {
          row[domainLabels[id]] = Math.round(domainScores[y]?.[id] || 0);
        });
        return row;
      }),
    [sortedYears, domainScores, domainLabels, domainIds]
  );

  const lineColors = useMemo(
    () => domainIds.map((id) => domainColors[id] || "#6b7280"),
    [domainIds, domainColors]
  );

  return (
    <div className="space-y-6">
      {sortedYears.length >= 2 ? (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend content={<ChartLegend />} />
            {domainIds.map((id, i) => (
              <Line
                key={id}
                type="monotone"
                dataKey={domainLabels[id]}
                name={domainLabels[id]}
                stroke={lineColors[i]}
                strokeWidth={2}
                dot={{ r: 3, fill: "white", strokeWidth: 2 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Add at least 2 years to see trends
        </div>
      )}

      {/* Domain sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {domainIds.map((id) => {
          const values = sortedYears.map((y) => domainScores[y]?.[id] || 0);
          const color = domainColors[id] || "#6b7280";
          const first = values[0] || 0;
          const last = values[values.length - 1] || 0;
          const diff = last - first;

          const sparkData = sortedYears.map((y, i) => ({
            year: String(y),
            score: values[i],
          }));

          return (
            <div key={id} className="rounded-2xl border border-slate-100 bg-white p-3 transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {domainLabels[id]}
                  </span>
                </div>
                {sortedYears.length >= 2 && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      diff > 0
                        ? "bg-green-50 text-green-600"
                        : diff < 0
                          ? "bg-red-50 text-red-500"
                        : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {Math.round(diff)}
                  </span>
                )}
              </div>
              <div className="text-xl font-bold mb-1" style={{ color }}>
                {Math.round(last)}
              </div>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={color}
                    strokeWidth={1.5}
                    fill={`url(#spark-${id})`}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Heatmap Tab ──────────────────────────────────────────────────

function HeatmapTab({
  sortedYears,
  domainScores,
  domainLabels,
  domainColors,
}: {
  sortedYears: number[];
  domainScores: Record<number, Record<string, number>>;
  domainLabels: Record<string, string>;
  domainColors: Record<string, string>;
}) {
  const domainIds = Object.keys(domainLabels);

  const getHeatColor = (score: number) => {
    if (score >= 80) return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
    if (score >= 60) return { bg: "#d9f99d", text: "#3f6212", border: "#bef264" };
    if (score >= 40) return { bg: "#fef9c3", text: "#854d0e", border: "#fef08a" };
    if (score >= 20) return { bg: "#fed7aa", text: "#9a3412", border: "#fdba74" };
    return { bg: "#fecaca", text: "#991b1b", border: "#fca5a5" };
  };

  if (sortedYears.length < 2) {
    return (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
          Add at least 2 years to see heatmap
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left py-3 px-4 font-semibold text-slate-500 uppercase tracking-[0.22em] text-[10px]">
                Domain
              </th>
              {sortedYears.map((y) => (
                <th
                  key={y}
                  className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-[0.22em] text-[10px]"
                >
                  {y}
                </th>
              ))}
              <th className="text-center py-3 px-4 font-semibold text-slate-500 uppercase tracking-[0.22em] text-[10px]">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {domainIds.map((id) => {
              const first = domainScores[sortedYears[0]]?.[id] || 0;
              const last = domainScores[sortedYears[sortedYears.length - 1]]?.[id] || 0;
              const diff = last - first;
              const color = domainColors[id] || "#6b7280";
              return (
                <tr key={id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium text-slate-700">{domainLabels[id]}</span>
                    </div>
                  </td>
                  {sortedYears.map((y) => {
                    const score = domainScores[y]?.[id] || 0;
                    const heat = getHeatColor(score);
                    return (
                      <td key={y} className="py-3 px-4 text-center">
                        <span
                          className="inline-block px-2.5 py-1 rounded-md font-semibold text-xs"
                          style={{
                            backgroundColor: heat.bg,
                            color: heat.text,
                            border: `1px solid ${heat.border}`,
                          }}
                        >
                          {Math.round(score)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {diff > 0 && (
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {diff < 0 && (
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span
                        className={`text-xs font-bold ${
                          diff > 0
                            ? "text-green-600"
                            : diff < 0
                              ? "text-red-500"
                              : "text-slate-500"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {Math.round(diff)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Overall row */}
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
              <td className="py-3 px-4 text-gray-800">Overall</td>
              {sortedYears.map((y) => {
                const vals = domainIds.map((id) => domainScores[y]?.[id] || 0);
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                const heat = getHeatColor(avg);
                return (
                  <td key={y} className="py-3 px-4 text-center">
                    <span
                      className="inline-block px-2.5 py-1 rounded-md font-bold text-xs"
                      style={{
                        backgroundColor: heat.bg,
                        color: heat.text,
                        border: `1px solid ${heat.border}`,
                      }}
                    >
                      {Math.round(avg)}
                    </span>
                  </td>
                );
              })}
              <td className="py-3 px-4 text-center">
                {(() => {
                  const firstVals = domainIds.map((id) => domainScores[sortedYears[0]]?.[id] || 0);
                  const lastVals = domainIds.map((id) => domainScores[sortedYears[sortedYears.length - 1]]?.[id] || 0);
                  const diff =
                    lastVals.reduce((a, b) => a + b, 0) / lastVals.length -
                    firstVals.reduce((a, b) => a + b, 0) / firstVals.length;
                  return (
                    <span
                      className={`text-xs font-bold ${
                        diff > 0 ? "text-emerald-700" : diff < 0 ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {diff > 0 ? "+" : ""}
                      {Math.round(diff)}
                    </span>
                  );
                })()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {[
          { range: "80–100", label: "Excellent", color: "#dcfce7", text: "#166534" },
          { range: "60–79", label: "Good", color: "#d9f99d", text: "#3f6212" },
          { range: "40–59", label: "Moderate", color: "#fef9c3", text: "#854d0e" },
          { range: "20–39", label: "Needs Work", color: "#fed7aa", text: "#9a3412" },
          { range: "0–19", label: "Critical", color: "#fecaca", text: "#991b1b" },
        ].map((item) => (
          <span
            key={item.range}
            className="inline-flex items-center gap-1 px-2 py-1 rounded"
            style={{ backgroundColor: item.color, color: item.text }}
          >
            {item.range} {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export default function TrendChart({
  years,
  overallScores,
  domainScores,
  domainLabels,
  domainColors,
  comparabilityWarning,
}: TrendChartProps) {
  const [activeView, setActiveView] = useState<"overview" | "domains" | "heatmap">("overview");

  if (years.length === 0) return null;

  const sortedYears = [...years].sort((a, b) => a - b);

  // Summary
  const firstYear = sortedYears[0];
  const lastYear = sortedYears[sortedYears.length - 1];
  const firstOverall = overallScores[firstYear] || 0;
  const lastOverall = overallScores[lastYear] || 0;
  const overallDiff = lastOverall - firstOverall;

  const domainChanges = Object.keys(domainLabels).map((id) => ({
    id,
    label: domainLabels[id],
    diff: (domainScores[lastYear]?.[id] || 0) - (domainScores[firstYear]?.[id] || 0),
  }));
  const best = domainChanges.reduce((a, b) => (a.diff > b.diff ? a : b));
  const worst = domainChanges.reduce((a, b) => (a.diff < b.diff ? a : b));

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500">Analytics</div>
            <h3 className="mt-1 text-base font-bold text-slate-900">Score Trends</h3>
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-0.5">
            {(
              [
                { key: "overview", label: "Overview" },
                { key: "domains", label: "Domains" },
                { key: "heatmap", label: "Heatmap" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeView === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary pills */}
        {sortedYears.length >= 2 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                overallDiff > 0
                  ? "bg-green-50 text-green-700"
                  : overallDiff < 0
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-50 text-slate-600"
              }`}
            >
              Overall: {overallDiff > 0 ? "+" : ""}
              {Math.round(overallDiff)} pts
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold">
              ↑ {best.label} (+{Math.round(best.diff)})
            </span>
            {worst.diff < 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-semibold">
                ↓ {worst.label} ({Math.round(worst.diff)})
              </span>
            )}
          </div>
        )}
        {comparabilityWarning && (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {comparabilityWarning}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {activeView === "overview" && (
          <OverviewTab sortedYears={sortedYears} overallScores={overallScores} />
        )}
        {activeView === "domains" && (
          <DomainsTab
            sortedYears={sortedYears}
            domainScores={domainScores}
            domainLabels={domainLabels}
            domainColors={domainColors}
          />
        )}
        {activeView === "heatmap" && (
          <HeatmapTab
            sortedYears={sortedYears}
            domainScores={domainScores}
            domainLabels={domainLabels}
            domainColors={domainColors}
          />
        )}
      </div>
    </div>
  );
}
