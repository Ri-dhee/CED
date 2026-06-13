export type OverlayMode = "auto" | "specific" | "all";

export interface OverlayYearArgs {
  overlayMode: OverlayMode;
  availableYears: number[];
  selectedYear: number;
  selectedOverlayYears: number[];
  previousYear: number | null;
}

export function resolveOverlayYears({
  overlayMode,
  availableYears,
  selectedYear,
  selectedOverlayYears,
  previousYear,
}: OverlayYearArgs): number[] {
  if (overlayMode === "all") {
    return [...availableYears]
      .filter((year) => year !== selectedYear)
      .sort((a, b) => a - b);
  }

  if (overlayMode === "specific") {
    const validYears = selectedOverlayYears
      .filter((year) => availableYears.includes(year) && year !== selectedYear)
      .sort((a, b) => a - b);
    return validYears.length > 0 ? validYears : previousYear ? [previousYear] : [];
  }

  return previousYear ? [previousYear] : [];
}
