"use client";

import { useState } from "react";
import {
  Indicator,
  IndicatorType,
  DataType,
  Direction,
} from "@/lib/grme-data";

interface IndicatorFormProps {
  indicator: Indicator;
  onSave: (indicator: Indicator) => void;
  onCancel: () => void;
}

const INDICATOR_TYPES: IndicatorType[] = [
  "Quantitative",
  "Qualitative",
  "Participatory",
];
const DATA_TYPES: DataType[] = [
  "percentage",
  "number",
  "ratio",
  "index",
  "text",
  "boolean",
];
const DIRECTIONS: Direction[] = ["higher", "lower"];
const VALIDATION_STATUSES = ["draft", "reviewed", "validated"] as const;

export default function IndicatorForm({
  indicator,
  onSave,
  onCancel,
}: IndicatorFormProps) {
  const [data, setData] = useState<Indicator>({
    ...indicator,
    benchmark: { ...indicator.benchmark },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.id.trim()) errs.id = "ID is required";
    if (!data.unit.trim()) errs.unit = "Unit is required";
    if (!data.benchmark.critical.trim()) errs.critical = "Required";
    if (!data.benchmark.developing.trim()) errs.developing = "Required";
    if (!data.benchmark.progressive.trim()) errs.progressive = "Required";
    if (!data.benchmark.exemplary.trim()) errs.exemplary = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {indicator.name ? "Edit Indicator" : "Add Indicator"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              errors.name ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. % of women who feel safe walking alone at night"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            ID *
          </label>
          <input
            type="text"
            value={data.id}
            onChange={(e) => setData({ ...data, id: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              errors.id ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. ss-1"
          />
          {errors.id && (
            <p className="text-xs text-red-500 mt-1">{errors.id}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Unit *
          </label>
          <input
            type="text"
            value={data.unit}
            onChange={(e) => setData({ ...data, unit: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              errors.unit ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. %, /10, per 10k"
          />
          {errors.unit && (
            <p className="text-xs text-red-500 mt-1">{errors.unit}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Type
          </label>
          <select
            value={data.type}
            onChange={(e) =>
              setData({ ...data, type: e.target.value as IndicatorType })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {INDICATOR_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Data Type
          </label>
          <select
            value={data.dataType}
            onChange={(e) =>
              setData({ ...data, dataType: e.target.value as DataType })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {DATA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Direction
          </label>
          <select
            value={data.direction}
            onChange={(e) =>
              setData({ ...data, direction: e.target.value as Direction })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {d === "higher" ? "Higher is better" : "Lower is better"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Importance Weight (optional)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={data.weight ?? ""}
            onChange={(e) =>
              setData({
                ...data,
                weight: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Default: equal"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Validation
          </label>
          <select
            value={data.validationStatus || "draft"}
            onChange={(e) =>
              setData({
                ...data,
                validationStatus: e.target.value as Indicator["validationStatus"],
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {VALIDATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "draft"
                  ? "Draft"
                  : status === "reviewed"
                    ? "Reviewed"
                    : "Validated"}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) =>
              setData({ ...data, description: e.target.value })
            }
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Describe what this indicator measures..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Source (optional)
          </label>
          <input
            type="text"
            value={data.source ?? ""}
            onChange={(e) =>
              setData({ ...data, source: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. UN Women, WHO, World Bank..."
          />
        </div>
      </div>

      {/* Benchmark Thresholds */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Benchmark Thresholds
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            ["critical", "developing", "progressive", "exemplary"] as const
          ).map((level) => {
            const colors: Record<string, string> = {
              critical: "border-red-200 bg-red-50",
              developing: "border-amber-200 bg-amber-50",
              progressive: "border-blue-200 bg-blue-50",
              exemplary: "border-green-200 bg-green-50",
            };
            const textColors: Record<string, string> = {
              critical: "text-red-700",
              developing: "text-amber-700",
              progressive: "text-blue-700",
              exemplary: "text-green-700",
            };
            return (
              <div key={level} className={`rounded-lg border p-3 ${colors[level]}`}>
                <label
                  className={`block text-xs font-semibold capitalize mb-1 ${textColors[level]}`}
                >
                  {level}
                </label>
                <input
                  type="text"
                  value={data.benchmark[level]}
                  onChange={(e) =>
                    setData({
                      ...data,
                      benchmark: { ...data.benchmark, [level]: e.target.value },
                    })
                  }
                  className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    errors[level] ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder={`e.g. ${
                    level === "critical"
                      ? "0"
                      : level === "developing"
                      ? "25"
                      : level === "progressive"
                      ? "50"
                      : "75"
                  }`}
                />
                {errors[level] && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {errors[level]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          {data.direction === "higher"
            ? "Scores interpolate linearly: value ≤ critical → 0, value ≥ exemplary → 100"
            : "Scores interpolate inversely: value ≥ critical → 0, value ≤ exemplary → 100"}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm"
        >
          Submit Proposal
        </button>
      </div>
    </form>
  );
}
