"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Domain,
  SubDomain,
  Indicator,
  STAKEHOLDERS,
} from "./grme-data";
import {
  FrameworkProposal,
  FrameworkStorage,
  appendFrameworkVersion,
  restoreFrameworkVersion,
  loadFramework,
  cacheFramework,
  saveFrameworkWithActor,
  loadFrameworkFromApi,
  createProposal,
  applyProposal,
  generateEntityId,
  newDomain,
  newSubDomain,
  newIndicator,
} from "./grme-framework";
import { DEFAULT_STAKEHOLDER_ACCESS_BY_DOMAIN } from "./grme-framework-defaults";
import { supabase, hasSupabaseConfig, isStrictFreeTierMode } from "./supabase";

const CURRENT_USER = "Stakeholder";
const MAX_STAKEHOLDER_ACCESS = 5;

function normalizeStakeholderAccess(value: string): string[] {
  const requested = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = STAKEHOLDERS.find(
        (stakeholder) =>
          stakeholder.id.toLowerCase() === part.toLowerCase() ||
          stakeholder.name.toLowerCase() === part.toLowerCase()
      );
      return (match?.id || part).toLowerCase();
    });

  if (requested.length === 0) return [];

  return Array.from(new Set(requested)).filter(Boolean).slice(0, MAX_STAKEHOLDER_ACCESS);
}

export function useGRMEFramework(adminName?: string) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [proposals, setProposals] = useState<FrameworkProposal[]>([]);
  const [versions, setVersions] = useState<FrameworkStorage["versions"]>([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [loaded, setLoaded] = useState(false);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef<number>(0);
  const actor = adminName?.trim() || CURRENT_USER;

  const applyFramework = useCallback((fw: FrameworkStorage) => {
    setDomains(fw.domains);
    setProposals(fw.proposals);
    setVersions(fw.versions);
    setActiveVersionId(fw.activeVersionId);
  }, []);

  const persistFramework = useCallback(
    (fw: FrameworkStorage) => {
      applyFramework(fw);
      saveFrameworkWithActor(fw, actor);
    },
    [actor, applyFramework]
  );

  const persistVersionedFramework = useCallback(
    (nextDomains: Domain[], nextProposals: FrameworkProposal[], reason?: string) => {
      const base: FrameworkStorage = {
        domains: nextDomains,
        proposals: nextProposals,
        versions,
        activeVersionId,
        lastUpdated: new Date().toISOString(),
      };
      persistFramework(appendFrameworkVersion(base, actor, reason));
    },
    [actor, activeVersionId, persistFramework, versions]
  );

  const restoreFrameworkVersionById = useCallback(
    (versionId: string, reason?: string) => {
      if (!versionId || versionId === activeVersionId) return;
      const base: FrameworkStorage = {
        domains,
        proposals,
        versions,
        activeVersionId,
        lastUpdated: new Date().toISOString(),
      };
      persistFramework(restoreFrameworkVersion(base, versionId, actor, reason));
    },
    [activeVersionId, actor, domains, persistFramework, proposals, versions]
  );

  const refreshFramework = useCallback(async () => {
    if (refreshPromiseRef.current) {
      await refreshPromiseRef.current;
      return;
    }

    const run = (async () => {
    if (!hasSupabaseConfig) {
      const fw = loadFramework();
      applyFramework(fw);
      lastRefreshAtRef.current = Date.now();
      return;
    }
    try {
      const apiFw = await loadFrameworkFromApi();
      if (apiFw) {
        const localFw = loadFramework();
        const chosen = (apiFw.lastUpdated || "") >= (localFw.lastUpdated || "") ? apiFw : localFw;
        applyFramework(chosen);
        cacheFramework(chosen);
        lastRefreshAtRef.current = Date.now();
      }
    } catch {
      // Keep current state
    }
    })();

    refreshPromiseRef.current = run.finally(() => {
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  }, [applyFramework]);

  const debouncedRefreshFramework = useCallback(() => {
    if (Date.now() - lastRefreshAtRef.current < 30000) return;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      refreshFramework();
    }, 300);
  }, [refreshFramework]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!hasSupabaseConfig) {
        if (!cancelled) {
          const fw = loadFramework();
          applyFramework(fw);
          lastRefreshAtRef.current = Date.now();
          setLoaded(true);
        }
        return;
      }
      const apiFw = await loadFrameworkFromApi();
      if (!cancelled) {
        const localFw = loadFramework();
        const chosen = apiFw && (apiFw.lastUpdated || "") >= (localFw.lastUpdated || "") ? apiFw : localFw;
        applyFramework(chosen);
        cacheFramework(chosen);
        lastRefreshAtRef.current = Date.now();
      }
      if (!cancelled) setLoaded(true);
    }

    init();
    return () => { cancelled = true; };
  }, [applyFramework]);

  // Real-time subscription — auto-refresh when framework changes
  useEffect(() => {
    if (!hasSupabaseConfig || isStrictFreeTierMode) return;
    const channel = supabase()
      .channel("framework-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "framework" },
        () => {
          debouncedRefreshFramework();
        }
      )
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, [debouncedRefreshFramework]);

  // Refresh on window focus
  useEffect(() => {
    if (isStrictFreeTierMode) return;
    const handleFocus = () => debouncedRefreshFramework();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [debouncedRefreshFramework]);

  const persist = useCallback(
    (newDomains: Domain[], newProposals: FrameworkProposal[]) => {
      persistFramework({
        domains: newDomains,
        proposals: newProposals,
        versions,
        activeVersionId,
        lastUpdated: new Date().toISOString(),
      });
    },
    [activeVersionId, persistFramework, versions]
  );

  // ── Framework CRUD (creates proposals) ──────────────────────

  const proposeAddDomain = useCallback(
    (data: Domain) => {
      const proposal = createProposal(
        "add",
        "domain",
        data.id,
        data,
        undefined,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeEditDomain = useCallback(
    (original: Domain, updated: Domain) => {
      const proposal = createProposal(
        "edit",
        "domain",
        updated.id,
        updated,
        original,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeDeleteDomain = useCallback(
    (domain: Domain) => {
      const proposal = createProposal(
        "delete",
        "domain",
        domain.id,
        domain,
        domain,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeAddSubDomain = useCallback(
    (domainId: string, data: SubDomain) => {
      const proposal = createProposal(
        "add",
        "subdomain",
        `${domainId}/${data.id}`,
        data,
        undefined,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeEditSubDomain = useCallback(
    (domainId: string, original: SubDomain, updated: SubDomain) => {
      const proposal = createProposal(
        "edit",
        "subdomain",
        `${domainId}/${updated.id}`,
        updated,
        original,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeDeleteSubDomain = useCallback(
    (domainId: string, subDomain: SubDomain) => {
      const proposal = createProposal(
        "delete",
        "subdomain",
        `${domainId}/${subDomain.id}`,
        subDomain,
        subDomain,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeAddIndicator = useCallback(
    (domainId: string, subDomainId: string, data: Indicator) => {
      const proposal = createProposal(
        "add",
        "indicator",
        `${domainId}/${subDomainId}/${data.id}`,
        data,
        undefined,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeEditIndicator = useCallback(
    (
      domainId: string,
      subDomainId: string,
      original: Indicator,
      updated: Indicator
    ) => {
      const proposal = createProposal(
        "edit",
        "indicator",
        `${domainId}/${subDomainId}/${updated.id}`,
        updated,
        original,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  const proposeDeleteIndicator = useCallback(
    (domainId: string, subDomainId: string, indicator: Indicator) => {
      const proposal = createProposal(
        "delete",
        "indicator",
        `${domainId}/${subDomainId}/${indicator.id}`,
        indicator,
        indicator,
        CURRENT_USER
      );
      persist(domains, [...proposals, proposal]);
    },
    [domains, proposals, persist]
  );

  // ── Direct Update (inline editor) ───────────────────────────

  const updateDomainField = useCallback(
    (domainId: string, field: string, value: string) => {
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        const updated = { ...d };
        const oldId = d.id;
        if (field === "name") updated.name = value;
        else if (field === "shortName") updated.shortName = value;
        else if (field === "id") {
          if (value && value !== d.id) {
            updated.aliases = Array.from(new Set([...(d.aliases || []), oldId]));
            updated.id = value;
          }
        }
        else if (field === "description") updated.description = value;
        else if (field === "methodologyNote") updated.methodologyNote = value;
        else if (field === "color") updated.color = value;
        else if (field === "icon") updated.icon = value;
        return updated;
      });
      persistVersionedFramework(newDomains, proposals, `Updated domain ${domainId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  const updateSubDomainField = useCallback(
    (domainId: string, subId: string, field: string, value: string) => {
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        return {
          ...d,
          subdomains: d.subdomains.map((s) => {
            if (s.id !== subId) return s;
            const oldId = s.id;
            if (field === "name") return { ...s, name: value };
            if (field === "id") {
              if (value && value !== s.id) {
                return {
                  ...s,
                  id: value,
                  aliases: Array.from(new Set([...(s.aliases || []), oldId])),
                };
              }
              return s;
            }
            if (field === "description") return { ...s, description: value };
            if (field === "weight")
              return {
                ...s,
                weight: value ? parseFloat(value) : undefined,
              };
            return s;
          }),
        };
      });
      persistVersionedFramework(newDomains, proposals, `Updated sub-domain ${subId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  const updateIndicatorField = useCallback(
    (
      domainId: string,
      subId: string,
      indId: string,
      field: string,
      value: string
    ) => {
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        return {
          ...d,
          subdomains: d.subdomains.map((s) => {
            if (s.id !== subId) return s;
            return {
              ...s,
              indicators: s.indicators.map((ind) => {
                if (ind.id !== indId) return ind;
                const oldId = ind.id;
                if (field === "name") return { ...ind, name: value };
                if (field === "id") {
                  if (value && value !== ind.id) {
                    return {
                      ...ind,
                      id: value,
                      aliases: Array.from(new Set([...(ind.aliases || []), oldId])),
                    };
                  }
                  return ind;
                }
                if (field === "type")
                  return { ...ind, type: value as Indicator["type"] };
                if (field === "dataType")
                  return { ...ind, dataType: value as Indicator["dataType"] };
                if (field === "unit") return { ...ind, unit: value };
                if (field === "direction")
                  return { ...ind, direction: value as Indicator["direction"] };
                if (field === "description")
                  return { ...ind, description: value };
                if (field === "source")
                  return { ...ind, source: value || undefined };
                if (field === "stakeholderAccess")
                  return {
                    ...ind,
                    stakeholderAccess: normalizeStakeholderAccess(value),
                  };
                if (field === "validationStatus")
                  return { ...ind, validationStatus: value as Indicator["validationStatus"] };
                if (field.startsWith("benchmark.")) {
                  const key = field.split(".")[1] as
                    | "critical"
                    | "developing"
                    | "progressive"
                    | "exemplary";
                  return {
                    ...ind,
                    benchmark: { ...ind.benchmark, [key]: value },
                  };
                }
                return ind;
              }),
            };
          }),
        };
      });
      persistVersionedFramework(newDomains, proposals, `Updated indicator ${indId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  // ── Direct Add (inline editor) ──────────────────────────────

  const addDomainDirect = useCallback(() => {
    const d = newDomain();
    d.name = "New Domain";
    d.shortName = "New";
    const newDomains = [...domains, d];
    persistVersionedFramework(newDomains, proposals, "Added domain");
  }, [domains, persistVersionedFramework, proposals]);

  const addSubDomainDirect = useCallback(
    (domainId: string) => {
      const s = newSubDomain();
      s.name = "New Sub-Domain";
      const newDomains = domains.map((d) =>
        d.id === domainId ? { ...d, subdomains: [...d.subdomains, s] } : d
      );
      persistVersionedFramework(newDomains, proposals, `Added sub-domain to ${domainId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  const addIndicatorDirect = useCallback(
    (domainId: string, subId: string) => {
      const ind = newIndicator();
      ind.name = "New Indicator";
      ind.stakeholderAccess = [...(DEFAULT_STAKEHOLDER_ACCESS_BY_DOMAIN[domainId] || [])].slice(0, MAX_STAKEHOLDER_ACCESS);
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        return {
          ...d,
          subdomains: d.subdomains.map((s) =>
            s.id === subId ? { ...s, indicators: [...s.indicators, ind] } : s
          ),
        };
      });
      persistVersionedFramework(newDomains, proposals, `Added indicator to ${domainId}/${subId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  // ── Direct Delete (inline editor) ───────────────────────────

  const deleteDomainDirect = useCallback(
    (domainId: string) => {
      const newDomains = domains.filter((d) => d.id !== domainId);
      persistVersionedFramework(newDomains, proposals, `Deleted domain ${domainId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  const deleteSubDomainDirect = useCallback(
    (domainId: string, subId: string) => {
      const newDomains = domains.map((d) =>
        d.id === domainId
          ? { ...d, subdomains: d.subdomains.filter((s) => s.id !== subId) }
          : d
      );
      persistVersionedFramework(newDomains, proposals, `Deleted sub-domain ${subId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  const deleteIndicatorDirect = useCallback(
    (domainId: string, subId: string, indId: string) => {
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        return {
          ...d,
          subdomains: d.subdomains.map((s) =>
            s.id === subId
              ? { ...s, indicators: s.indicators.filter((i) => i.id !== indId) }
              : s
          ),
        };
      });
      persistVersionedFramework(newDomains, proposals, `Deleted indicator ${indId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  // ── Proposal Management ─────────────────────────────────────

  const approveProposal = useCallback(
    (proposalId: string, notes?: string) => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal || proposal.status !== "pending") return;

      const approved: FrameworkProposal = {
        ...proposal,
        status: "approved",
        reviewedBy: CURRENT_USER,
        reviewedAt: new Date().toISOString(),
        reviewNotes: notes,
      };

      const newDomains = applyProposal(domains, approved);
      const newProposals = proposals.map((p) =>
        p.id === proposalId ? approved : p
      );

      persistVersionedFramework(newDomains, newProposals, `Approved proposal ${proposalId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  const rejectProposal = useCallback(
    (proposalId: string, notes?: string) => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal || proposal.status !== "pending") return;

      const rejected: FrameworkProposal = {
        ...proposal,
        status: "rejected",
        reviewedBy: CURRENT_USER,
        reviewedAt: new Date().toISOString(),
        reviewNotes: notes,
      };

      const newProposals = proposals.map((p) =>
        p.id === proposalId ? rejected : p
      );

      persistFramework({
        domains,
        proposals: newProposals,
        versions,
        activeVersionId,
        lastUpdated: new Date().toISOString(),
      });
    },
    [activeVersionId, domains, persistFramework, proposals, versions]
  );

  // ── Direct Apply (for immediate use, bypassing proposal) ────

  const applyNow = useCallback(
    (proposalId: string) => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal) return;

      const approved: FrameworkProposal = {
        ...proposal,
        status: "approved",
        reviewedBy: CURRENT_USER,
        reviewedAt: new Date().toISOString(),
      };

      const newDomains = applyProposal(domains, approved);
      const newProposals = proposals.map((p) =>
        p.id === proposalId ? approved : p
      );

      persistVersionedFramework(newDomains, newProposals, `Applied proposal ${proposalId}`);
    },
    [domains, persistVersionedFramework, proposals]
  );

  // ── Reset to Defaults ──────────────────────────────────────

  const resetFramework = useCallback(() => {
    // Force reload from defaults
    localStorage.removeItem("grme-framework");
    const fresh = loadFramework();
    persistFramework(fresh);
  }, [persistFramework]);

  // ── Helpers ─────────────────────────────────────────────────

  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const reviewedProposals = proposals.filter((p) => p.status !== "pending");

  const getTotalIndicators = useCallback((): number => {
    return domains.reduce(
      (sum, d) =>
        sum + d.subdomains.reduce((s, sub) => s + sub.indicators.length, 0),
      0
    );
  }, [domains]);

  const getTotalSubDomains = useCallback((): number => {
    return domains.reduce((sum, d) => sum + d.subdomains.length, 0);
  }, [domains]);

  return {
    domains,
    proposals,
    versions,
    activeVersionId,
    pendingProposals,
    reviewedProposals,
    loaded,

    // Domain CRUD
    proposeAddDomain,
    proposeEditDomain,
    proposeDeleteDomain,

    // SubDomain CRUD
    proposeAddSubDomain,
    proposeEditSubDomain,
    proposeDeleteSubDomain,

    // Indicator CRUD
    proposeAddIndicator,
    proposeEditIndicator,
    proposeDeleteIndicator,

    // Proposal management
    approveProposal,
    rejectProposal,
    applyNow,
    restoreFrameworkVersionById,

    // Utils
    resetFramework,
    getTotalIndicators,
    getTotalSubDomains,

    // Factories
    newDomain,
    newSubDomain,
    newIndicator,
    generateEntityId,

    // Direct inline editor updates
    updateDomainField,
    updateSubDomainField,
    updateIndicatorField,
    addDomainDirect,
    addSubDomainDirect,
    addIndicatorDirect,
    deleteDomainDirect,
    deleteSubDomainDirect,
    deleteIndicatorDirect,
  };
}
