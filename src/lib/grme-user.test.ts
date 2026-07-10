import { describe, expect, it } from "vitest";
import { canAccessIndicator, canAccessDzongkhag, canAccessThromde } from "./grme-user";
import type { GrmeUser } from "./grme-user";
import type { Domain, Indicator } from "./grme-data";

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

function domains(): Domain[] {
  return [
    {
      id: "mobility-access",
      name: "Mobility",
      shortName: "Mobility",
      description: "Test domain",
      icon: "",
      color: "",
      subdomains: [
        {
          id: "access",
          name: "Access",
          indicators: [indicator({ id: "ind-1" }), indicator({ id: "ind-2" })],
        },
      ],
    },
  ];
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

  it("allows domain-scoped users when the indicator belongs to that domain", () => {
    expect(canAccessIndicator(user({ allowedDomainIds: ["mobility-access"] }), indicator(), domains())).toBe(true);
  });
});

describe("canAccessDzongkhag", () => {
  it("allows dzongkhag-scoped permissions", () => {
    expect(canAccessDzongkhag(user({ allowedDzongkhagIds: ["punakha"] }), "punakha")).toBe(true);
  });

  it("allows thromde-scoped permissions for the parent dzongkhag", () => {
    expect(canAccessThromde(user({ allowedThromdeIds: ["thimphu-city"] }), "thimphu-city")).toBe(true);
    expect(canAccessDzongkhag(user({ allowedThromdeIds: ["thimphu-city"] }), "thimphu")).toBe(true);
  });
});
