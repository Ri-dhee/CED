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
} from "./grme-data";
import { FrameworkStorage } from "./grme-framework";
import { ManagedUser } from "./grme-managed-users";

// ── Assessments ──────────────────────────────────────────────────

export async function loadAssessments(): Promise<Record<string, CityData>> {
  const { data, error } = await supabase()
    .from("assessment_data")
    .select("*");

  if (error) throw error;

  const result: Record<string, CityData> = {};

  for (const row of data || []) {
    const cityId = row.city_id;
    const year = row.year;

    if (!result[cityId]) {
      result[cityId] = {
        cityId,
        cityName: getCityName(cityId),
        assessments: {},
      };
    }
    if (!result[cityId].assessments[year]) {
      result[cityId].assessments[year] = {
        year,
        indicators: {},
        auditLog: [],
        createdAt: "",
        updatedAt: "",
      };
    }

    const assessment = result[cityId].assessments[year];
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

export async function saveAssessment(
  cityId: string,
  year: number,
  indicatorId: string,
  data: IndicatorData
): Promise<void> {
  const { error } = await supabase().from("assessment_data").upsert(
    {
      city_id: cityId,
      year,
      indicator_id: indicatorId,
      value: data.value !== null && data.value !== undefined ? String(data.value) : "",
      evidence: data.evidence || "",
      notes: data.notes || "",
      last_updated: new Date().toISOString(),
      updated_by: data.updatedBy || "",
    },
    { onConflict: "city_id,year,indicator_id" }
  );
  if (error) throw error;
}

export async function saveAssessments(
  cityId: string,
  year: number,
  indicators: Record<string, IndicatorData>
): Promise<void> {
  const rows = Object.entries(indicators).map(([indicatorId, data]) => ({
    city_id: cityId,
    year,
    indicator_id: indicatorId,
    value: data.value !== null && data.value !== undefined ? String(data.value) : "",
    evidence: data.evidence || "",
    notes: data.notes || "",
    last_updated: new Date().toISOString(),
    updated_by: data.updatedBy || "",
  }));

  if (rows.length === 0) return;

  const { error } = await supabase()
    .from("assessment_data")
    .upsert(rows, { onConflict: "city_id,year,indicator_id" });
  if (error) throw error;
}

export async function deleteYear(
  cityId: string,
  year: number
): Promise<void> {
  const { error } = await supabase()
    .from("assessment_data")
    .delete()
    .eq("city_id", cityId)
    .eq("year", year);
  if (error) throw error;
}

// ── Audit Log ────────────────────────────────────────────────────

/** Load audit entries grouped by city → year → indicatorId.
 *  Returns a structure ready to merge into CityData. */
export async function loadAuditLogsForAssessment(): Promise<
  Record<string, Record<number, AuditLog[]>>
> {
  const raw = await loadAllAuditLogEntries();
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
  pageSize: number = 500
): Promise<{ entries: Record<string, unknown>[]; total: number | null }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase()
    .from("audit_log")
    .select("*", { count: "estimated" })
    .order("timestamp", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { entries: data || [], total: count };
}

export async function loadAllAuditLogEntries(): Promise<Record<string, unknown>[]> {
  const PAGE_SIZE = 1000;
  let all: Record<string, unknown>[] = [];
  let page = 0;
  let fetched: Record<string, unknown>[];

  do {
    const { entries } = await loadAuditLog(page, PAGE_SIZE);
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
  const { error } = await supabase().from("audit_log").insert({
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
  });
  if (error) throw error;
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

export async function saveFramework(framework: FrameworkStorage): Promise<void> {
  const { error } = await supabase().from("framework").upsert(
    {
      key: "framework",
      value: framework,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) throw error;
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
  }));
}

export async function saveUsers(users: ManagedUser[]): Promise<void> {
  // Delete all then insert (simple approach for small user lists)
  const { error: delError } = await supabase()
    .from("managed_users")
    .delete()
    .neq("id", "__delete_all__");

  if (delError) throw delError;

  if (users.length === 0) return;

  const { error } = await supabase().from("managed_users").insert(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      password_hash: u.passwordHash,
      created_at: u.createdAt,
      last_login_at: u.lastLoginAt,
      active: u.active,
    }))
  );
  if (error) throw error;
}

// ── Health check ─────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const { error } = await supabase().from("config").select("key").limit(1);
    return !error;
  } catch {
    return false;
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
  const cities: Record<string, string> = {
    thimphu: "Thimphu",
    phuntsholing: "Phuntsholing",
    gelephu: "Gelephu",
    paro: "Paro",
  };
  return cities[cityId] || cityId;
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
