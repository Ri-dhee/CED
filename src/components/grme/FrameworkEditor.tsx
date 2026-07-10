"use client";

import { useEffect, useMemo, useState } from "react";
import { Domain } from "@/lib/grme-data";
import { FrameworkProposal, FrameworkVersion } from "@/lib/grme-framework";
import SpreadsheetEditor from "./SpreadsheetEditor";
import ProposalReview from "./ProposalReview";

interface FrameworkEditorProps {
  domains: Domain[];
  versions: FrameworkVersion[];
  activeVersionId: string;
  pendingProposals: FrameworkProposal[];
  reviewedProposals: FrameworkProposal[];
  // Spreadsheet update handlers
  onUpdateDomain: (domainId: string, field: string, value: string) => void;
  onUpdateSubDomain: (
    domainId: string,
    subId: string,
    field: string,
    value: string
  ) => void;
  onUpdateIndicator: (
    domainId: string,
    subId: string,
    indId: string,
    field: string,
    value: string
  ) => void;
  onAddDomain: () => void;
  onAddSubDomain: (domainId: string) => void;
  onAddIndicator: (domainId: string, subId: string) => void;
  onDeleteDomain: (domainId: string) => void;
  onDeleteSubDomain: (domainId: string, subId: string) => void;
  onDeleteIndicator: (
    domainId: string,
    subId: string,
    indId: string
  ) => void;
  // Proposal handlers
  onApprove: (proposalId: string, notes?: string) => void;
  onReject: (proposalId: string, notes?: string) => void;
  onRestoreVersion: (versionId: string) => void;
}

type SubView = "spreadsheet" | "review";

export default function FrameworkEditor({
  domains,
  versions,
  activeVersionId,
  pendingProposals,
  reviewedProposals,
  onUpdateDomain,
  onUpdateSubDomain,
  onUpdateIndicator,
  onAddDomain,
  onAddSubDomain,
  onAddIndicator,
  onDeleteDomain,
  onDeleteSubDomain,
  onDeleteIndicator,
  onApprove,
  onReject,
  onRestoreVersion,
}: FrameworkEditorProps) {
  const [subView, setSubView] = useState<SubView>("spreadsheet");
  const [selectedVersionId, setSelectedVersionId] = useState(activeVersionId);

  useEffect(() => {
    if (versions.length === 0) return;
    if (!versions.some((version) => version.id === selectedVersionId)) {
      setSelectedVersionId(activeVersionId || versions[versions.length - 1].id);
    }
  }, [activeVersionId, selectedVersionId, versions]);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) || versions[versions.length - 1],
    [selectedVersionId, versions]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Framework versions</h3>
            <p className="text-xs text-slate-500">Restore a previous snapshot without losing the audit trail.</p>
          </div>
          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center">
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.label}{version.id === activeVersionId ? " (active)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedVersion && selectedVersion.id !== activeVersionId && onRestoreVersion(selectedVersion.id)}
              disabled={!selectedVersion || selectedVersion.id === activeVersionId}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Restore snapshot
            </button>
          </div>
        </div>
        {selectedVersion && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Updated {new Date(selectedVersion.timestamp).toLocaleString()}</span>
            {selectedVersion.createdBy && <span>by {selectedVersion.createdBy}</span>}
            {selectedVersion.reason && <span>{selectedVersion.reason}</span>}
          </div>
        )}
      </div>

      {/* Sub-view tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubView("spreadsheet")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subView === "spreadsheet"
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "bg-white text-gray-600 border border-gray-200 hover:border-primary/30"
          }`}
        >
          Spreadsheet Editor
          <span className="ml-2 text-xs opacity-70">
            {domains.length} domains
          </span>
        </button>
        <button
          onClick={() => setSubView("review")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
            subView === "review"
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "bg-white text-gray-600 border border-gray-200 hover:border-primary/30"
          }`}
        >
          Review Proposals
          {pendingProposals.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingProposals.length}
            </span>
          )}
        </button>
      </div>

      {/* Spreadsheet View */}
      {subView === "spreadsheet" && (
        <SpreadsheetEditor
          domains={domains}
          onUpdateDomain={onUpdateDomain}
          onUpdateSubDomain={onUpdateSubDomain}
          onUpdateIndicator={onUpdateIndicator}
          onAddDomain={onAddDomain}
          onAddSubDomain={onAddSubDomain}
          onAddIndicator={onAddIndicator}
          onDeleteDomain={onDeleteDomain}
          onDeleteSubDomain={onDeleteSubDomain}
          onDeleteIndicator={onDeleteIndicator}
        />
      )}

      {/* Review View */}
      {subView === "review" && (
        <ProposalReview
          pendingProposals={pendingProposals}
          reviewedProposals={reviewedProposals}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </div>
  );
}
