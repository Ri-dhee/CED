"use client";

import { useState } from "react";
import {
  Indicator,
  STAKEHOLDERS,
  calculateIndicatorScore,
  getStatusFromScore,
  getStatusColor,
  getStatusBg,
  isLowerBetter,
} from "@/lib/grme-data";

const STAKEHOLDER_NAME_BY_ID = new Map(
  STAKEHOLDERS.map((stakeholder) => [stakeholder.id, stakeholder.name])
);

interface DataEntryFormProps {
  indicator: Indicator;
  value: number | string | boolean | null;
  notes?: string;
  onValueChange: (value: number | string, notes?: string) => void;
}

export default function DataEntryForm({
  indicator,
  value,
  notes,
  onValueChange,
}: DataEntryFormProps) {
  const [inputValue, setInputValue] = useState<string>(() =>
    value !== null && value !== undefined ? String(value) : ""
  );
  const [noteText, setNoteText] = useState(() => notes || "");
  const [showBenchmark, setShowBenchmark] = useState(false);

  const numericValue =
    indicator.dataType === "text"
      ? NaN
      : indicator.dataType === "boolean"
        ? inputValue === "true"
          ? 1
          : inputValue === "false"
            ? 0
            : NaN
        : parseFloat(inputValue);

  const score = !isNaN(numericValue)
    ? calculateIndicatorScore(numericValue, indicator)
    : null;

  const status = score !== null ? getStatusFromScore(score) : null;
  const color = status ? getStatusColor(status) : "#9ca3af";
  const bg = status ? getStatusBg(status) : "#f9fafb";

  const lowerBetter = isLowerBetter(indicator);

  const handleSubmit = () => {
    if (indicator.dataType === "text" || indicator.dataType === "boolean") {
      if (indicator.dataType === "boolean") {
        if (inputValue !== "true" && inputValue !== "false") return;
        onValueChange(inputValue === "true" ? 1 : 0, noteText || undefined);
      } else {
        onValueChange(inputValue, noteText || undefined);
      }
    } else if (!isNaN(numericValue)) {
      onValueChange(numericValue, noteText || undefined);
    }
  };

  const b = indicator.benchmark;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
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
            {indicator.validationStatus && indicator.validationStatus !== "validated" && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                {indicator.validationStatus === "draft" ? "Needs review" : "Reviewed"}
              </span>
            )}
            {lowerBetter && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-500">
                Lower is better
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">{indicator.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{indicator.description}</p>
          {indicator.stakeholderAccess && indicator.stakeholderAccess.length > 0 && (
            <p className="text-[10px] text-emerald-700 mt-1">
              Access: {indicator.stakeholderAccess.map((id) => STAKEHOLDER_NAME_BY_ID.get(id) || id).join(", ")}
            </p>
          )}
          {indicator.validationStatus === "draft" && (
            <p className="text-[10px] text-amber-600 mt-1">
              This indicator is a draft and should be reviewed by an expert before final use.
            </p>
          )}
        </div>
        {status && (
          <div className="shrink-0 text-center">
            <span
              className="text-xs font-bold px-2 py-1 rounded-lg block"
              style={{ backgroundColor: bg, color }}
            >
              {status}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">
              {Math.round(score!)} pts
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            {indicator.dataType === "boolean" ? (
              <select
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">Select yes/no</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input
                type={indicator.dataType === "text" ? "text" : "number"}
                step={indicator.dataType === "percentage" ? "1" : "0.1"}
                min={indicator.dataType === "percentage" ? "0" : undefined}
                max={indicator.dataType === "percentage" ? "100" : undefined}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter value (${indicator.unit})`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            )}
            {indicator.dataType !== "boolean" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {indicator.unit}
              </span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Save
          </button>
        </div>

        {indicator.dataType === "percentage" && (
          <input
            type="range"
            min="0"
            max="100"
            value={inputValue || "0"}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${color} ${inputValue || "0"}%, #e5e7eb ${inputValue || "0"}%)`,
            }}
          />
        )}

        <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-2">
          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showBenchmark ? "Hide" : "Show"} benchmark targets
          </button>
          {showBenchmark && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {(["critical", "developing", "progressive", "exemplary"] as const).map(
                (level) => {
                  const levelStatus = level.charAt(0).toUpperCase() + level.slice(1) as "Critical" | "Developing" | "Progressive" | "Exemplary";
                  return (
                    <div
                      key={level}
                      className={`text-center p-2 rounded-lg text-xs ${
                        status === levelStatus ? "ring-2 ring-offset-1" : ""
                      }`}
                      style={{
                        backgroundColor: getStatusBg(levelStatus),
                        color: getStatusColor(levelStatus),
                      }}
                    >
                      <div className="font-semibold capitalize">{level}</div>
                      <div className="opacity-75">
                        {b[level]}{indicator.unit}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add notes or evidence..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-white"
        />
      </div>
    </div>
  );
}
