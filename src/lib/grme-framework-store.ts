"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Domain,
  SubDomain,
  Indicator,
} from "./grme-data";
import {
  FrameworkProposal,
  loadFramework,
  saveFramework,
  createProposal,
  applyProposal,
  generateEntityId,
  newDomain,
  newSubDomain,
  newIndicator,
} from "./grme-framework";

const CURRENT_USER = "Stakeholder";

export function useGRMEFramework() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [proposals, setProposals] = useState<FrameworkProposal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fw = loadFramework();
    setDomains(fw.domains);
    setProposals(fw.proposals);
    setLoaded(true);
  }, []);

  const persist = useCallback(
    (newDomains: Domain[], newProposals: FrameworkProposal[]) => {
      setDomains(newDomains);
      setProposals(newProposals);
      saveFramework({
        domains: newDomains,
        proposals: newProposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    []
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

  // ── Direct Update (spreadsheet inline editing) ──────────────

  const updateDomainField = useCallback(
    (domainId: string, field: string, value: string) => {
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        const updated = { ...d };
        if (field === "name") updated.name = value;
        else if (field === "shortName") updated.shortName = value;
        else if (field === "id") updated.id = value;
        else if (field === "description") updated.description = value;
        else if (field === "color") updated.color = value;
        else if (field === "icon") updated.icon = value;
        return updated;
      });
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
  );

  const updateSubDomainField = useCallback(
    (domainId: string, subId: string, field: string, value: string) => {
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        return {
          ...d,
          subdomains: d.subdomains.map((s) => {
            if (s.id !== subId) return s;
            if (field === "name") return { ...s, name: value };
            if (field === "id") return { ...s, id: value };
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
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
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
                if (field === "name") return { ...ind, name: value };
                if (field === "id") return { ...ind, id: value };
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
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
  );

  // ── Direct Add (spreadsheet) ────────────────────────────────

  const addDomainDirect = useCallback(() => {
    const d = newDomain();
    d.name = "New Domain";
    d.shortName = "New";
    const newDomains = [...domains, d];
    setDomains(newDomains);
    saveFramework({
      domains: newDomains,
      proposals,
      lastUpdated: new Date().toISOString(),
    });
  }, [domains, proposals]);

  const addSubDomainDirect = useCallback(
    (domainId: string) => {
      const s = newSubDomain();
      s.name = "New Sub-Domain";
      const newDomains = domains.map((d) =>
        d.id === domainId ? { ...d, subdomains: [...d.subdomains, s] } : d
      );
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
  );

  const addIndicatorDirect = useCallback(
    (domainId: string, subId: string) => {
      const ind = newIndicator();
      ind.name = "New Indicator";
      const newDomains = domains.map((d) => {
        if (d.id !== domainId) return d;
        return {
          ...d,
          subdomains: d.subdomains.map((s) =>
            s.id === subId ? { ...s, indicators: [...s.indicators, ind] } : s
          ),
        };
      });
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
  );

  // ── Direct Delete (spreadsheet) ─────────────────────────────

  const deleteDomainDirect = useCallback(
    (domainId: string) => {
      const newDomains = domains.filter((d) => d.id !== domainId);
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
  );

  const deleteSubDomainDirect = useCallback(
    (domainId: string, subId: string) => {
      const newDomains = domains.map((d) =>
        d.id === domainId
          ? { ...d, subdomains: d.subdomains.filter((s) => s.id !== subId) }
          : d
      );
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
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
      setDomains(newDomains);
      saveFramework({
        domains: newDomains,
        proposals,
        lastUpdated: new Date().toISOString(),
      });
    },
    [domains, proposals]
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

      persist(newDomains, newProposals);
    },
    [domains, proposals, persist]
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

      persist(domains, newProposals);
    },
    [domains, proposals, persist]
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

      persist(newDomains, newProposals);
    },
    [domains, proposals, persist]
  );

  // ── Reset to Defaults ──────────────────────────────────────

  const resetFramework = useCallback(() => {
    const fw = loadFramework();
    // Force reload from defaults
    localStorage.removeItem("grme-framework");
    const fresh = loadFramework();
    setDomains(fresh.domains);
    setProposals(fresh.proposals);
    saveFramework(fresh);
  }, []);

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

    // Utils
    resetFramework,
    getTotalIndicators,
    getTotalSubDomains,

    // Factories
    newDomain,
    newSubDomain,
    newIndicator,
    generateEntityId,

    // Direct spreadsheet updates
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
