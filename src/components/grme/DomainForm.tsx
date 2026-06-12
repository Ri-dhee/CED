"use client";

import { useState } from "react";
import { Domain } from "@/lib/grme-data";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "@/lib/grme-framework";

interface DomainFormProps {
  domain: Domain;
  onSave: (domain: Domain) => void;
  onCancel: () => void;
}

export default function DomainForm({ domain, onSave, onCancel }: DomainFormProps) {
  const [data, setData] = useState<Domain>({ ...domain });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.shortName.trim()) errs.shortName = "Short name is required";
    if (!data.id.trim()) errs.id = "ID is required";
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
          {domain.name ? "Edit Domain" : "Add Domain"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            placeholder="e.g. Safety and Security"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Short Name *
          </label>
          <input
            type="text"
            value={data.shortName}
            onChange={(e) => setData({ ...data, shortName: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              errors.shortName ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. Safety"
          />
          {errors.shortName && (
            <p className="text-xs text-red-500 mt-1">{errors.shortName}</p>
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
            placeholder="e.g. safety-security"
          />
          {errors.id && (
            <p className="text-xs text-red-500 mt-1">{errors.id}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Icon
          </label>
          <select
            value={data.icon}
            onChange={(e) => setData({ ...data, icon: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {AVAILABLE_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.color}
              onChange={(e) => setData({ ...data, color: e.target.value })}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <div className="flex gap-1 flex-wrap">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setData({ ...data, color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    data.color === c
                      ? "border-gray-900 scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="Describe this domain..."
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
