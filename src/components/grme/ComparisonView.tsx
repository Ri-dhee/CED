"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Domain } from "@/lib/grme-data";

interface ComparisonViewProps {
  domains: Domain[];
  currentYear: number;
  previousYear: number | null;
  getCurrentDomainScore: (domainId: string) => number;
  getPreviousDomainScore: (domainId: string) => number;
  comparabilityWarning?: string | null;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-gray-500">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-gray-900">
              {Math.round(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonView({
  domains,
  currentYear,
  previousYear,
  getCurrentDomainScore,
  getPreviousDomainScore,
  comparabilityWarning,
}: ComparisonViewProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  const chartData = useMemo(() => {
    return domains.map((domain) => {
      const current = getCurrentDomainScore(domain.id);
      const previous = getPreviousDomainScore(domain.id);
      const diff = current - previous;
      return {
        name: domain.shortName,
        [String(currentYear)]: Math.round(current),
        [String(previousYear)]: Math.round(previous),
        diff: Math.round(diff),
        diffPercent: previous > 0 ? ((diff / previous) * 100).toFixed(1) : "—",
      };
    });
  }, [domains, currentYear, previousYear, getCurrentDomainScore, getPreviousDomainScore]);

  const overallCurrent =
    domains.reduce((sum, d) => sum + getCurrentDomainScore(d.id), 0) /
    (domains.length || 1);
  const overallPrevious =
    domains.reduce((sum, d) => sum + getPreviousDomainScore(d.id), 0) /
    (domains.length || 1);
  const overallDiff = overallCurrent - overallPrevious;

  const sortedData = [...chartData].sort((a, b) => b.diff - a.diff);
  const improved = sortedData.filter((d) => d.diff > 0);
  const declined = sortedData.filter((d) => d.diff < 0);
  const unchanged = sortedData.filter((d) => d.diff === 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <div className="text-lg font-bold text-green-600">+{improved.length}</div>
          <div className="text-[10px] text-green-600 font-medium">Improved</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center">
          <div className="text-lg font-bold text-red-500">-{declined.length}</div>
          <div className="text-[10px] text-red-500 font-medium">Declined</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="text-lg font-bold text-gray-500">{unchanged.length}</div>
          <div className="text-[10px] text-gray-500 font-medium">Unchanged</div>
        </div>
      </div>

      {/* Overall change */}
      <div className={`rounded-lg p-4 text-center ${
        overallDiff > 0
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
          : overallDiff < 0
            ? "bg-gradient-to-r from-red-50 to-orange-50 border border-red-100"
            : "bg-gray-50 border border-gray-100"
      }`}>
        <div className="text-sm text-gray-500 mb-1">Overall Change</div>
        <div className={`text-3xl font-bold ${
          overallDiff > 0 ? "text-green-600" : overallDiff < 0 ? "text-red-500" : "text-gray-500"
        }`}>
          {overallDiff > 0 ? "+" : ""}{Math.round(overallDiff)} pts
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {Math.round(overallPrevious)} → {Math.round(overallCurrent)}
        </div>
      </div>

      {comparabilityWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {comparabilityWarning}
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
        {(["chart", "table"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === v
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {v === "chart" ? "Chart" : "Table"}
          </button>
        ))}
      </div>

      {/* Chart view */}
      {view === "chart" && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar
              dataKey={String(previousYear)}
              name={String(previousYear)}
              fill="#c7d2fe"
              radius={[0, 4, 4, 0]}
              barSize={12}
            />
            <Bar
              dataKey={String(currentYear)}
              name={String(currentYear)}
              radius={[0, 4, 4, 0]}
              barSize={12}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.diff > 0
                      ? "#22c55e"
                      : entry.diff < 0
                        ? "#ef4444"
                        : "#6366f1"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-500">Domain</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-500">{previousYear}</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-500">{currentYear}</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-500">Change</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.name} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="py-2 px-3 font-medium text-gray-700">{row.name}</td>
                  <td className="py-2 px-3 text-center text-gray-500">{row[String(previousYear)]}</td>
                  <td className="py-2 px-3 text-center font-bold text-gray-900">{row[String(currentYear)]}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`font-bold ${
                        row.diff > 0
                          ? "text-green-600"
                          : row.diff < 0
                            ? "text-red-500"
                            : "text-gray-400"
                      }`}
                    >
                      {row.diff > 0 ? "+" : ""}{row.diff}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
