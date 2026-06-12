"use client";

import { useState, useRef, useEffect } from "react";
import {
  Domain,
  SubDomain,
  Indicator,
  IndicatorType,
  DataType,
  Direction,
} from "@/lib/grme-data";

interface SpreadsheetEditorProps {
  domains: Domain[];
  onUpdateDomain: (id: string, field: string, value: string) => void;
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
}

type CollapsedState = "expanded" | "collapsed";

function EditableCell({
  value,
  onSave,
  type,
  options,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  type?: "text" | "select" | "color";
  options?: string[];
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
    if (e.key === "Tab") {
      commit();
    }
  };

  if (editing) {
    if (type === "select" && options) {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onSave(e.target.value);
            setEditing(false);
          }}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="w-full px-1 py-0.5 text-xs border border-primary rounded bg-white focus:outline-none"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }

    if (type === "color") {
      return (
        <div className="flex items-center gap-1">
          <input
            type="color"
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onSave(e.target.value);
              setEditing(false);
            }}
            onBlur={commit}
            className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
          />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="flex-1 px-1 py-0.5 text-[10px] border border-primary rounded focus:outline-none font-mono"
          />
        </div>
      );
    }

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          rows={3}
          className="w-full px-1 py-0.5 text-xs border border-primary rounded bg-white focus:outline-none resize-none"
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full px-1 py-0.5 text-xs border border-primary rounded bg-white focus:outline-none"
      />
    );
  }

  const displayColor =
    type === "color" && value ? (
      <span
        className="inline-block w-3 h-3 rounded-sm mr-1.5 border border-gray-200 align-middle"
        style={{ backgroundColor: value }}
      />
    ) : null;

  return (
    <div
      onClick={() => setEditing(true)}
      className="min-h-[24px] px-1 py-0.5 text-xs cursor-text hover:bg-primary/5 rounded truncate select-none"
      title={value || "Click to edit"}
    >
      {displayColor}
      <span className={value ? "" : "text-gray-300 italic"}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function SpreadsheetEditor({
  domains,
  onUpdateDomain,
  onUpdateSubDomain,
  onUpdateIndicator,
  onAddDomain,
  onAddSubDomain,
  onAddIndicator,
  onDeleteDomain,
  onDeleteSubDomain,
  onDeleteIndicator,
}: SpreadsheetEditorProps) {
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(
    new Set()
  );
  const [collapsedSubs, setCollapsedSubs] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleDomain = (id: string) => {
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSub = (id: string) => {
    setCollapsedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setCollapsedDomains(new Set());
    setCollapsedSubs(new Set());
  };

  const collapseAll = () => {
    setCollapsedDomains(new Set(domains.map((d) => d.id)));
    setCollapsedSubs(
      new Set(
        domains.flatMap((d) => d.subdomains.map((s) => s.id))
      )
    );
  };

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

  const totalIndicators = domains.reduce(
    (sum, d) =>
      sum + d.subdomains.reduce((s, sub) => s + sub.indicators.length, 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-700">
            Framework Spreadsheet
          </h3>
          <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
            {domains.length} domains ·{" "}
            {domains.reduce((s, d) => s + d.subdomains.length, 0)} sub-domains
            · {totalIndicators} indicators
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[10px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-[10px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          >
            Collapse All
          </button>
          <button
            onClick={onAddDomain}
            className="text-xs font-medium text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            + Domain
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[200px]">
                Name
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[100px]">
                ID
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[80px]">
                Type
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[80px]">
                Data Type
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">
                Unit
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[70px]">
                Direction
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">
                Crit.
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">
                Dev.
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">
                Prog.
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">
                Exem.
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[100px]">
                Description
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[80px]">
                Source
              </th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">
                Color
              </th>
              <th className="px-3 py-2 w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => {
              const isDomainCollapsed = collapsedDomains.has(domain.id);
              const domainIndicators = domain.subdomains.flatMap(
                (s) => s.indicators
              );

              return (
                <>
                  {/* Domain Row */}
                  <tr
                    key={`domain-${domain.id}`}
                    className="bg-gray-100 border-b border-gray-200 font-semibold"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleDomain(domain.id)}
                          className="text-gray-400 hover:text-gray-600 w-4"
                        >
                          {isDomainCollapsed ? "▶" : "▼"}
                        </button>
                        <EditableCell
                          value={domain.name}
                          onSave={(v) =>
                            onUpdateDomain(domain.id, "name", v)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <EditableCell
                        value={domain.id}
                        onSave={(v) =>
                          onUpdateDomain(domain.id, "id", v)
                        }
                      />
                    </td>
                    <td colSpan={8} className="px-3 py-2">
                      <EditableCell
                        value={domain.description}
                        onSave={(v) =>
                          onUpdateDomain(domain.id, "description", v)
                        }
                        multiline
                      />
                    </td>
                    <td className="px-3 py-2">
                      <EditableCell
                        value={domain.color}
                        onSave={(v) =>
                          onUpdateDomain(domain.id, "color", v)
                        }
                        type="color"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => {
                          if (confirmDelete === `d-${domain.id}`) {
                            onDeleteDomain(domain.id);
                            setConfirmDelete(null);
                          } else {
                            setConfirmDelete(`d-${domain.id}`);
                            setTimeout(() => setConfirmDelete(null), 3000);
                          }
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          confirmDelete === `d-${domain.id}`
                            ? "bg-red-500 text-white"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          confirmDelete === `d-${domain.id}`
                            ? "Click again to confirm delete"
                            : "Delete domain"
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>

                  {/* SubDomain + Indicator Rows */}
                  {!isDomainCollapsed &&
                    domain.subdomains.map((sub) => {
                      const isSubCollapsed = collapsedSubs.has(sub.id);

                      return (
                        <>
                          {/* SubDomain Row */}
                          <tr
                            key={`sub-${sub.id}`}
                            className="bg-blue-50/50 border-b border-gray-100"
                          >
                            <td className="px-3 py-1.5 pl-8">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSub(sub.id)}
                                  className="text-gray-400 hover:text-gray-600 w-4 text-[10px]"
                                >
                                  {isSubCollapsed ? "▶" : "▼"}
                                </button>
                                <EditableCell
                                  value={sub.name}
                                  onSave={(v) =>
                                    onUpdateSubDomain(
                                      domain.id,
                                      sub.id,
                                      "name",
                                      v
                                    )
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-3 py-1.5 pl-8">
                              <EditableCell
                                value={sub.id}
                                onSave={(v) =>
                                  onUpdateSubDomain(
                                    domain.id,
                                    sub.id,
                                    "id",
                                    v
                                  )
                                }
                              />
                            </td>
                            <td colSpan={7} className="px-3 py-1.5">
                              <span className="text-[10px] text-gray-400">
                                {sub.indicators.length} indicators
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
                              <EditableCell
                                value={String(sub.weight ?? "")}
                                onSave={(v) =>
                                  onUpdateSubDomain(
                                    domain.id,
                                    sub.id,
                                    "weight",
                                    v
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-1.5">
                              <EditableCell
                                value={sub.description || ""}
                                onSave={(v) =>
                                  onUpdateSubDomain(
                                    domain.id,
                                    sub.id,
                                    "description",
                                    v
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-1.5"></td>
                            <td className="px-3 py-1.5">
                              <button
                                onClick={() => onAddIndicator(domain.id, sub.id)}
                                className="text-[10px] text-primary hover:text-primary-dark mr-2"
                                title="Add indicator"
                              >
                                + Ind
                              </button>
                            </td>
                            <td className="px-3 py-1.5">
                              <button
                                onClick={() => {
                                  if (confirmDelete === `s-${sub.id}`) {
                                    onDeleteSubDomain(domain.id, sub.id);
                                    setConfirmDelete(null);
                                  } else {
                                    setConfirmDelete(`s-${sub.id}`);
                                    setTimeout(
                                      () => setConfirmDelete(null),
                                      3000
                                    );
                                  }
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  confirmDelete === `s-${sub.id}`
                                    ? "bg-red-500 text-white"
                                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                }`}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>

                          {/* Indicator Rows */}
                          {!isSubCollapsed &&
                            sub.indicators.map((ind) => (
                              <tr
                                key={`ind-${ind.id}`}
                                className="border-b border-gray-50 hover:bg-gray-50/50"
                              >
                                <td className="px-3 py-1 pl-16">
                                  <EditableCell
                                    value={ind.name}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "name",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.id}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "id",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.type}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "type",
                                        v
                                      )
                                    }
                                    type="select"
                                    options={INDICATOR_TYPES}
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.dataType}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "dataType",
                                        v
                                      )
                                    }
                                    type="select"
                                    options={DATA_TYPES}
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.unit}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "unit",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.direction}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "direction",
                                        v
                                      )
                                    }
                                    type="select"
                                    options={DIRECTIONS}
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.benchmark.critical}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "benchmark.critical",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.benchmark.developing}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "benchmark.developing",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.benchmark.progressive}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "benchmark.progressive",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.benchmark.exemplary}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "benchmark.exemplary",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.description}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "description",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.source || ""}
                                    onSave={(v) =>
                                      onUpdateIndicator(
                                        domain.id,
                                        sub.id,
                                        ind.id,
                                        "source",
                                        v
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <EditableCell
                                    value={ind.direction}
                                    onSave={() => {}}
                                    type="select"
                                    options={DIRECTIONS}
                                  />
                                </td>
                                <td className="px-3 py-1">
                                  <button
                                    onClick={() => {
                                      if (confirmDelete === `i-${ind.id}`) {
                                        onDeleteIndicator(
                                          domain.id,
                                          sub.id,
                                          ind.id
                                        );
                                        setConfirmDelete(null);
                                      } else {
                                        setConfirmDelete(`i-${ind.id}`);
                                        setTimeout(
                                          () => setConfirmDelete(null),
                                          3000
                                        );
                                      }
                                    }}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      confirmDelete === `i-${ind.id}`
                                        ? "bg-red-500 text-white"
                                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                    }`}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}

                          {/* Add Indicator Row */}
                          {!isSubCollapsed && (
                            <tr className="border-b border-gray-50">
                              <td
                                colSpan={14}
                                className="px-3 py-1 pl-16"
                              >
                                <button
                                  onClick={() =>
                                    onAddIndicator(domain.id, sub.id)
                                  }
                                  className="text-[10px] text-primary/60 hover:text-primary"
                                >
                                  + Add indicator
                                </button>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}

                  {/* Add SubDomain Row */}
                  {!isDomainCollapsed && (
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td colSpan={14} className="px-3 py-1.5 pl-8">
                        <button
                          onClick={() => onAddSubDomain(domain.id)}
                          className="text-[10px] text-primary/60 hover:text-primary"
                        >
                          + Add sub-domain
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
