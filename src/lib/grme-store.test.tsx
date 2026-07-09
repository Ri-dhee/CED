import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Domain } from "./grme-data";

// ── Domain fixture used by all tests ──────────────────────────

const domains: Domain[] = [
  {
    id: "safety-security",
    name: "Safety and Security",
    shortName: "Safety",
    description: "",
    icon: "shield",
    color: "#ef4444",
    subdomains: [
      {
        id: "public-space-safety",
        name: "Public Space Safety",
        indicators: [
          {
            id: "ss-1",
            name: "% of women who feel safe walking alone at night",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "",
            benchmark: { critical: "0", developing: "30", progressive: "50", exemplary: "70" },
            direction: "higher",
          },
          {
            id: "ss-2",
            name: "Rate of GBV incidents per 10,000 women",
            type: "Quantitative",
            dataType: "number",
            unit: "per 10k",
            description: "",
            benchmark: { critical: "50", developing: "30", progressive: "15", exemplary: "5" },
            direction: "lower",
          },
        ],
      },
    ],
  },
  {
    id: "health",
    name: "Health",
    shortName: "Health",
    description: "",
    icon: "heart",
    color: "#f97316",
    subdomains: [
      {
        id: "maternal-health",
        name: "Maternal Health",
        indicators: [
          {
            id: "h-1",
            name: "Maternal mortality rate",
            type: "Quantitative",
            dataType: "number",
            unit: "per 100k",
            description: "",
            benchmark: { critical: "200", developing: "100", progressive: "50", exemplary: "20" },
            direction: "lower",
          },
        ],
      },
    ],
  },
];

// ── Mocks ─────────────────────────────────────────────────────

const mockApiFns = {
  loadAssessments: vi.fn(),
  loadThromdes: vi.fn(),
  saveAssessments: vi.fn(),
  saveAssessment: vi.fn(),
  deleteYear: vi.fn(),
  addAuditEntry: vi.fn(),
  loadAuditLogsForAssessment: vi.fn().mockResolvedValue({}),
};

let supabaseHasConfig = false;

const mockSupabaseClient = {
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  })),
  removeChannel: vi.fn(),
};

vi.mock("@/lib/supabase", () => ({
  get hasSupabaseConfig() { return supabaseHasConfig; },
  supabase: vi.fn(() => mockSupabaseClient),
}));

vi.mock("@/lib/grme-api", () => mockApiFns);

// ── Helpers ───────────────────────────────────────────────────

async function mountHook(userName = "Tester", selectedYear = 2026) {
  const mod = await import("./grme-store");
  return renderHook(() => mod.useGRMEData(domains, userName, selectedYear));
}

async function updateAndWait(hook: { current: { updateIndicator: (id: string, value: number | string | boolean, notes?: string) => Promise<void> } }, id: string, value: number | string | boolean, notes?: string) {
  await act(async () => {
    await hook.current.updateIndicator(id, value, notes);
  });
}

function getLocalStorage() {
  return JSON.parse(localStorage.getItem("grme-data") || "{}");
}

// ── Tests: Offline (no Supabase) ─────────────────────────────

describe("useGRMEData (offline mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseHasConfig = false;
    localStorage.clear();
  });

  // ── updateIndicator ──────────────────────────────────────

  describe("updateIndicator", () => {
    it("writes value and notes to local state immediately", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 65, "Field survey Q3");
      expect(result.current.assessment.indicators["ss-1"]?.value).toBe(65);
      expect(result.current.assessment.indicators["ss-1"]?.notes).toBe("Field survey Q3");
    });

    it("persists to localStorage", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 72, "Verified");
      const stored = getLocalStorage();
      expect(stored.thimphu.assessments[2026].indicators["ss-1"].value).toBe(72);
      expect(stored.thimphu.assessments[2026].indicators["ss-1"].notes).toBe("Verified");
    });

    it("creates an audit entry with action 'create' for first write", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 50, "Initial");
      const audit = result.current.assessment.auditLog.find((a) => a.indicatorId === "ss-1");
      expect(audit).toBeDefined();
      expect(audit!.entries[0].action).toBe("create");
      expect(audit!.entries[0].user).toBe("Tester");
      expect(audit!.entries[0].oldValue).toBeUndefined();
      expect(audit!.entries[0].newValue).toBe("50");
    });

    it("appends audit entry with action 'update' and oldValue on subsequent writes", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 50, "First");
      await updateAndWait(result, "ss-1", 75, "Second");
      const audit = result.current.assessment.auditLog.find((a) => a.indicatorId === "ss-1");
      expect(audit!.entries).toHaveLength(2);
      expect(audit!.entries[0].action).toBe("create");
      expect(audit!.entries[1].action).toBe("update");
      expect(audit!.entries[1].oldValue).toBe("50");
      expect(audit!.entries[1].newValue).toBe("75");
    });

    it("handles boolean values", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", true);
      expect(result.current.assessment.indicators["ss-1"]?.value).toBe(true);
      const stored = getLocalStorage();
      expect(stored.thimphu.assessments[2026].indicators["ss-1"].value).toBe(true);
    });

    it("stores string notes and handles missing notes", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 80);
      expect(result.current.assessment.indicators["ss-1"]?.notes).toBeUndefined();
    });

    it("updates updatedAt timestamp on each write", async () => {
      const { result } = await mountHook();
      const before = result.current.assessment.updatedAt;
      await new Promise((r) => setTimeout(r, 10));
      await updateAndWait(result, "ss-1", 90);
      expect(result.current.assessment.updatedAt).not.toBe(before);
    });

    it("writes to the correct indicator independently", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 30);
      await updateAndWait(result, "ss-2", 25);
      expect(result.current.assessment.indicators["ss-1"]?.value).toBe(30);
      expect(result.current.assessment.indicators["ss-2"]?.value).toBe(25);
    });
  });

  // ── addAuditNote ─────────────────────────────────────────

  describe("addAuditNote", () => {
    it("adds a review note entry for the indicator", async () => {
      const { result } = await mountHook();
      await act(async () => {
        await result.current.addAuditNote("ss-1", "Needs source verification");
      });
      const audit = result.current.assessment.auditLog.find((a) => a.indicatorId === "ss-1");
      expect(audit).toBeDefined();
      expect(audit!.entries[0].action).toBe("review");
      expect(audit!.entries[0].field).toBe("notes");
      expect(audit!.entries[0].newValue).toBe("Needs source verification");
    });

    it("appends to existing audit log for the indicator", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 50);
      await act(async () => {
        await result.current.addAuditNote("ss-1", "Second review");
      });
      const audit = result.current.assessment.auditLog.find((a) => a.indicatorId === "ss-1");
      expect(audit!.entries).toHaveLength(2);
    });
  });

  // ── createYear / deleteYear ──────────────────────────────

  describe("createYear / deleteYear", () => {
    it("creates a new assessment year", async () => {
      const { result } = await mountHook();
      await act(async () => {
        await result.current.createYear(2027);
      });
      expect(result.current.availableYears).toContain(2027);
    });

    it("copies indicators from a source year when copyFrom is specified", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 42);
      await act(async () => {
        await result.current.createYear(2027, 2026);
      });
      // Switch to the new year and verify the copied value
      await act(async () => {
        result.current.setSelectedCity("thimphu");
      });
      // Re-mount with new selectedYear to verify — but we can also check localStorage
      const stored = getLocalStorage();
      expect(stored.thimphu.assessments[2027].indicators["ss-1"]?.value).toBe(42);
    });

    it("creates an empty assessment when no copyFrom is provided", async () => {
      const { result } = await mountHook();
      await act(async () => {
        await result.current.createYear(2027);
      });
      const stored = getLocalStorage();
      expect(stored.thimphu.assessments[2027]).toBeDefined();
      expect(stored.thimphu.assessments[2027].indicators).toEqual({});
    });

    it("deletes a year from state and localStorage", async () => {
      const { result } = await mountHook();
      await act(async () => {
        await result.current.createYear(2027);
      });
      expect(result.current.availableYears).toContain(2027);
      await act(async () => {
        await result.current.deleteYear(2027);
      });
      expect(result.current.availableYears).not.toContain(2027);
      const stored = getLocalStorage();
      expect(stored.thimphu.assessments[2027]).toBeUndefined();
    });
  });

  // ── Scoring through store ────────────────────────────────

  describe("scoring through the store", () => {
    it("getDomainScore returns a value after indicators are updated", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 70);
      await updateAndWait(result, "ss-2", 5);
      const score = result.current.getDomainScore("safety-security");
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("getOverallScore returns aggregated score across domains", async () => {
      const { result } = await mountHook();
      // Fill both domains
      await updateAndWait(result, "ss-1", 70);
      await updateAndWait(result, "ss-2", 5);
      await updateAndWait(result, "h-1", 20);
      const overall = result.current.getOverallScore();
      expect(overall).toBeGreaterThan(0);
      expect(overall).toBeLessThanOrEqual(100);
    });

    it("getScoreForYear retrieves score for a different year", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 50);
      await act(async () => {
        await result.current.createYear(2025, 2026);
      });
      const score2025 = result.current.getScoreForYear(2025);
      const score2026 = result.current.getScoreForYear(2026);
      // Both should be valid since indicators were copied
      expect(score2025).toBeGreaterThan(0);
      expect(score2026).toBeGreaterThan(0);
    });

    it("getDataEntryStats reflects filled vs total correctly", async () => {
      const { result } = await mountHook();
      // 3 indicators total in fixture
      let stats = result.current.getDataEntryStats();
      expect(stats.total).toBe(3);
      expect(stats.filled).toBe(0);
      await updateAndWait(result, "ss-1", 50);
      stats = result.current.getDataEntryStats();
      expect(stats.filled).toBe(1);
    });
  });

  // ── City switching ───────────────────────────────────────

  describe("city switching", () => {
    it("loads separate data per city", async () => {
      const { result } = await mountHook();
      await updateAndWait(result, "ss-1", 99);
      await act(async () => {
        result.current.setSelectedCity("paro");
      });
      // Paro should have independent (empty) assessment
      expect(result.current.assessment.indicators["ss-1"]).toBeUndefined();
      // Switch back to thimphu — data should persist
      await act(async () => {
        result.current.setSelectedCity("thimphu");
      });
      expect(result.current.assessment.indicators["ss-1"]?.value).toBe(99);
    });
  });

  // ── Reload persistence ───────────────────────────────────

  describe("localStorage persistence across reloads", () => {
    it("survives unmount/remount cycle", async () => {
      const { result, unmount } = await mountHook();
      await updateAndWait(result, "ss-1", 72, "field note");
      unmount();
      const reloaded = await mountHook();
      await waitFor(() => {
        expect(reloaded.result.current.assessment.indicators["ss-1"]?.value).toBe(72);
      });
    });

    it("survives unmount/remount with multiple indicators across domains", async () => {
      const { result, unmount } = await mountHook();
      await updateAndWait(result, "ss-1", 65);
      await updateAndWait(result, "h-1", 30);
      unmount();
      const reloaded = await mountHook();
      await waitFor(() => {
        expect(reloaded.result.current.assessment.indicators["ss-1"]?.value).toBe(65);
        expect(reloaded.result.current.assessment.indicators["h-1"]?.value).toBe(30);
      });
    });
  });
});

function getQueue() {
  return JSON.parse(localStorage.getItem("grme-pending-mutations") || "[]");
}

// ── Tests: Online mode (Supabase available) ──────────────────

describe("useGRMEData (online mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseHasConfig = true;
    mockApiFns.loadAssessments = vi.fn().mockResolvedValue({});
    mockApiFns.loadThromdes = vi.fn().mockResolvedValue([]);
    mockApiFns.loadAuditLogsForAssessment = vi.fn().mockResolvedValue({});
    localStorage.clear();
  });

  it("calls saveAssessment and addAuditEntry on update when API is available", async () => {
    const { result } = await mountHook();
    await waitFor(() => {
      expect(result.current.apiAvailable).toBe(true);
    });
    await updateAndWait(result, "ss-1", 80, "Online test");
    expect(mockApiFns.saveAssessment).toHaveBeenCalledWith(
      "thimphu", 2026, "ss-1",
      expect.objectContaining({ value: 80, notes: "Online test" }),
      undefined
    );
    expect(mockApiFns.addAuditEntry).toHaveBeenCalledWith(
      "thimphu", 2026, "ss-1",
      expect.objectContaining({ action: "create" })
    );
  });

  it("calls saveAssessments when creating a year", async () => {
    const { result } = await mountHook();
    await waitFor(() => {
      expect(result.current.apiAvailable).toBe(true);
    });
    await act(async () => {
      await result.current.createYear(2027, 2026);
    });
    expect(mockApiFns.saveAssessments).toHaveBeenCalledWith("thimphu", 2027, {}, undefined);
  });

  it("calls deleteYear when deleting a year", async () => {
    const { result } = await mountHook();
    await waitFor(() => {
      expect(result.current.apiAvailable).toBe(true);
    });
    await act(async () => {
      await result.current.createYear(2027);
    });
    await act(async () => {
      await result.current.deleteYear(2027);
    });
    expect(mockApiFns.deleteYear).toHaveBeenCalledWith("thimphu", 2027, undefined);
  });

  it("drains the offline queue on init when API is available", async () => {
    // Pre-seed the queue with a pending mutation
    localStorage.setItem("grme-pending-mutations", JSON.stringify([
      { type: "saveIndicator", cityId: "thimphu", year: 2026, indicatorId: "ss-1", data: { value: 75, indicatorId: "ss-1", lastUpdated: "", updatedBy: "Tester" } },
    ]));
    const { result } = await mountHook();
    await waitFor(() => {
      expect(result.current.apiAvailable).toBe(true);
    });
    expect(mockApiFns.saveAssessment).toHaveBeenCalledWith(
      "thimphu", 2026, "ss-1",
      expect.objectContaining({ value: 75 }),
      undefined
    );
    // Queue should be empty after drain
    expect(getQueue()).toHaveLength(0);
  });
});

// ── Tests: Offline queue ──────────────────────────────────────

describe("offline mutation queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseHasConfig = false;
    localStorage.clear();
  });

  it("queues saveIndicator when offline", async () => {
    const { result } = await mountHook();
    await updateAndWait(result, "ss-1", 42, "Offline test");
    const queue = getQueue();
    expect(queue.length).toBeGreaterThanOrEqual(1);
    const save = queue.find((m: Record<string, unknown>) => m.type === "saveIndicator");
    expect(save).toBeDefined();
    expect(save.cityId).toBe("thimphu");
    expect(save.indicatorId).toBe("ss-1");
    expect(save.data.value).toBe(42);
  });

  it("queues addAuditEntry when offline", async () => {
    const { result } = await mountHook();
    await updateAndWait(result, "ss-1", 42);
    const queue = getQueue();
    const audit = queue.find((m: Record<string, unknown>) => m.type === "addAuditEntry");
    expect(audit).toBeDefined();
    expect(audit.entry.action).toBe("create");
    expect(audit.entry.newValue).toBe("42");
  });

  it("deduplicates saveIndicator for the same indicator", async () => {
    const { result } = await mountHook();
    await updateAndWait(result, "ss-1", 10);
    await updateAndWait(result, "ss-1", 20);
    await updateAndWait(result, "ss-1", 30);
    const saves = getQueue().filter((m: Record<string, unknown>) => m.type === "saveIndicator");
    expect(saves).toHaveLength(1);
    expect(saves[0].data.value).toBe(30);
  });

  it("queues createYear when offline", async () => {
    const { result } = await mountHook();
    await act(async () => {
      await result.current.createYear(2027);
    });
    const queue = getQueue();
    const create = queue.find((m: Record<string, unknown>) => m.type === "createYear");
    expect(create).toBeDefined();
    expect(create.year).toBe(2027);
  });

  it("queues deleteYear when offline", async () => {
    const { result } = await mountHook();
    await act(async () => {
      await result.current.deleteYear(2026);
    });
    const queue = getQueue();
    const del = queue.find((m: Record<string, unknown>) => m.type === "deleteYear");
    expect(del).toBeDefined();
    expect(del.year).toBe(2026);
  });

  it("does NOT queue mutations when online", async () => {
    supabaseHasConfig = true;
    mockApiFns.loadAssessments = vi.fn().mockResolvedValue({});
    mockApiFns.loadThromdes = vi.fn().mockResolvedValue([]);
    mockApiFns.loadAuditLogsForAssessment = vi.fn().mockResolvedValue({});
    const { result } = await mountHook();
    await waitFor(() => {
      expect(result.current.apiAvailable).toBe(true);
    });
    await updateAndWait(result, "ss-1", 99);
    expect(getQueue()).toHaveLength(0);
  });
});
