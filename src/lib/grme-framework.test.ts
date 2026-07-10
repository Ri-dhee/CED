import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_STAKEHOLDER_ACCESS_BY_DOMAIN } from "./grme-framework-defaults";
import { getDefaultFramework, loadFramework } from "./grme-framework";

describe("loadFramework", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates missing stakeholder access on legacy stored data", () => {
    const domains = getDefaultFramework();
    const firstDomain = domains[0];
    const firstIndicator = firstDomain.subdomains[0].indicators[0];
    delete firstIndicator.stakeholderAccess;

    localStorage.setItem(
      "grme-framework",
      JSON.stringify({ domains, proposals: [], lastUpdated: "2026-01-01T00:00:00.000Z" })
    );

    const loaded = loadFramework();
    expect(loaded.domains[0].subdomains[0].indicators[0].stakeholderAccess).toEqual(
      DEFAULT_STAKEHOLDER_ACCESS_BY_DOMAIN[firstDomain.id]
    );
  });

  it("preserves already-hydrated stakeholder access lists", () => {
    const domains = getDefaultFramework();
    domains[0].subdomains[0].indicators[0].stakeholderAccess = ["planning"];

    localStorage.setItem(
      "grme-framework",
      JSON.stringify({ domains, proposals: [], lastUpdated: "2026-01-01T00:00:00.000Z" })
    );

    const loaded = loadFramework();
    expect(loaded.domains[0].subdomains[0].indicators[0].stakeholderAccess).toEqual(["planning"]);
  });
});
