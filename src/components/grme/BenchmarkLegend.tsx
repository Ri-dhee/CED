"use client";

import { ScoreStatus, getStatusColor, getStatusBg } from "@/lib/grme-data";

const THRESHOLDS: { range: string; status: ScoreStatus; description: string }[] = [
  { range: "75 – 100", status: "Exemplary", description: "Leading practice" },
  { range: "50 – 74", status: "Progressive", description: "On track" },
  { range: "25 – 49", status: "Developing", description: "Foundations being built" },
  { range: "0 – 24", status: "Critical", description: "Immediate action needed" },
];

export default function BenchmarkLegend() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Score Benchmarks</h3>
      <div className="space-y-2">
        {THRESHOLDS.map((t) => {
          const color = getStatusColor(t.status);
          const bg = getStatusBg(t.status);
          return (
            <div key={t.status} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color }}>
                    {t.status}
                  </span>
                  <span className="text-[10px] text-gray-400">({t.range})</span>
                </div>
                <span className="text-[10px] text-gray-500">{t.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
