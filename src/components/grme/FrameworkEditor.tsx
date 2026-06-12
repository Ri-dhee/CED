"use client";

import { useState } from "react";
import { Domain, SubDomain, Indicator } from "@/lib/grme-data";
import { FrameworkProposal } from "@/lib/grme-framework";
import SpreadsheetEditor from "./SpreadsheetEditor";
import ProposalReview from "./ProposalReview";

interface FrameworkEditorProps {
  domains: Domain[];
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
}

type SubView = "spreadsheet" | "review";

export default function FrameworkEditor({
  domains,
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
}: FrameworkEditorProps) {
  const [subView, setSubView] = useState<SubView>("spreadsheet");

  return (
    <div className="space-y-6">
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
