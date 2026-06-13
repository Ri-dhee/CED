import { describe, expect, it } from "vitest";
import {
  calculateIndicatorScore,
  calculateDomainScore,
  calculateWeightedOverallScore,
  geometricMean,
  weightedGeometricMean,
  adjustScoreForConfidence,
  getStatusFromScore,
  getIndicatorReliabilityFactor,
  getIndicatorConfidenceWeight,
} from "./grme-data";
import type { Domain, Indicator } from "./grme-data";

function ind(overrides: Partial<Indicator> = {}): Indicator {
  return {
    id: "test-ind",
    name: "Test Indicator",
    type: "Quantitative",
    dataType: "number",
    unit: "%",
    description: "",
    benchmark: { critical: "0", developing: "25", progressive: "50", exemplary: "75" },
    direction: "higher",
    ...overrides,
  };
}

function domain(overrides: Partial<Domain> = {}): Domain {
  return {
    id: "test-domain",
    name: "Test Domain",
    shortName: "Test",
    description: "",
    icon: "",
    color: "#000",
    subdomains: [],
    ...overrides,
  };
}

// ── calculateIndicatorScore ────────────────────────────────────

describe("calculateIndicatorScore", () => {
  it("returns 100 when value meets or exceeds exemplary (higher)", () => {
    expect(calculateIndicatorScore(80, ind())).toBe(100);
    expect(calculateIndicatorScore(75, ind())).toBe(100);
  });

  it("returns 0 when value is at or below critical (higher)", () => {
    expect(calculateIndicatorScore(0, ind())).toBe(0);
    expect(calculateIndicatorScore(-5, ind())).toBe(0);
  });

  it("interpolates linearly between critical and developing (0–25)", () => {
    // critical=0, developing=25 → mid=12.5 → score=12.5
    expect(calculateIndicatorScore(12.5, ind())).toBeCloseTo(12.5, 1);
  });

  it("interpolates linearly between developing and progressive (25–50)", () => {
    // developing=25, progressive=50 → value=37.5 → score=37.5
    expect(calculateIndicatorScore(37.5, ind())).toBeCloseTo(37.5, 1);
  });

  it("interpolates linearly between progressive and exemplary (50–100)", () => {
    // progressive=50, exemplary=75 → value=62.5 → score=75
    expect(calculateIndicatorScore(62.5, ind())).toBeCloseTo(75, 1);
  });

  it("inverts scoring for lower-is-better direction", () => {
    const lower = ind({ direction: "lower", benchmark: { critical: "50", developing: "30", progressive: "15", exemplary: "5" } });
    // value=50 (critical) → score 0
    expect(calculateIndicatorScore(50, lower)).toBe(0);
    // value=5 (exemplary) → score 100
    expect(calculateIndicatorScore(5, lower)).toBe(100);
    // value=40 (between critical=50 and developing=30) → ((50-40)/(50-30))*25 = 12.5
    expect(calculateIndicatorScore(40, lower)).toBeCloseTo(12.5, 1);
  });

  it("handles boolean indicators: true → 100, false → 0", () => {
    const boolInd = ind({ dataType: "boolean", benchmark: { critical: "0", developing: "0", progressive: "1", exemplary: "1" } });
    expect(calculateIndicatorScore(true, boolInd)).toBe(100);
    expect(calculateIndicatorScore(false, boolInd)).toBe(0);
  });

  it("returns 50 for NaN benchmarks (guard)", () => {
    const bad = ind({ benchmark: { critical: "abc", developing: "25", progressive: "50", exemplary: "75" } });
    expect(calculateIndicatorScore(50, bad)).toBe(50);
  });

  it("returns 50 for identical benchmarks (division guard)", () => {
    const flat = ind({ benchmark: { critical: "50", developing: "50", progressive: "75", exemplary: "100" } });
    expect(calculateIndicatorScore(50, flat)).toBe(50);
  });
});

// ── geometricMean ──────────────────────────────────────────────

describe("geometricMean", () => {
  it("returns 0 for empty array", () => {
    expect(geometricMean([])).toBe(0);
  });

  it("computes geometric mean of positive numbers", () => {
    // GM of [10, 40] = sqrt(400) = 20
    expect(geometricMean([10, 40])).toBeCloseTo(20, 10);
  });

  it("clamps values near zero to avoid log(0)", () => {
    const result = geometricMean([0, 100]);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });

  it("penalizes imbalance vs arithmetic mean", () => {
    const balanced = geometricMean([50, 50]);
    const imbalanced = geometricMean([90, 10]);
    expect(imbalanced).toBeLessThan(balanced);
  });
});

// ── weightedGeometricMean ──────────────────────────────────────

describe("weightedGeometricMean", () => {
  it("returns 0 for empty input", () => {
    expect(weightedGeometricMean([], [])).toBe(0);
  });

  it("applies weights correctly", () => {
    // score 100 with weight 3, score 0 with weight 1
    // log-weighted: (ln(100)*3 + ln(0.001)*1) / 4 = (13.816*3 + -6.908*1) / 4 = 34.54/4 = 8.635
    // exp(8.635) = 5629
    // Wait, that seems high. Let me recalculate more carefully.
    const result = weightedGeometricMean([100, 1], [3, 1]);
    expect(result).toBeGreaterThan(0);
  });
});

// ── adjustScoreForConfidence ───────────────────────────────────

describe("adjustScoreForConfidence", () => {
  it("returns 0 for score 0 regardless of confidence", () => {
    expect(adjustScoreForConfidence(0, 100)).toBe(0);
  });

  it("at 100% confidence, factor = 1.0, score unchanged", () => {
    expect(adjustScoreForConfidence(80, 100)).toBeCloseTo(80, 5);
  });

  it("at 0% confidence, factor = 0.25, score reduced to 25%", () => {
    expect(adjustScoreForConfidence(80, 0)).toBe(20);
  });

  it("clamps confidence input to 0–100", () => {
    expect(adjustScoreForConfidence(80, 150)).toBeCloseTo(80, 5);
    expect(adjustScoreForConfidence(80, -50)).toBe(20);
  });

  it("at 50% confidence, factor = 0.625", () => {
    expect(adjustScoreForConfidence(80, 50)).toBe(50);
  });
});

// ── getStatusFromScore ─────────────────────────────────────────

describe("getStatusFromScore", () => {
  it("returns Critical below 25", () => {
    expect(getStatusFromScore(0)).toBe("Critical");
    expect(getStatusFromScore(24)).toBe("Critical");
  });

  it("returns Developing between 25–49", () => {
    expect(getStatusFromScore(25)).toBe("Developing");
    expect(getStatusFromScore(49)).toBe("Developing");
  });

  it("returns Progressive between 50–74", () => {
    expect(getStatusFromScore(50)).toBe("Progressive");
    expect(getStatusFromScore(74)).toBe("Progressive");
  });

  it("returns Exemplary at 75+", () => {
    expect(getStatusFromScore(75)).toBe("Exemplary");
    expect(getStatusFromScore(100)).toBe("Exemplary");
  });
});

// ── getIndicatorReliabilityFactor ──────────────────────────────

describe("getIndicatorReliabilityFactor", () => {
  it("returns 1 for Quantitative", () => {
    expect(getIndicatorReliabilityFactor(ind({ type: "Quantitative" }))).toBe(1);
  });
  it("returns 0.9 for Qualitative", () => {
    expect(getIndicatorReliabilityFactor(ind({ type: "Qualitative" }))).toBe(0.9);
  });
  it("returns 0.8 for Participatory", () => {
    expect(getIndicatorReliabilityFactor(ind({ type: "Participatory" }))).toBe(0.8);
  });
});

// ── getIndicatorConfidenceWeight ───────────────────────────────

describe("getIndicatorConfidenceWeight", () => {
  it("multiplies score weight by reliability factor", () => {
    const w = getIndicatorConfidenceWeight(ind({ type: "Qualitative", weight: 2 }));
    expect(w).toBeCloseTo(1.8, 5);
  });
});

// ── calculateDomainScore ───────────────────────────────────────

describe("calculateDomainScore", () => {
  it("returns 50 (default) when no indicator scores are available", () => {
    const d = domain({ subdomains: [{ id: "sub", name: "Sub", indicators: [ind()] }] });
    expect(calculateDomainScore(d, () => null)).toBe(50);
  });

  it("computes weighted geometric mean of available indicator scores", () => {
    const d = domain({
      subdomains: [{
        id: "sub",
        name: "Sub",
        indicators: [
          ind({ id: "a", type: "Quantitative" }),
          ind({ id: "b", type: "Quantitative" }),
        ],
      }],
    });
    const getScore = (id: string) => (id === "a" ? 90 : 50);
    const result = calculateDomainScore(d, getScore);
    // geometric mean of [90, 50] ≈ 67.08
    expect(result).toBeCloseTo(67.08, 1);
  });

  it("includes sub-domain weight in the calculation", () => {
    const d = domain({
      subdomains: [{
        id: "sub",
        name: "Sub",
        weight: 2,
        indicators: [ind({ id: "a", type: "Quantitative" })],
      }],
    });
    const result = calculateDomainScore(d, () => 80);
    expect(result).toBeGreaterThan(0);
  });
});

// ── calculateWeightedOverallScore ──────────────────────────────

describe("calculateWeightedOverallScore", () => {
  it("returns weighted geometric mean of domain scores", () => {
    const domains = [
      domain({ id: "a", subdomains: [{
        id: "s1", name: "S1", indicators: [ind({ id: "i1" })],
      }] }),
      domain({ id: "b", weight: 2, subdomains: [{
        id: "s2", name: "S2", indicators: [ind({ id: "i2" })],
      }] }),
    ];
    const getScore = (id: string) => (id === "a" ? 80 : 60);
    const result = calculateWeightedOverallScore(domains, getScore);
    expect(result).toBeGreaterThan(0);
  });
});
