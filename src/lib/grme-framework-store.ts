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
  };
}
