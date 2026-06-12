import { Domain, CityData, AssessmentYear, calculateIndicatorScore } from "./grme-data";

// ── CSV Helpers ─────────────────────────────────────────────────

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(filename: string, csv: string) {
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function findIndicator(domains: Domain[], indicatorId: string) {
  for (const domain of domains) {
    for (const sub of domain.subdomains) {
      const ind = sub.indicators.find((i) => i.id === indicatorId);
      if (ind) return { domain, subdomain: sub, indicator: ind };
    }
  }
  return null;
}

// ── Single Year Export ──────────────────────────────────────────

export function exportYearCsv(
  domains: Domain[],
  city: CityData,
  year: number
) {
  const assessment = city.assessments[year];
  const headers = [
    "Domain",
    "Sub-Domain",
    "Indicator",
    "Type",
    "Data Type",
    "Direction",
    "Unit",
    "Benchmark (Critical)",
    "Benchmark (Developing)",
    "Benchmark (Progressive)",
    "Benchmark (Exemplary)",
    "Value",
    "Score",
    "Status",
    "Notes",
    "Updated By",
    "Last Updated",
  ];

  const rows: string[][] = [];

  for (const domain of domains) {
    for (const sub of domain.subdomains) {
      for (const indicator of sub.indicators) {
        const data = assessment?.indicators[indicator.id];
        const score =
          data?.value !== undefined && data?.value !== null && typeof data?.value === "number"
            ? calculateIndicatorScore(data.value, indicator)
            : null;

        rows.push([
          escapeCsv(domain.name),
          escapeCsv(sub.name),
          escapeCsv(indicator.name),
          escapeCsv(indicator.type),
          escapeCsv(indicator.dataType),
          escapeCsv(indicator.direction),
          escapeCsv(indicator.unit),
          escapeCsv(indicator.benchmark.critical),
          escapeCsv(indicator.benchmark.developing),
          escapeCsv(indicator.benchmark.progressive),
          escapeCsv(indicator.benchmark.exemplary),
          escapeCsv(data?.value ?? ""),
          score !== null ? escapeCsv(Math.round(score)) : "",
          score !== null ? escapeCsv(getStatus(score)) : "",
          escapeCsv(data?.notes ?? ""),
          escapeCsv(data?.updatedBy ?? ""),
          escapeCsv(data?.lastUpdated ?? ""),
        ]);
      }
    }
  }

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const filename = `grme-${city.cityName}-${year}.csv`;
  downloadCsv(filename, csv);
}

// ── Multi-Year Export ───────────────────────────────────────────

export function exportAllYearsCsv(
  domains: Domain[],
  city: CityData,
  years: number[]
) {
  const sorted = [...years].sort((a, b) => a - b);
  const headers = [
    "Year",
    "Domain",
    "Sub-Domain",
    "Indicator",
    "Type",
    "Value",
    "Score",
    "Status",
    "Notes",
    "Updated By",
    "Last Updated",
  ];

  const rows: string[][] = [];

  for (const year of sorted) {
    const assessment = city.assessments[year];
    for (const domain of domains) {
      for (const sub of domain.subdomains) {
        for (const indicator of sub.indicators) {
          const data = assessment?.indicators[indicator.id];
          const score =
            data?.value !== undefined && data?.value !== null && typeof data?.value === "number"
              ? calculateIndicatorScore(data.value, indicator)
              : null;

          rows.push([
            escapeCsv(year),
            escapeCsv(domain.name),
            escapeCsv(sub.name),
            escapeCsv(indicator.name),
            escapeCsv(indicator.type),
            escapeCsv(data?.value ?? ""),
            score !== null ? escapeCsv(Math.round(score)) : "",
            score !== null ? escapeCsv(getStatus(score)) : "",
            escapeCsv(data?.notes ?? ""),
            escapeCsv(data?.updatedBy ?? ""),
            escapeCsv(data?.lastUpdated ?? ""),
          ]);
        }
      }
    }
  }

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const filename = `grme-${city.cityName}-all-years.csv`;
  downloadCsv(filename, csv);
}

// ── Summary Export (Domain Scores) ──────────────────────────────

export function exportSummaryCsv(
  domains: Domain[],
  city: CityData,
  years: number[]
) {
  const sorted = [...years].sort((a, b) => a - b);
  const headers = ["Year", ...domains.map((d) => d.name), "Overall"];

  const rows: string[][] = [];

  for (const year of sorted) {
    const assessment = city.assessments[year];
    const getScore = (indicatorId: string): number | null => {
      const data = assessment?.indicators[indicatorId];
      if (data === undefined || data.value === null || data.value === undefined) return null;
      const found = findIndicator(domains, indicatorId);
      if (!found) return null;
      if (typeof data.value === "string") return null;
      return calculateIndicatorScore(data.value as number | boolean, found.indicator);
    };

    const domainScores = domains.map((domain) => {
      const scores: number[] = [];
      for (const sub of domain.subdomains) {
        for (const ind of sub.indicators) {
          const s = getScore(ind.id);
          if (s !== null) scores.push(s);
        }
      }
      return scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 50;
    });

    const overall = Math.round(
      domainScores.reduce((a, b) => a + b, 0) / domainScores.length
    );

    rows.push([
      escapeCsv(year),
      ...domainScores.map(escapeCsv),
      escapeCsv(overall),
    ]);
  }

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const filename = `grme-${city.cityName}-summary.csv`;
  downloadCsv(filename, csv);
}

// ── Status Helper ───────────────────────────────────────────────

function getStatus(score: number): string {
  if (score >= 75) return "Exemplary";
  if (score >= 50) return "Progressive";
  if (score >= 25) return "Developing";
  return "Critical";
}
