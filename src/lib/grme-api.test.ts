import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => {
  const query: Record<string, unknown> = {};
  const supabaseInstance = {
    from: vi.fn(() => query),
  };

  query.upsert = vi.fn();
  query.insert = vi.fn();
  query.delete = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.is = vi.fn(() => query);
  query.neq = vi.fn(() => query);
  query.select = vi.fn(() => query);
  query.order = vi.fn(() => query);
  query.range = vi.fn(async () => ({ data: [], error: null, count: 0 }));

  return { query, supabaseInstance };
});

vi.mock("./supabase", () => ({
  supabase: () => db.supabaseInstance as unknown as ReturnType<typeof vi.fn>,
  hasSupabaseConfig: true,
}));

import { addAuditEntry, recordAdminEvent, saveAssessment } from "./grme-api";

describe("grme-api write hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries transient assessment writes", async () => {
    (db.query.upsert as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("network timeout"))
      .mockResolvedValueOnce({ error: null });

    await saveAssessment(
      "thimphu",
      2026,
      "ind-1",
      { indicatorId: "ind-1", value: 1, notes: "test", updatedBy: "tester", lastUpdated: "" }
    );

    expect(db.query.upsert).toHaveBeenCalledTimes(2);
  });

  it("upserts audit entries with an idempotent conflict key", async () => {
    (db.query.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });

    await addAuditEntry("thimphu", 2026, "ind-1", {
      id: "entry-1",
      timestamp: new Date().toISOString(),
      user: "tester",
      action: "create",
      field: "value",
      newValue: "1",
    });

    expect(db.query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        city_id: "thimphu",
        year: 2026,
        indicator_id: "ind-1",
        entry_id: "entry-1",
      }),
      expect.objectContaining({ onConflict: "city_id,year,indicator_id,entry_id" })
    );
  });

  it("stores admin events with the same idempotent conflict key", async () => {
    (db.query.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });

    await recordAdminEvent({
      actor: "Admin",
      action: "update",
      entity: "framework",
      notes: "saved",
    });

    expect(db.query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        city_id: "__admin__",
        indicator_id: "admin:framework",
        user: "Admin",
      }),
      expect.objectContaining({ onConflict: "city_id,year,indicator_id,entry_id" })
    );
  });
});
