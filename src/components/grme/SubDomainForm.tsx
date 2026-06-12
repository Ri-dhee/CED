"use client";

import { useState } from "react";
import { SubDomain } from "@/lib/grme-data";

interface SubDomainFormProps {
  subDomain: SubDomain;
  onSave: (subDomain: SubDomain) => void;
  onCancel: () => void;
}

export default function SubDomainForm({
  subDomain,
  onSave,
  onCancel,
}: SubDomainFormProps) {
  const [data, setData] = useState<SubDomain>({ ...subDomain });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.id.trim()) errs.id = "ID is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const payload =
        data.id !== subDomain.id
          ? { ...data, aliases: Array.from(new Set([...(subDomain.aliases || []), subDomain.id])) }
          : data;
      onSave(payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {subDomain.name ? "Edit Sub-Domain" : "Add Sub-Domain"}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
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
            placeholder="e.g. Public Space Safety"
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
            placeholder="e.g. public-space-safety"
          />
          {errors.id && (
            <p className="text-xs text-red-500 mt-1">{errors.id}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Weight (optional)
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
              weight: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Default: equal weight"
        />
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
