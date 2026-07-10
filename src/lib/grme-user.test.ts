import { describe, expect, it } from "vitest";
import { canAccessIndicator } from "./grme-user";
import type { GrmeUser } from "./grme-user";
import type { Indicator } from "./grme-data";

function user(overrides: Partial<GrmeUser> = {}): GrmeUser {
  return {
    name: "Test",
    role: "editor",
    loginAt: new Date().toISOString(),
    scope: { dzongkhagId: "thimphu", thromdeId: null, stakeholderId: "planning" },
    ...overrides,
  };
}

function indicator(overrides: Partial<Indicator> = {}): Indicator {
  return {
    id: "ind-1",
    name: "Test",
    type: "Quantitative",
    dataType: "number",
    unit: "%",
    description: "",
    benchmark: { critical: "0", developing: "25", progressive: "50", exemplary: "75" },
    direction: "higher",
    ...overrides,
  };
}

describe("canAccessIndicator", () => {
  it("allows matching stakeholders", () => {
    expect(canAccessIndicator(user(), indicator({ stakeholderAccess: ["planning"] }))).toBe(true);
  });

  it("blocks non-matching stakeholders when access is set", () => {
    expect(canAccessIndicator(user(), indicator({ stakeholderAccess: ["governance"] }))).toBe(false);
  });

  it("blocks empty stakeholder access for non-admin users", () => {
    expect(canAccessIndicator(user(), indicator())).toBe(false);
  });

  it("always allows admins", () => {
    expect(canAccessIndicator(user({ role: "admin" }), indicator())).toBe(true);
  });
});
