/**
 * GRME Index — Supabase API Client
 *
 * Direct Supabase queries — no polling, no rate limits.
 * Real-time subscriptions handled in the store hooks.
 */

import { supabase } from "./supabase";
import {
  AuditLog,
  CityData,
  IndicatorData,
  AuditEntry,
  CITIES,
  Thromde,
} from "./grme-data";
import { FrameworkStorage } from "./grme-framework";
import { ManagedUser } from "./grme-managed-users";
import { DataEntryWindowConfig } from "./grme-user";

const ADMIN_AUDIT_CITY_ID = "__admin__";
const WRITE_RETRY_LIMIT = 3;
const WRITE_RETRY_BASE_DELAY_MS = 75;

function generateEntryId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Unknown error";
}

function isRetryableWriteError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const code = error && typeof error === "object" && "code" in error
    ? String((error as { code?: unknown }).code || "").toUpperCase()
    : "";

  return (
    ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].includes(code) ||
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("fetch failed") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("bad gateway") ||
    message.includes("service unavailable") ||
    message.includes("gateway timeout") ||
    message.includes("too many requests")
  );
}

async function withWriteRetry<T>(operation: string, run: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= WRITE_RETRY_LIMIT; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt === WRITE_RETRY_LIMIT || !isRetryableWriteError(error)) {
        throw error;
      }
      await sleep(WRITE_RETRY_BASE_DELAY_MS * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${operation} failed`);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isNamedLocation(value: unknown): value is { id: string; name: string } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && typeof (value as { id?: unknown }).id === "string" && typeof (value as { name?: unknown }).name === "string";
}

async function loadConfigValue(key: string): Promise<string | null> {
  const { data, error } = await supabase()
    .from("config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return (data?.value as string | null) ?? null;
}

async function saveConfigValue(key: string, value: string): Promise<void> {
  await withWriteRetry("saveConfigValue", async () => {
    const { error } = await supabase().from("config").upsert({ key, value }, { onConflict: "key" });
    if (error) throw error;
  });
}

function normalizeNamedLocations(value: unknown): Array<{ id: string; name: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter(isNamedLocation).map((location) => ({
    id: location.id.trim(),
    name: location.name.trim(),
  })).filter((location) => location.id && location.name);
}

export async function loadDataEntryWindowConfig(): Promise<DataEntryWindowConfig | null> {
  const raw = await loadConfigValue("data_entry_window");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DataEntryWindowConfig>;
    return {
      enabled: parsed.enabled === true,
      startAt: typeof parsed.startAt === "string" ? parsed.startAt : null,
      endAt: typeof parsed.endAt === "string" ? parsed.endAt : null,
    };
  } catch {
    return null;
  }
}

export async function saveDataEntryWindowConfig(window: DataEntryWindowConfig): Promise<void> {
  await saveConfigValue("data_entry_window", JSON.stringify(window));
}

export async function loadDzongkhagsConfig(): Promise<Array<{ id: string; name: string }>> {
  const raw = await loadConfigValue("dzongkhags");
  if (!raw) return CITIES.map((city) => ({ id: city.id, name: city.name }));

  try {
    const parsed = normalizeNamedLocations(JSON.parse(raw));
    return parsed.length > 0 ? parsed : CITIES.map((city) => ({ id: city.id, name: city.name }));
  } catch {
    return CITIES.map((city) => ({ id: city.id, name: city.name }));
  }
}

export async function saveDzongkhagsConfig(dzongkhags: Array<{ id: string; name: string }>): Promise<void> {
  const payload = dzongkhags
    .map((dzongkhag) => ({ id: dzongkhag.id.trim(), name: dzongkhag.name.trim() }))
    .filter((dzongkhag) => dzongkhag.id && dzongkhag.name);
  await saveConfigValue("dzongkhags", JSON.stringify(payload));
}

export async function deleteDzongkhag(id: string): Promise<void> {
  await withWriteRetry("deleteDzongkhagThromdes", async () => {
    const { error } = await supabase()
      .from("thromdes")
      .delete()
      .eq("dzongkhag_id", id);
    if (error) throw error;
  });

  const existing = await loadDzongkhagsConfig();
  const next = existing.filter((dzongkhag) => dzongkhag.id !== id);
  await saveDzongkhagsConfig(next);
}

export async function recordAdminEvent(params: {
  actor: string;
  action: "create" | "update" | "delete" | "review";
  entity: string;
  notes: string;
}): Promise<void> {
  const actor = normalizeText(params.actor);
  if (!actor) throw new Error("Admin event actor is required");

  const row = {
    city_id: ADMIN_AUDIT_CITY_ID,
    year: new Date().getFullYear(),
    indicator_id: `admin:${params.entity}`,
    entry_id: generateEntryId(),
    timestamp: new Date().toISOString(),
    user: actor,
    action: params.action,
    field: params.entity,
    old_value: "",
    new_value: params.notes,
    notes: params.notes,
  };

  await withWriteRetry("recordAdminEvent", async () => {
    const { error } = await supabase().from("audit_log").upsert(row, {
      onConflict: "city_id,year,indicator_id,entry_id",
    });
    if (error) throw error;
  });
}

// ── Assessments ──────────────────────────────────────────────────

export async function loadAssessments(cityId?: string, year?: number): Promise<Record<string, CityData>> {
  let query = supabase().from("assessment_data").select("*");
  if (cityId) query = query.eq("city_id", cityId);
  if (typeof year === "number") query = query.eq("year", year);
  const { data, error } = await query;

  if (error) throw error;

  const result: Record<string, CityData> = {};

  for (const row of data || []) {
    const cityId = row.city_id;
    const year = row.year;
    const thromdeId = row.thromde_id || null;

    if (!result[cityId]) {
      result[cityId] = {
        cityId,
        cityName: getCityName(cityId),
        assessments: {},
        thromdeAssessments: {},
      };
    }
    const targetAssessments = thromdeId
      ? (result[cityId].thromdeAssessments![thromdeId] ||= {})
      : result[cityId].assessments;
    if (!targetAssessments[year]) {
      targetAssessments[year] = {
        year,
        indicators: {},
        auditLog: [],
        createdAt: "",
        updatedAt: "",
        thromdeId: thromdeId || undefined,
      };
    }

    const assessment = targetAssessments[year];
    assessment.indicators[row.indicator_id] = {
      indicatorId: row.indicator_id,
      value: row.value === "" || row.value === null ? null : parseValue(row.value),
      evidence: row.evidence || undefined,
      notes: row.notes || undefined,
      lastUpdated: row.last_updated || "",
      updatedBy: row.updated_by || "",
    };

    const ts = row.last_updated || "";
    if (ts && (!assessment.createdAt || ts < assessment.createdAt)) {
      assessment.createdAt = ts;
    }
    if (ts && (!assessment.updatedAt || ts > assessment.updatedAt)) {
      assessment.updatedAt = ts;
    }
  }

  return result;
}

export async function loadAdminEvents(): Promise<AuditLog[]> {
  const raw = await loadAllAuditLogEntries(ADMIN_AUDIT_CITY_ID);
  const grouped: Record<string, AuditLog> = {};

  for (const row of raw) {
    const indicatorId = (row.indicator_id as string) || "";
    if (!indicatorId) continue;
    const entry = {
      id: (row.entry_id as string) || "",
      timestamp: (row.timestamp as string) || new Date().toISOString(),
      user: (row.user as string) || "unknown",
      action: (row.action as string) as "create" | "update" | "review",
      field: (row.field as string) || "",
      oldValue: ((row.old_value as string) || undefined) as string | undefined,
      newValue: (row.new_value as string) || "",
      notes: ((row.notes as string) || undefined) as string | undefined,
    };

    if (!grouped[indicatorId]) {
      grouped[indicatorId] = { indicatorId, entries: [entry] };
    } else {
      grouped[indicatorId].entries.push(entry);
    }
  }

  return Object.values(grouped).sort(
    (a, b) => new Date(b.entries[0]?.timestamp || 0).getTime() - new Date(a.entries[0]?.timestamp || 0).getTime()
  );
}

export async function saveAssessment(
  cityId: string,
  year: number,
  indicatorId: string,
  data: IndicatorData,
  thromdeId?: string,
  actor?: string
): Promise<void> {
  const lastUpdated = new Date().toISOString();
  const updatedBy = normalizeText(data.updatedBy);
  const payload = {
    city_id: cityId,
    year,
    indicator_id: indicatorId,
    value: data.value !== null && data.value !== undefined ? String(data.value) : "",
    evidence: data.evidence || "",
    notes: data.notes || "",
    last_updated: lastUpdated,
    updated_by: updatedBy,
    thromde_id: thromdeId || null,
  };

  await withWriteRetry("saveAssessment", async () => {
    const { error } = await supabase().from("assessment_data").upsert(payload, { onConflict: "city_id,year,indicator_id" });
    if (error) throw error;
  });

  const adminActor = normalizeText(actor);
  if (adminActor) {
    await recordAdminEvent({
      actor: adminActor,
      action: "update",
      entity: "assessment",
      notes: JSON.stringify({ cityId, year, indicatorId, thromdeId, value: data.value ?? null }),
    });
  }
}

export async function saveAssessments(
  cityId: string,
  year: number,
  indicators: Record<string, IndicatorData>,
  thromdeId?: string,
  actor?: string
): Promise<void> {
  const lastUpdated = new Date().toISOString();
  const rows = Object.entries(indicators).map(([indicatorId, data]) => ({
    city_id: cityId,
    year,
    indicator_id: indicatorId,
    value: data.value !== null && data.value !== undefined ? String(data.value) : "",
    evidence: data.evidence || "",
    notes: data.notes || "",
    last_updated: lastUpdated,
    updated_by: normalizeText(data.updatedBy),
    thromde_id: thromdeId || null,
  }));

  if (rows.length === 0) return;

  await withWriteRetry("saveAssessments", async () => {
    const { error } = await supabase().from("assessment_data").upsert(rows, { onConflict: "city_id,year,indicator_id" });
    if (error) throw error;
  });

  const adminActor = normalizeText(actor);
  if (adminActor) {
    await recordAdminEvent({
      actor: adminActor,
      action: "update",
      entity: "assessment-bulk",
      notes: JSON.stringify({ cityId, year, count: rows.length, thromdeId }),
    });
  }
}

export async function deleteYear(
  cityId: string,
  year: number,
  thromdeId?: string
): Promise<void> {
  await withWriteRetry("deleteYear", async () => {
    let query = supabase()
      .from("assessment_data")
      .delete()
      .eq("city_id", cityId)
      .eq("year", year);
    query = thromdeId ? query.eq("thromde_id", thromdeId) : query.is("thromde_id", null);
    const { error } = await query;
    if (error) throw error;
  });
}

// ── Audit Log ────────────────────────────────────────────────────

/** Load audit entries grouped by city → year → indicatorId.
 *  Returns a structure ready to merge into CityData. */
export async function loadAuditLogsForAssessment(cityId?: string, year?: number): Promise<
  Record<string, Record<number, AuditLog[]>>
> {
  const raw = await loadAllAuditLogEntries(cityId, year);
  const result: Record<string, Record<number, AuditLog[]>> = {};

  for (const row of raw) {
    const cityId = (row.city_id as string) || "";
    const year = (row.year as number) || 0;
    const indicatorId = (row.indicator_id as string) || "";
    if (!cityId || !year || !indicatorId) continue;
    if (!result[cityId]) result[cityId] = {};
    if (!result[cityId][year]) result[cityId][year] = [];

    const entry = {
      id: (row.entry_id as string) || "",
      timestamp: (row.timestamp as string) || new Date().toISOString(),
      user: (row.user as string) || "unknown",
      action: (row.action as string) as "create" | "update" | "review",
      field: (row.field as string) || "",
      oldValue: ((row.old_value as string) || undefined) as string | undefined,
      newValue: (row.new_value as string) || "",
      notes: ((row.notes as string) || undefined) as string | undefined,
    };

    const existing = result[cityId][year].find(
      (a) => a.indicatorId === indicatorId
    );
    if (existing) {
      existing.entries.push(entry);
    } else {
      result[cityId][year].push({
        indicatorId,
        entries: [entry],
      });
    }
  }

  return result;
}

export async function loadAuditLog(
  page: number = 0,
  pageSize: number = 500,
  cityId?: string,
  year?: number
): Promise<{ entries: Record<string, unknown>[]; total: number | null }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase().from("audit_log").select("*", { count: "estimated" }).order("timestamp", { ascending: false });
  if (cityId) query = query.eq("city_id", cityId);
  if (typeof year === "number") query = query.eq("year", year);

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return { entries: data || [], total: count };
}

export async function loadAllAuditLogEntries(cityId?: string, year?: number): Promise<Record<string, unknown>[]> {
  const PAGE_SIZE = 1000;
  let all: Record<string, unknown>[] = [];
  let page = 0;
  let fetched: Record<string, unknown>[];

  do {
    const { entries } = await loadAuditLog(page, PAGE_SIZE, cityId, year);
    fetched = entries;
    all = all.concat(fetched);
    page++;
  } while (fetched.length === PAGE_SIZE);

  return all;
}

export async function addAuditEntry(
  cityId: string,
  year: number,
  indicatorId: string,
  entry: AuditEntry
): Promise<void> {
  const payload = {
    city_id: cityId,
    year,
    indicator_id: indicatorId,
    entry_id: entry.id,
    timestamp: entry.timestamp,
    user: entry.user,
    action: entry.action,
    field: entry.field,
    old_value: entry.oldValue || "",
    new_value: entry.newValue,
    notes: entry.notes || "",
  };

  await withWriteRetry("addAuditEntry", async () => {
    const { error } = await supabase().from("audit_log").upsert(payload, {
      onConflict: "city_id,year,indicator_id,entry_id",
    });
    if (error) throw error;
  });
}

// ── Framework ────────────────────────────────────────────────────

export async function loadFramework(): Promise<FrameworkStorage | null> {
  const { data, error } = await supabase()
    .from("framework")
    .select("value")
    .eq("key", "framework")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data?.value || null;
}

export async function saveFramework(framework: FrameworkStorage, actor?: string): Promise<void> {
  const payload = {
    key: "framework",
    value: framework,
    last_updated: new Date().toISOString(),
  };

  await withWriteRetry("saveFramework", async () => {
    const { error } = await supabase().from("framework").upsert(payload, { onConflict: "key" });
    if (error) throw error;
  });

  const adminActor = normalizeText(actor);
  if (adminActor) {
    await recordAdminEvent({
      actor: adminActor,
      action: "update",
      entity: "framework",
      notes: JSON.stringify({ domains: framework.domains.length, proposals: framework.proposals.length }),
    });
  }
}

// ── Managed Users ────────────────────────────────────────────────

export async function loadUsers(): Promise<ManagedUser[]> {
  const { data, error } = await supabase()
    .from("managed_users")
    .select("*");

  if (error) throw error;
  return (data || []).map((u) => ({
    ...u,
    active: u.active === true || u.active === "true",
    stakeholderId: u.stakeholder_id || "",
    dzongkhagId: u.dzongkhag_id || "",
    thromdeId: u.thromde_id || null,
    allowedDomainIds: normalizeStringArray(u.allowed_domain_ids),
    allowedIndicatorIds: normalizeStringArray(u.allowed_indicator_ids),
    allowedDzongkhagIds: normalizeStringArray(u.allowed_dzongkhag_ids),
    allowedThromdeIds: normalizeStringArray(u.allowed_thromde_ids),
  }));
}

export async function saveUsers(users: ManagedUser[], actor?: string): Promise<void> {
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    password_hash: u.passwordHash,
    created_at: u.createdAt,
    last_login_at: u.lastLoginAt,
    active: u.active,
    stakeholder_id: u.stakeholderId || "",
    dzongkhag_id: u.dzongkhagId || "",
    thromde_id: u.thromdeId || null,
    allowed_domain_ids: u.allowedDomainIds || [],
    allowed_indicator_ids: u.allowedIndicatorIds || [],
    allowed_dzongkhag_ids: u.allowedDzongkhagIds || [],
    allowed_thromde_ids: u.allowedThromdeIds || [],
  }));

  await withWriteRetry("saveUsers", async () => {
    const { error: delError } = await supabase()
      .from("managed_users")
      .delete()
      .neq("id", "__delete_all__");

    if (delError) throw delError;

    if (rows.length === 0) return;

    const { error } = await supabase().from("managed_users").insert(rows);
    if (error) throw error;
  });

  const adminActor = normalizeText(actor);
  if (adminActor) {
    await recordAdminEvent({
      actor: adminActor,
      action: "update",
      entity: "managed-users",
      notes: JSON.stringify({ count: users.length }),
    });
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function parseValue(val: unknown): number | string | boolean | null {
  if (val === null || val === undefined || val === "") return null;
  if (val === true || val === false) return val;
  if (typeof val === "string") {
    const normalized = val.trim().toLowerCase();
    if (normalized === "true" || normalized === "yes") return true;
    if (normalized === "false" || normalized === "no") return false;
  }
  const num = Number(val);
  return Number.isNaN(num) ? String(val) : num;
}

function getCityName(cityId: string): string {
  return CITIES.find((c) => c.id === cityId)?.name || cityId;
}

// ── Thromdes ────────────────────────────────────────────────────

export async function loadThromdes(): Promise<Thromde[]> {
  const { data, error } = await supabase()
    .from("thromdes")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function saveThromde(thromde: Thromde): Promise<void> {
  await withWriteRetry("saveThromde", async () => {
    const { error } = await supabase()
      .from("thromdes")
      .upsert({
        id: thromde.id,
        dzongkhag_id: thromde.dzongkhagId,
        name: thromde.name,
      }, { onConflict: "id" });
    if (error) throw error;
  });
}

export async function deleteThromde(id: string): Promise<void> {
  await withWriteRetry("deleteThromde", async () => {
    const { error } = await supabase()
      .from("thromdes")
      .delete()
      .eq("id", id);
    if (error) throw error;
  });
}

// ── Queue status ────────────────────────────────────────────────

export function getQueueStatus(): { active: number; pending: number } {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("grme-pending-mutations") : null;
    if (!raw) return { active: 0, pending: 0 };
    const queue = JSON.parse(raw);
    const pending = Array.isArray(queue) ? queue.length : 0;
    return { active: 0, pending };
  } catch {
    return { active: 0, pending: 0 };
  }
}
