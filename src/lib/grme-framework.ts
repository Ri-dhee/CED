import {
  Domain,
  SubDomain,
  Indicator,
  IndicatorType,
  DataType,
  Direction,
  Benchmark,
} from "./grme-data";
import * as api from "./grme-api";

// ── Proposal Types ──────────────────────────────────────────────

export type ProposalAction = "add" | "edit" | "delete";
export type ProposalEntity = "domain" | "subdomain" | "indicator";
export type ProposalStatus = "pending" | "approved" | "rejected";

export interface FrameworkProposal {
  id: string;
  timestamp: string;
  proposedBy: string;
  action: ProposalAction;
  entity: ProposalEntity;
  entityPath: string;
  data: Domain | SubDomain | Indicator;
  originalData?: Domain | SubDomain | Indicator;
  status: ProposalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface FrameworkStorage {
  domains: Domain[];
  proposals: FrameworkProposal[];
  lastUpdated: string;
}

// ── Constants ───────────────────────────────────────────────────

const STORAGE_KEY = "grme-framework";
const CURRENT_USER = "Stakeholder";

// ── ID Generation ───────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateEntityId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

// ── localStorage ────────────────────────────────────────────────

export function loadFramework(): FrameworkStorage {
  if (typeof window === "undefined") {
    return { domains: [], proposals: [], lastUpdated: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fall through
  }
  // First load — seed from defaults
  const seed: FrameworkStorage = {
    domains: getDefaultFramework(),
    proposals: [],
    lastUpdated: new Date().toISOString(),
  };
  saveFramework(seed);
  return seed;
}

export function saveFramework(fw: FrameworkStorage): void {
  if (typeof window === "undefined") return;
  const saved = { ...fw, lastUpdated: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  // Sync to API (fire-and-forget)
  api.saveFramework(saved).catch(() => {});
}

// ── Default Framework ───────────────────────────────────────────

export function getDefaultFramework(): Domain[] {
  // Deep clone the static DOMAINS from grme-data
  // This avoids circular imports — we just re-export the same data
  return getDefaultDomains();
}

// Lazy import to avoid circular dependency
let _cachedDefaults: Domain[] | null = null;
function getDefaultDomains(): Domain[] {
  if (_cachedDefaults) return _cachedDefaults;
  // Use dynamic import for browser compatibility
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DEFAULT_DOMAINS } = require("./grme-data") as {
    DEFAULT_DOMAINS: Domain[];
  };
  _cachedDefaults = JSON.parse(JSON.stringify(DEFAULT_DOMAINS));
  return _cachedDefaults!;
}

// ── Entity Lookups ──────────────────────────────────────────────

export function findDomain(domains: Domain[], id: string): Domain | undefined {
  return domains.find((d) => d.id === id);
}

export function findSubDomain(
  subdomains: SubDomain[],
  id: string
): SubDomain | undefined {
  return subdomains.find((s) => s.id === id);
}

export function findIndicator(
  indicators: Indicator[],
  id: string
): Indicator | undefined {
  return indicators.find((i) => i.id === id);
}

export function findDomainForSubDomain(
  domains: Domain[],
  subDomainId: string
): Domain | undefined {
  return domains.find((d) => d.subdomains.some((s) => s.id === subDomainId));
}

export function findDomainForIndicator(
  domains: Domain[],
  indicatorId: string
): { domain: Domain; subDomain: SubDomain } | undefined {
  for (const d of domains) {
    for (const s of d.subdomains) {
      if (s.indicators.some((i) => i.id === indicatorId)) {
        return { domain: d, subDomain: s };
      }
    }
  }
  return undefined;
}

// ── Build Entity Path ───────────────────────────────────────────

export function buildEntityPath(
  domains: Domain[],
  entity: ProposalEntity,
  id: string
): string {
  if (entity === "domain") return id;

  for (const d of domains) {
    if (entity === "subdomain") {
      if (d.subdomains.some((s) => s.id === id)) return `${d.id}/${id}`;
    }
    for (const s of d.subdomains) {
      if (s.indicators.some((i) => i.id === id)) {
        return `${d.id}/${s.id}/${id}`;
      }
    }
  }
  return id;
}

// ── Apply Proposal ──────────────────────────────────────────────

export function applyProposal(
  domains: Domain[],
  proposal: FrameworkProposal
): Domain[] {
  const clone = JSON.parse(JSON.stringify(domains)) as Domain[];

  switch (proposal.entity) {
    case "domain":
      return applyDomainProposal(clone, proposal as FrameworkProposal & { data: Domain; originalData?: Domain });
    case "subdomain":
      return applySubDomainProposal(clone, proposal as FrameworkProposal & { data: SubDomain; originalData?: SubDomain });
    case "indicator":
      return applyIndicatorProposal(clone, proposal as FrameworkProposal & { data: Indicator; originalData?: Indicator });
    default:
      return clone;
  }
}

function applyDomainProposal(
  domains: Domain[],
  p: FrameworkProposal & { data: Domain; originalData?: Domain }
): Domain[] {
  switch (p.action) {
    case "add":
      domains.push(p.data as Domain);
      break;
    case "edit": {
      const idx = domains.findIndex((d) => d.id === (p.data as Domain).id);
      if (idx !== -1) domains[idx] = p.data as Domain;
      break;
    }
    case "delete":
      return domains.filter((d) => d.id !== (p.originalData as Domain).id);
  }
  return domains;
}

function applySubDomainProposal(
  domains: Domain[],
  p: FrameworkProposal & { data: SubDomain; originalData?: SubDomain }
): Domain[] {
  const parts = p.entityPath.split("/");
  const domainId = parts[0];
  const domain = domains.find((d) => d.id === domainId);
  if (!domain) return domains;

  switch (p.action) {
    case "add":
      domain.subdomains.push(p.data as SubDomain);
      break;
    case "edit": {
      const idx = domain.subdomains.findIndex(
        (s) => s.id === (p.data as SubDomain).id
      );
      if (idx !== -1) domain.subdomains[idx] = p.data as SubDomain;
      break;
    }
    case "delete":
      domain.subdomains = domain.subdomains.filter(
        (s) => s.id !== (p.originalData as SubDomain).id
      );
      break;
  }
  return domains;
}

function applyIndicatorProposal(
  domains: Domain[],
  p: FrameworkProposal & { data: Indicator; originalData?: Indicator }
): Domain[] {
  const parts = p.entityPath.split("/");
  const domainId = parts[0];
  const subDomainId = parts[1];
  const domain = domains.find((d) => d.id === domainId);
  if (!domain) return domains;
  const subDomain = domain.subdomains.find((s) => s.id === subDomainId);
  if (!subDomain) return domains;

  switch (p.action) {
    case "add":
      subDomain.indicators.push(p.data as Indicator);
      break;
    case "edit": {
      const idx = subDomain.indicators.findIndex(
        (i) => i.id === (p.data as Indicator).id
      );
      if (idx !== -1) subDomain.indicators[idx] = p.data as Indicator;
      break;
    }
    case "delete":
      subDomain.indicators = subDomain.indicators.filter(
        (i) => i.id !== (p.originalData as Indicator).id
      );
      break;
  }
  return domains;
}

// ── Proposal Helpers ────────────────────────────────────────────

export function createProposal(
  action: ProposalAction,
  entity: ProposalEntity,
  entityPath: string,
  data: Domain | SubDomain | Indicator,
  originalData?: Domain | SubDomain | Indicator,
  user?: string
): FrameworkProposal {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    proposedBy: user || CURRENT_USER,
    action,
    entity,
    entityPath,
    data: JSON.parse(JSON.stringify(data)),
    originalData: originalData
      ? JSON.parse(JSON.stringify(originalData))
      : undefined,
    status: "pending",
  };
}

export function getProposalSummary(p: FrameworkProposal): string {
  const entityLabel =
    p.entity.charAt(0).toUpperCase() + p.entity.slice(1);
  const actionLabel =
    p.action === "add"
      ? "Add"
      : p.action === "edit"
      ? "Edit"
      : "Delete";

  const name =
    p.entity === "domain"
      ? (p.data as Domain).name
      : p.entity === "subdomain"
      ? (p.data as SubDomain).name
      : (p.data as Indicator).name;

  return `${actionLabel} ${entityLabel}: ${name}`;
}

// ── Clone helpers for forms ─────────────────────────────────────

export function cloneDomain(d: Domain): Domain {
  return JSON.parse(JSON.stringify(d));
}

export function cloneSubDomain(s: SubDomain): SubDomain {
  return JSON.parse(JSON.stringify(s));
}

export function cloneIndicator(i: Indicator): Indicator {
  return JSON.parse(JSON.stringify(i));
}

// ── New entity factories ────────────────────────────────────────

export function newDomain(): Domain {
  return {
    id: generateEntityId("domain"),
    aliases: [],
    name: "",
    shortName: "",
    description: "",
    methodologyNote: "",
    icon: "shield",
    color: "#6366f1",
    subdomains: [],
  };
}

export function newSubDomain(): SubDomain {
  return {
    id: generateEntityId("subdomain"),
    aliases: [],
    name: "",
    indicators: [],
  };
}

export function newIndicator(): Indicator {
  return {
    id: generateEntityId("indicator"),
    aliases: [],
    name: "",
    type: "Quantitative" as IndicatorType,
    dataType: "percentage" as DataType,
    unit: "%",
    description: "",
    benchmark: {
      critical: "0",
      developing: "25",
      progressive: "50",
      exemplary: "75",
    },
    direction: "higher" as Direction,
    validationStatus: "draft",
  };
}

// ── Icons list ──────────────────────────────────────────────────

export const AVAILABLE_ICONS = [
  "shield",
  "map",
  "home",
  "chart",
  "heart",
  "users",
  "leaf",
  "globe",
] as const;

// ── Colors list ─────────────────────────────────────────────────

export const AVAILABLE_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#6366f1",
  "#14b8a6",
  "#f97316",
] as const;

// ── Async API Load ────────────────────────────────────────────────

export async function loadFrameworkFromApi(): Promise<FrameworkStorage | null> {
  try {
    const data = await api.loadFramework();
    if (data && data.domains && data.domains.length > 0) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
