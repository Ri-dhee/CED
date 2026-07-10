"use client";

import { ScoreStatus, getStatusColor } from "@/lib/grme-data";

const THRESHOLDS: { range: string; status: ScoreStatus; description: string }[] = [
  { range: "75 – 100", status: "Exemplary", description: "Leading practice" },
  { range: "50 – 74", status: "Progressive", description: "On track" },
  { range: "25 – 49", status: "Developing", description: "Foundations being built" },
  { range: "0 – 24", status: "Critical", description: "Immediate action needed" },
];

export default function BenchmarkLegend() {
  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">Reference</div>
          <h3 className="mt-1 text-base font-bold text-slate-900">Score Benchmarks</h3>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">0-100 scale</span>
      </div>
      <p className="mb-3 text-[11px] leading-5 text-slate-500">
        Composite scores use geometric mean, so weak domains pull the result down more than a simple average.
      </p>
      <p className="mb-4 text-[11px] leading-5 text-slate-500">
        Scores below 80% data confidence are shown as preliminary.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {THRESHOLDS.map((t) => {
          const color = getStatusColor(t.status);
          return (
            <div key={t.status} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color }}>
                    {t.status}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-400 border border-slate-200">{t.range}</span>
                </div>
                <span className="text-[10px] text-slate-500">{t.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
