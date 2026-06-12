"use client";

import { useState } from "react";

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onCreateYear: (year: number, copyFrom?: number) => void;
  onDeleteYear?: (year: number) => void;
}

export default function YearSelector({
  selectedYear,
  availableYears,
  onYearChange,
  onCreateYear,
  onDeleteYear,
}: YearSelectorProps) {
  const [showNewYear, setShowNewYear] = useState(false);
  const [newYearValue, setNewYearValue] = useState(
    new Date().getFullYear() + 1
  );
  const [copyFromPrevious, setCopyFromPrevious] = useState(true);

  const handleCreate = () => {
    if (availableYears.includes(newYearValue)) return;
    const copyFrom = copyFromPrevious
      ? availableYears.length > 0
        ? availableYears[0]
        : undefined
      : undefined;
    onCreateYear(newYearValue, copyFrom);
    setShowNewYear(false);
    onYearChange(newYearValue);
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Year dropdown */}
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
        {availableYears.length === 0 && (
          <option value={new Date().getFullYear()}>
            {new Date().getFullYear()} (Current)
          </option>
        )}
      </select>

      {/* Add new year button */}
      <button
        onClick={() => setShowNewYear(!showNewYear)}
        aria-expanded={showNewYear}
        aria-label="Add new assessment year"
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50"
      >
        +
      </button>

      {/* New year dropdown panel */}
      {showNewYear && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            New Assessment Year
          </div>

          <div className="mb-2">
            <label className="mb-1 block text-xs text-gray-500">
              Year
            </label>
            <input
              type="number"
              value={newYearValue}
              onChange={(e) => setNewYearValue(Number(e.target.value))}
              min={2000}
              max={2100}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {availableYears.length > 0 && (
            <label className="mb-2 flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={copyFromPrevious}
                onChange={(e) => setCopyFromPrevious(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Copy data from {availableYears[0]}
            </label>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={availableYears.includes(newYearValue)}
              className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewYear(false)}
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
