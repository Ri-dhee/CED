"use client";

import { useState } from "react";
import { Indicator, SubDomain, getScoreColor, getScoreLabel, SCORING_RUBRIC } from "@/lib/grme-data";

interface IndicatorScorerProps {
  subdomain: SubDomain;
  scores: Record<string, number>;
  onScoreChange: (indicatorId: string, score: number) => void;
}

export default function IndicatorScorer({
  subdomain,
  scores,
  onScoreChange,
}: IndicatorScorerProps) {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);

  const getRubric = (type: Indicator["type"]) => {
    switch (type) {
      case "Quantitative":
        return SCORING_RUBRIC.quantitative;
      case "Qualitative":
        return SCORING_RUBRIC.qualitative;
      case "Participatory":
        return SCORING_RUBRIC.participatory;
    }
  };

  return (
    <div className="space-y-3">
      {subdomain.indicators.map((indicator) => {
        const score = scores[indicator.id] ?? 50;
        const scoreColor = getScoreColor(score);
        const scoreLabel = getScoreLabel(score);
        const isExpanded = expandedIndicator === indicator.id;
        const rubric = getRubric(indicator.type);

        return (
          <div
            key={indicator.id}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          indicator.type === "Quantitative"
                            ? "#dbeafe"
                            : indicator.type === "Qualitative"
                            ? "#fef3c7"
                            : "#f3e8ff",
                        color:
                          indicator.type === "Quantitative"
                            ? "#1d4ed8"
                            : indicator.type === "Qualitative"
                            ? "#b45309"
                            : "#7c3aed",
                      }}
                    >
                      {indicator.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    {indicator.name}
                  </p>

                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) =>
                        onScoreChange(indicator.id, Number(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      style={{
                        background: `linear-gradient(to right, ${scoreColor} ${score}%, #e5e7eb ${score}%)`,
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-bold"
                        style={{ color: scoreColor }}
                      >
                        {Math.round(score)} - {scoreLabel}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedIndicator(isExpanded ? null : indicator.id)
                        }
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? "Hide rubric" : "Show rubric"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rubric expansion */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <p className="text-xs text-gray-500 mt-3 mb-2">
                  {indicator.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {rubric.map((r) => (
                    <div
                      key={r.range[0]}
                      className={`text-xs p-2 rounded-lg ${
                        score >= r.range[0] && score <= r.range[1]
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">
                        {r.range[0]}-{r.range[1]}:
                      </span>{" "}
                      {r.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
