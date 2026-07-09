import {
  Domain,
  SubDomain,
  Indicator,
  IndicatorType,
  DataType,
  Direction,
  Benchmark,
  deepClone,
} from "./grme-data";
import * as api from "./grme-api";
import { DEFAULT_DOMAINS } from "./grme-framework-defaults";

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
const VALID_INDICATOR_TYPES = new Set(["Quantitative", "Qualitative", "Participatory"]);
const VALID_DATA_TYPES = new Set(["number", "percentage", "index", "text", "boolean"]);
const VALID_DIRECTIONS = new Set(["higher", "lower"]);

// ── ID Generation ───────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBenchmark(value: unknown): value is Benchmark {
  return (
    isObject(value) &&
    typeof value.critical === "string" &&
    typeof value.developing === "string" &&
    typeof value.progressive === "string" &&
    typeof value.exemplary === "string"
  );
}

function isIndicator(value: unknown): value is Indicator {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    VALID_INDICATOR_TYPES.has(String(value.type)) &&
    VALID_DATA_TYPES.has(String(value.dataType)) &&
    typeof value.unit === "string" &&
    typeof value.description === "string" &&
    isBenchmark(value.benchmark) &&
    VALID_DIRECTIONS.has(String(value.direction))
  );
}

function isSubDomain(value: unknown): value is SubDomain {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.indicators) &&
    value.indicators.every(isIndicator)
  );
}

function isDomain(value: unknown): value is Domain {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.shortName === "string" &&
    typeof value.description === "string" &&
    typeof value.icon === "string" &&
    typeof value.color === "string" &&
    Array.isArray(value.subdomains) &&
    value.subdomains.every(isSubDomain)
  );
}

function isProposal(value: unknown): value is FrameworkProposal {
  if (!isObject(value)) return false;
  const proposal = value as Record<string, unknown>;
  return (
    typeof proposal.id === "string" &&
    typeof proposal.timestamp === "string" &&
    typeof proposal.proposedBy === "string" &&
    (proposal.action === "add" || proposal.action === "edit" || proposal.action === "delete") &&
    (proposal.entity === "domain" || proposal.entity === "subdomain" || proposal.entity === "indicator") &&
    typeof proposal.entityPath === "string" &&
    isObject(proposal.data) &&
    (proposal.originalData === undefined || isObject(proposal.originalData)) &&
    (proposal.status === "pending" || proposal.status === "approved" || proposal.status === "rejected")
  );
}

function sanitizeFrameworkStorage(value: unknown): FrameworkStorage | null {
  if (!isObject(value)) return null;
  if (!Array.isArray(value.domains) || !Array.isArray(value.proposals)) return null;
  if (!value.domains.every(isDomain)) return null;
  return {
    domains: value.domains,
    proposals: value.proposals.filter(isProposal),
    lastUpdated: typeof value.lastUpdated === "string" ? value.lastUpdated : new Date().toISOString(),
  };
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
      const parsed = sanitizeFrameworkStorage(JSON.parse(raw));
      if (parsed) return parsed;
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
  cacheFramework(seed);
  return seed;
}

export function saveFramework(fw: FrameworkStorage): void {
  if (typeof window === "undefined") return;
  const saved = { ...fw, lastUpdated: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  // Sync to API (fire-and-forget)
  api.saveFramework(saved).catch(() => {});
}

export function cacheFramework(fw: FrameworkStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fw));
}

// ── Default Framework ───────────────────────────────────────────

export function getDefaultFramework(): Domain[] {
  return deepClone(DEFAULT_DOMAINS);
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
  const clone = deepClone(domains);

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
    data: deepClone(data),
    originalData: originalData ? deepClone(originalData) : undefined,
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
  return deepClone(d);
}

export function cloneSubDomain(s: SubDomain): SubDomain {
  return deepClone(s);
}

export function cloneIndicator(i: Indicator): Indicator {
  return deepClone(i);
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
    return sanitizeFrameworkStorage(data);
  } catch {
    return null;
  }
}
