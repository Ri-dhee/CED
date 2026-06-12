"use client";

import { useState } from "react";
import { FrameworkProposal } from "@/lib/grme-framework";

interface ProposalReviewProps {
  pendingProposals: FrameworkProposal[];
  reviewedProposals: FrameworkProposal[];
  onApprove: (proposalId: string, notes?: string) => void;
  onReject: (proposalId: string, notes?: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntityLabel(entity: string): string {
  return entity.charAt(0).toUpperCase() + entity.slice(1);
}

function getActionColor(action: string): string {
  switch (action) {
    case "add":
      return "bg-green-100 text-green-700";
    case "edit":
      return "bg-blue-100 text-blue-700";
    case "delete":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getActionIcon(action: string): string {
  switch (action) {
    case "add":
      return "M12 4v16m8-8H4";
    case "edit":
      return "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z";
    case "delete":
      return "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16";
    default:
      return "";
  }
}

function getEntityName(p: FrameworkProposal): string {
  const d = p.data as any;
  return d.name || d.id || "Unknown";
}

function getChangeSummary(p: FrameworkProposal): string {
  if (p.action === "delete") return "Will be removed from the framework";
  if (p.action === "add") return "New entry to be added to the framework";

  // For edits, show what changed
  if (!p.originalData) return "Modified";
  const orig = p.originalData as any;
  const curr = p.data as any;
  const changes: string[] = [];

  if (orig.name !== curr.name)
    changes.push(`Name: "${orig.name}" → "${curr.name}"`);
  if (orig.description !== curr.description)
    changes.push("Description updated");
  if (orig.color !== curr.color) changes.push(`Color: ${orig.color} → ${curr.color}`);

  if (p.entity === "indicator") {
    if (JSON.stringify(orig.benchmark) !== JSON.stringify(curr.benchmark))
      changes.push("Benchmarks updated");
    if (orig.direction !== curr.direction)
      changes.push(`Direction: ${orig.direction} → ${curr.direction}`);
    if (orig.type !== curr.type) changes.push(`Type: ${orig.type} → ${curr.type}`);
  }

  return changes.length > 0 ? changes.join("; ") : "Modified";
}

export default function ProposalReview({
  pendingProposals,
  reviewedProposals,
  onApprove,
  onReject,
}: ProposalReviewProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {/* Pending Proposals */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Pending Proposals
          {pendingProposals.length > 0 && (
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {pendingProposals.length} awaiting review
            </span>
          )}
        </h3>
        {pendingProposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-10 h-10 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No pending proposals</p>
            <p className="text-xs text-gray-400 mt-1">
              Propose changes in the Browse tab
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProposals.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${getActionColor(
                          p.action
                        )}`}
                      >
                        {p.action.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {getEntityLabel(p.entity)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        by {p.proposedBy}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      {getEntityName(p)}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {getChangeSummary(p)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatDate(p.timestamp)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <textarea
                      value={notes[p.id] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [p.id]: e.target.value })
                      }
                      placeholder="Notes (optional)"
                      rows={2}
                      className="w-48 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          onApprove(p.id, notes[p.id] || undefined);
                          setNotes((n) => {
                            const next = { ...n };
                            delete next[p.id];
                            return next;
                          });
                        }}
                        className="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          onReject(p.id, notes[p.id] || undefined);
                          setNotes((n) => {
                            const next = { ...n };
                            delete next[p.id];
                            return next;
                          });
                        }}
                        className="flex-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviewed Proposals */}
      {reviewedProposals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            History
          </h3>
          <div className="space-y-2">
            {reviewedProposals.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    p.status === "approved" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-700">
                    {getEntityLabel(p.action)} {getEntityLabel(p.entity)}:{" "}
                    {getEntityName(p)}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-2">
                    by {p.reviewedBy} · {p.status}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {p.reviewedAt ? formatDate(p.reviewedAt) : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
