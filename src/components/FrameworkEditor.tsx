"use client";

import { useState } from "react";
import { Domain, SubDomain, Indicator } from "@/lib/grme-data";
import {
  AVAILABLE_ICONS,
  AVAILABLE_COLORS,
} from "@/lib/grme-framework";
import DomainForm from "./DomainForm";
import SubDomainForm from "./SubDomainForm";
import IndicatorForm from "./IndicatorForm";
import ProposalReview from "./ProposalReview";

interface FrameworkEditorProps {
  domains: Domain[];
  pendingProposals: any[];
  reviewedProposals: any[];
  onAddDomain: (data: Domain) => void;
  onEditDomain: (original: Domain, updated: Domain) => void;
  onDeleteDomain: (domain: Domain) => void;
  onAddSubDomain: (domainId: string, data: SubDomain) => void;
  onEditSubDomain: (
    domainId: string,
    original: SubDomain,
    updated: SubDomain
  ) => void;
  onDeleteSubDomain: (domainId: string, subDomain: SubDomain) => void;
  onAddIndicator: (
    domainId: string,
    subDomainId: string,
    data: Indicator
  ) => void;
  onEditIndicator: (
    domainId: string,
    subDomainId: string,
    original: Indicator,
    updated: Indicator
  ) => void;
  onDeleteIndicator: (
    domainId: string,
    subDomainId: string,
    indicator: Indicator
  ) => void;
  onApprove: (proposalId: string, notes?: string) => void;
  onReject: (proposalId: string, notes?: string) => void;
  newDomain: () => Domain;
  newSubDomain: () => SubDomain;
  newIndicator: () => Indicator;
}

type SubView = "browse" | "review";

type EditingState =
  | { type: "none" }
  | { type: "add-domain" }
  | { type: "edit-domain"; domain: Domain }
  | { type: "add-subdomain"; domainId: string }
  | { type: "edit-subdomain"; domainId: string; subDomain: SubDomain }
  | {
      type: "add-indicator";
      domainId: string;
      subDomainId: string;
    }
  | {
      type: "edit-indicator";
      domainId: string;
      subDomainId: string;
      indicator: Indicator;
    };

export default function FrameworkEditor({
  domains,
  pendingProposals,
  reviewedProposals,
  onAddDomain,
  onEditDomain,
  onDeleteDomain,
  onAddSubDomain,
  onEditSubDomain,
  onDeleteSubDomain,
  onAddIndicator,
  onEditIndicator,
  onDeleteIndicator,
  onApprove,
  onReject,
  newDomain,
  newSubDomain,
  newIndicator,
}: FrameworkEditorProps) {
  const [subView, setSubView] = useState<SubView>("browse");
  const [editing, setEditing] = useState<EditingState>({ type: "none" });
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubDomains, setExpandedSubDomains] = useState<Set<string>>(
    new Set()
  );
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleDomain = (id: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubDomain = (id: string) => {
    setExpandedSubDomains((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setEditing({ type: "none" });
  };

  const handleCancel = () => {
    setEditing({ type: "none" });
  };

  const renderEditingForm = () => {
    switch (editing.type) {
      case "add-domain":
        return (
          <DomainForm
            domain={newDomain()}
            onSave={(d) => {
              onAddDomain(d);
              handleSave();
            }}
            onCancel={handleCancel}
          />
        );
      case "edit-domain":
        return (
          <DomainForm
            domain={editing.domain}
            onSave={(d) => {
              onEditDomain(editing.domain, d);
              handleSave();
            }}
            onCancel={handleCancel}
          />
        );
      case "add-subdomain":
        return (
          <SubDomainForm
            subDomain={newSubDomain()}
            onSave={(s) => {
              onAddSubDomain(editing.domainId, s);
              handleSave();
            }}
            onCancel={handleCancel}
          />
        );
      case "edit-subdomain":
        return (
          <SubDomainForm
            subDomain={editing.subDomain}
            onSave={(s) => {
              onEditSubDomain(editing.domainId, editing.subDomain, s);
              handleSave();
            }}
            onCancel={handleCancel}
          />
        );
      case "add-indicator":
        return (
          <IndicatorForm
            indicator={newIndicator()}
            onSave={(i) => {
              onAddIndicator(editing.domainId, editing.subDomainId, i);
              handleSave();
            }}
            onCancel={handleCancel}
          />
        );
      case "edit-indicator":
        return (
          <IndicatorForm
            indicator={editing.indicator}
            onSave={(i) => {
              onEditIndicator(
                editing.domainId,
                editing.subDomainId,
                editing.indicator,
                i
              );
              handleSave();
            }}
            onCancel={handleCancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-view tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSubView("browse");
            setEditing({ type: "none" });
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subView === "browse"
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "bg-white text-gray-600 border border-gray-200 hover:border-primary/30"
          }`}
        >
          Browse Framework
          <span className="ml-2 text-xs opacity-70">
            {domains.length} domains
          </span>
        </button>
        <button
          onClick={() => {
            setSubView("review");
            setEditing({ type: "none" });
          }}
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

      {/* Browse View */}
      {subView === "browse" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Domain tree */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Domains
                </h3>
                <button
                  onClick={() => setEditing({ type: "add-domain" })}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  + Add Domain
                </button>
              </div>
              <div className="space-y-1">
                {domains.map((domain) => (
                  <div key={domain.id}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${
                        expandedDomains.has(domain.id)
                          ? "bg-primary/5 border border-primary/20"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <button
                        onClick={() => toggleDomain(domain.id)}
                        className="flex-1 text-left flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: domain.color }}
                        />
                        <span className="font-medium text-gray-800 truncate">
                          {domain.name || domain.shortName}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {domain.subdomains.length} sub
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          setEditing({ type: "edit-domain", domain })
                        }
                        className="text-gray-400 hover:text-primary p-1"
                        title="Edit"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirmDelete === domain.id) {
                            onDeleteDomain(domain);
                            setConfirmDelete(null);
                          } else {
                            setConfirmDelete(domain.id);
                            setTimeout(() => setConfirmDelete(null), 3000);
                          }
                        }}
                        className={`p-1 ${
                          confirmDelete === domain.id
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        title={
                          confirmDelete === domain.id
                            ? "Click again to confirm"
                            : "Delete"
                        }
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Subdomains */}
                    {expandedDomains.has(domain.id) && (
                      <div className="ml-5 mt-1 space-y-1">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] text-gray-400 uppercase">
                            Sub-domains
                          </span>
                          <button
                            onClick={() =>
                              setEditing({
                                type: "add-subdomain",
                                domainId: domain.id,
                              })
                            }
                            className="text-[10px] text-primary hover:text-primary-dark"
                          >
                            + Add
                          </button>
                        </div>
                        {domain.subdomains.map((sub) => (
                          <div key={sub.id}>
                            <div
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                expandedSubDomains.has(sub.id)
                                  ? "bg-gray-100"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <button
                                onClick={() => toggleSubDomain(sub.id)}
                                className="flex-1 text-left font-medium text-gray-700 truncate"
                              >
                                {sub.name}
                              </button>
                              <span className="text-[10px] text-gray-400">
                                {sub.indicators.length}
                              </span>
                              <button
                                onClick={() =>
                                  setEditing({
                                    type: "edit-subdomain",
                                    domainId: domain.id,
                                    subDomain: sub,
                                  })
                                }
                                className="text-gray-400 hover:text-primary p-0.5"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirmDelete === sub.id) {
                                    onDeleteSubDomain(domain.id, sub);
                                    setConfirmDelete(null);
                                  } else {
                                    setConfirmDelete(sub.id);
                                    setTimeout(
                                      () => setConfirmDelete(null),
                                      3000
                                    );
                                  }
                                }}
                                className={`p-0.5 ${
                                  confirmDelete === sub.id
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                                }`}
                              >
                                <svg
                                  className="w-3 h-3"
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

                            {/* Indicators */}
                            {expandedSubDomains.has(sub.id) && (
                              <div className="ml-4 mt-1 space-y-0.5">
                                <div className="flex items-center justify-between px-2">
                                  <span className="text-[10px] text-gray-400 uppercase">
                                    Indicators
                                  </span>
                                  <button
                                    onClick={() =>
                                      setEditing({
                                        type: "add-indicator",
                                        domainId: domain.id,
                                        subDomainId: sub.id,
                                      })
                                    }
                                    className="text-[10px] text-primary hover:text-primary-dark"
                                  >
                                    + Add
                                  </button>
                                </div>
                                {sub.indicators.map((ind) => (
                                  <div
                                    key={ind.id}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover:bg-gray-50"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{
                                        backgroundColor:
                                          ind.type === "Quantitative"
                                            ? "#3b82f6"
                                            : ind.type === "Qualitative"
                                            ? "#f59e0b"
                                            : "#8b5cf6",
                                      }}
                                    />
                                    <span className="text-gray-600 truncate flex-1">
                                      {ind.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setEditing({
                                          type: "edit-indicator",
                                          domainId: domain.id,
                                          subDomainId: sub.id,
                                          indicator: ind,
                                        })
                                      }
                                      className="text-gray-400 hover:text-primary p-0.5"
                                    >
                                      <svg
                                        className="w-2.5 h-2.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirmDelete === ind.id) {
                                          onDeleteIndicator(
                                            domain.id,
                                            sub.id,
                                            ind
                                          );
                                          setConfirmDelete(null);
                                        } else {
                                          setConfirmDelete(ind.id);
                                          setTimeout(
                                            () => setConfirmDelete(null),
                                            3000
                                          );
                                        }
                                      }}
                                      className={`p-0.5 ${
                                        confirmDelete === ind.id
                                          ? "text-red-500"
                                          : "text-gray-400 hover:text-red-500"
                                      }`}
                                    >
                                      <svg
                                        className="w-2.5 h-2.5"
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
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form or details */}
          <div className="lg:col-span-2">
            {editing.type !== "none" ? (
              renderEditingForm()
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Framework Browser
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Select a domain from the left panel to view its sub-domains
                  and indicators. Click edit or add to propose changes.
                </p>
              </div>
            )}
          </div>
        </div>
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
