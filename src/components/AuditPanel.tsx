"use client";

import { useState } from "react";
import { AuditLog, AuditEntry, Domain } from "@/lib/grme-data";

interface AuditPanelProps {
  domains: Domain[];
  auditLog: AuditLog[];
  onAddNote: (indicatorId: string, note: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getIndicatorName(domains: Domain[], indicatorId: string): string {
  for (const domain of domains) {
    for (const sub of domain.subdomains) {
      const ind = sub.indicators.find((i) => i.id === indicatorId);
      if (ind) return ind.name;
    }
  }
  return indicatorId;
}

function getActionIcon(action: AuditEntry["action"]) {
  switch (action) {
    case "create":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    case "update":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case "review":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function getActionColor(action: AuditEntry["action"]) {
  switch (action) {
    case "create": return "text-emerald-500 bg-emerald-50";
    case "update": return "text-blue-500 bg-blue-50";
    case "review": return "text-purple-500 bg-purple-50";
  }
}

export default function AuditPanel({ domains, auditLog, onAddNote }: AuditPanelProps) {
  const [filter, setFilter] = useState<"all" | "create" | "update" | "review">("all");
  const [noteIndicator, setNoteIndicator] = useState<string>("");
  const [noteText, setNoteText] = useState("");

  const allEntries = auditLog
    .flatMap((log) =>
      log.entries.map((e) => ({ ...e, indicatorId: log.indicatorId }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filtered = filter === "all" ? allEntries : allEntries.filter((e) => e.action === filter);

  const handleAddNote = () => {
    if (noteIndicator && noteText.trim()) {
      onAddNote(noteIndicator, noteText.trim());
      setNoteText("");
      setNoteIndicator("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Audit Trail</h3>
        <span className="text-sm text-gray-400">{allEntries.length} entries</span>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "create", "update", "review"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <select
            value={noteIndicator}
            onChange={(e) => setNoteIndicator(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select indicator to review...</option>
            {domains.flatMap((d) =>
              d.subdomains.flatMap((s) =>
                s.indicators.map((i) => (
                  <option key={i.id} value={i.id}>
                    {d.shortName} / {s.name} / {i.name.slice(0, 40)}
                  </option>
                ))
              )
            )}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add review note..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          />
          <button
            onClick={handleAddNote}
            disabled={!noteIndicator || !noteText.trim()}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No audit entries yet. Start entering data to build the audit trail.
          </div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={entry.id || i}
              className="flex gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getActionColor(entry.action)}`}>
                {getActionIcon(entry.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-800">
                    {entry.user}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getActionColor(entry.action)}`}>
                    {entry.action}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {getIndicatorName(domains, entry.indicatorId)}
                </p>
                {entry.oldValue !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="line-through">{entry.oldValue}</span>
                    {" → "}
                    <span className="font-medium text-gray-600">{entry.newValue}</span>
                  </p>
                )}
                {entry.action === "review" && (
                  <p className="text-xs text-gray-600 mt-1 italic">
                    &ldquo;{entry.newValue}&rdquo;
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
