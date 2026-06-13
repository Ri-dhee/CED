import { describe, expect, it } from "vitest";
import { resolveOverlayYears } from "./grme-overlays";

describe("resolveOverlayYears", () => {
  it("uses the prior year in auto mode", () => {
    expect(
      resolveOverlayYears({
        overlayMode: "auto",
        availableYears: [2024, 2025, 2026],
        selectedYear: 2026,
        selectedOverlayYears: [],
        previousYear: 2025,
      })
    ).toEqual([2025]);
  });

  it("filters the current year and sorts specific selections", () => {
    expect(
      resolveOverlayYears({
        overlayMode: "specific",
        availableYears: [2024, 2025, 2026],
        selectedYear: 2026,
        selectedOverlayYears: [2026, 2024, 2025],
        previousYear: 2025,
      })
    ).toEqual([2024, 2025]);
  });

  it("falls back to the previous year when no specific selection is valid", () => {
    expect(
      resolveOverlayYears({
        overlayMode: "specific",
        availableYears: [2024, 2025, 2026],
        selectedYear: 2026,
        selectedOverlayYears: [2026],
        previousYear: 2025,
      })
    ).toEqual([2025]);
  });
});
