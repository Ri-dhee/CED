export type IndicatorType = "Quantitative" | "Qualitative" | "Participatory";
export type DataType = "percentage" | "number" | "ratio" | "index" | "text" | "boolean";
export type ScoreStatus = "Critical" | "Developing" | "Progressive" | "Exemplary";
export type Direction = "higher" | "lower"; // higher = better, lower = better

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: "create" | "update" | "review";
  field: string;
  oldValue?: string;
  newValue: string;
  notes?: string;
}

export interface Benchmark {
  critical: string;
  developing: string;
  progressive: string;
  exemplary: string;
}

export interface Indicator {
  id: string;
  name: string;
  type: IndicatorType;
  dataType: DataType;
  unit: string;
  description: string;
  benchmark: Benchmark;
  direction: Direction;
  source?: string;
  weight?: number;
}

export interface SubDomain {
  id: string;
  name: string;
  description?: string;
  indicators: Indicator[];
  weight?: number;
}

export interface Domain {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  subdomains: SubDomain[];
  weight?: number;
}

export interface IndicatorData {
  indicatorId: string;
  value: number | string | null;
  evidence?: string;
  notes?: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface AuditLog {
  indicatorId: string;
  entries: AuditEntry[];
}

export interface CityData {
  cityId: string;
  cityName: string;
  assessments: Record<number, AssessmentYear>;
}

export interface AssessmentYear {
  year: number;
  indicators: Record<string, IndicatorData>;
  auditLog: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Calculate indicator score using linear interpolation between benchmark thresholds.
 *
 * For "higher is better" indicators:
 *   - value <= critical → score 0
 *   - value >= exemplary → score 100
 *   - Linear interpolation between thresholds
 *
 * For "lower is better" indicators (inverted):
 *   - value >= critical → score 0
 *   - value <= exemplary → score 100
 *   - Linear interpolation between thresholds (inverted)
 */
export function calculateIndicatorScore(value: number, indicator: Indicator): number {
  const b = indicator.benchmark;
  const critical = parseFloat(b.critical);
  const developing = parseFloat(b.developing);
  const progressive = parseFloat(b.progressive);
  const exemplary = parseFloat(b.exemplary);

  // Guard against NaN from bad benchmark data
  if (isNaN(critical) || isNaN(developing) || isNaN(progressive) || isNaN(exemplary)) {
    return 50;
  }

  // Guard against division by zero (identical benchmarks)
  if (critical === developing || developing === progressive || progressive === exemplary) {
    return 50;
  }

  if (indicator.direction === "higher") {
    // Higher value = better score
    if (value <= critical) return 0;
    if (value >= exemplary) return 100;
    if (value < developing) {
      // Interpolate between 0-25
      return ((value - critical) / (developing - critical)) * 25;
    }
    if (value < progressive) {
      // Interpolate between 25-50
      return 25 + ((value - developing) / (progressive - developing)) * 25;
    }
    // Interpolate between 50-75-100
    return 50 + ((value - progressive) / (exemplary - progressive)) * 50;
  } else {
    // Lower value = better score (inverted scale)
    if (value >= critical) return 0;
    if (value <= exemplary) return 100;
    if (value > developing) {
      // Interpolate between 0-25 (value going down = score going up)
      return ((critical - value) / (critical - developing)) * 25;
    }
    if (value > progressive) {
      // Interpolate between 25-50
      return 25 + ((developing - value) / (developing - progressive)) * 25;
    }
    // Interpolate between 50-100
    return 50 + ((progressive - value) / (progressive - exemplary)) * 50;
  }
}

/**
 * Get status label from score (0-100)
 */
export function getStatusFromScore(score: number): ScoreStatus {
  if (score >= 75) return "Exemplary";
  if (score >= 50) return "Progressive";
  if (score >= 25) return "Developing";
  return "Critical";
}

/**
 * Get status for an indicator value
 */
export function getStatus(value: number, indicator: Indicator): ScoreStatus {
  const score = calculateIndicatorScore(value, indicator);
  return getStatusFromScore(score);
}

export function getStatusColor(status: ScoreStatus): string {
  switch (status) {
    case "Critical": return "#ef4444";
    case "Developing": return "#f59e0b";
    case "Progressive": return "#3b82f6";
    case "Exemplary": return "#10b981";
  }
}

export function getStatusBg(status: ScoreStatus): string {
  switch (status) {
    case "Critical": return "#fef2f2";
    case "Developing": return "#fffbeb";
    case "Progressive": return "#eff6ff";
    case "Exemplary": return "#ecfdf5";
  }
}

/**
 * Geometric mean of an array of positive numbers.
 * Clamps each value to a minimum of 0.001 to avoid zero collapse.
 * Used instead of arithmetic mean to penalize domain imbalance —
 * a city with (90, 10) scores lower than one with (50, 50).
 */
export function geometricMean(values: number[]): number {
  if (values.length === 0) return 0;
  const logSum = values.reduce((sum, v) => sum + Math.log(Math.max(v, 0.001)), 0);
  return Math.exp(logSum / values.length);
}

/**
 * Calculate domain score using geometric mean of indicator scores.
 * This penalizes imbalance more than arithmetic averaging.
 */
export function calculateDomainScore(
  domain: Domain,
  getIndicatorScore: (id: string) => number | null
): number {
  const allIndicators = domain.subdomains.flatMap((s) => s.indicators);
  const scores = allIndicators
    .map((ind) => getIndicatorScore(ind.id))
    .filter((s): s is number => s !== null);

  if (scores.length === 0) return 50; // Default when no data entered
  return geometricMean(scores);
}

/**
 * Calculate overall score using geometric mean of domain scores.
 */
export function calculateOverallScore(
  getDomainScore: (id: string) => number
): number {
  const scores = DEFAULT_DOMAINS.map((d) => getDomainScore(d.id));
  return geometricMean(scores);
}

/**
 * Get benchmark thresholds as numeric values
 */
export function getBenchmarkValues(indicator: Indicator) {
  return {
    critical: parseFloat(indicator.benchmark.critical),
    developing: parseFloat(indicator.benchmark.developing),
    progressive: parseFloat(indicator.benchmark.progressive),
    exemplary: parseFloat(indicator.benchmark.exemplary),
  };
}

/**
 * Check if an indicator is "lower is better"
 */
export function isLowerBetter(indicator: Indicator): boolean {
  return indicator.direction === "lower";
}

export const DEFAULT_DOMAINS: Domain[] = [
  {
    id: "safety-security",
    name: "Safety and Security",
    shortName: "Safety",
    description: "Women's physical safety, freedom from violence, and sense of security in public and private spaces across diverse altitudes and terrains.",
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
            description: "Measures perceived safety in public spaces after dark",
            benchmark: { critical: "0", developing: "30", progressive: "50", exemplary: "70" },
            direction: "higher",
            source: "UN Women SDG 11 Gender Snapshot",
          },
          {
            id: "ss-2",
            name: "Rate of GBV incidents per 10,000 women",
            type: "Quantitative",
            dataType: "number",
            unit: "per 10k",
            description: "Reported GBV cases (lower is better)",
            benchmark: { critical: "50", developing: "30", progressive: "15", exemplary: "5" },
            direction: "lower",
            source: "Bhutan National Strategy on GBV 2024-2028",
          },
          {
            id: "ss-3",
            name: "% of streets with adequate lighting",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Infrastructure safety measure",
            benchmark: { critical: "0", developing: "20", progressive: "40", exemplary: "70" },
            direction: "higher",
            source: "World Bank Handbook for Gender-Inclusive Urban Planning",
          },
          {
            id: "ss-4",
            name: "Women's perception of safety at transport nodes",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Survey-based perception score",
            benchmark: { critical: "0", developing: "4", progressive: "6", exemplary: "8" },
            direction: "higher",
            source: "UN Women Towards a Gender-Inclusive Urban Future",
          },
          {
            id: "ss-5",
            name: "Emergency call points per 10km of urban roads",
            type: "Quantitative",
            dataType: "number",
            unit: "per 10km",
            description: "Emergency response infrastructure density",
            benchmark: { critical: "0", developing: "2", progressive: "5", exemplary: "10" },
            direction: "higher",
          },
        ],
      },
      {
        id: "gbv-response",
        name: "Institutional Response to GBV",
        indicators: [
          {
            id: "ss-6",
            name: "GBV response centres per 10,000 women",
            type: "Quantitative",
            dataType: "number",
            unit: "per 10k",
            description: "Access to GBV support services",
            benchmark: { critical: "0", developing: "0.5", progressive: "1", exemplary: "2" },
            direction: "higher",
            source: "Bhutan National Strategy on GBV 2024-2028",
          },
          {
            id: "ss-7",
            name: "Average response time to GBV complaints (minutes)",
            type: "Quantitative",
            dataType: "number",
            unit: "minutes",
            description: "Institutional responsiveness (lower is better)",
            benchmark: { critical: "120", developing: "60", progressive: "30", exemplary: "15" },
            direction: "lower",
          },
          {
            id: "ss-8",
            name: "% of GBV cases reaching resolution",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Justice system effectiveness",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "75" },
            direction: "higher",
          },
          {
            id: "ss-9",
            name: "% of women aware of GBV complaint mechanisms",
            type: "Participatory",
            dataType: "percentage",
            unit: "%",
            description: "Knowledge of available support",
            benchmark: { critical: "0", developing: "25", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
        ],
      },
      {
        id: "digital-safety",
        name: "Digital Safety",
        indicators: [
          {
            id: "ss-10",
            name: "% of women experiencing online harassment",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Digital violence prevalence (lower is better)",
            benchmark: { critical: "50", developing: "30", progressive: "15", exemplary: "5" },
            direction: "lower",
          },
          {
            id: "ss-11",
            name: "Digital safety policy implementation score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "0=Non-existent, 10=Fully enforced",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
          {
            id: "ss-12",
            name: "% of women aware of cyber-crime reporting",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Awareness of digital safety resources",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
        ],
      },
    ],
  },
  {
    id: "mobility-access",
    name: "Mobility and Access",
    shortName: "Mobility",
    description: "Equitable, affordable, and terrain-adapted transport and mobility for women across Bhutan's steep, high-altitude urban settings.",
    icon: "map",
    color: "#3b82f6",
    subdomains: [
      {
        id: "public-transport",
        name: "Public Transport Equity",
        indicators: [
          {
            id: "ma-1",
            name: "% of women-headed households within 400m of transit",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Transit accessibility",
            benchmark: { critical: "0", developing: "20", progressive: "40", exemplary: "70" },
            direction: "higher",
            source: "World Bank Handbook for Gender-Inclusive Urban Planning",
          },
          {
            id: "ma-2",
            name: "Transport satisfaction score (women)",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "User satisfaction metric",
            benchmark: { critical: "0", developing: "4", progressive: "6", exemplary: "8" },
            direction: "higher",
          },
          {
            id: "ma-3",
            name: "% of income spent on transport (women)",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Transport cost burden (lower is better)",
            benchmark: { critical: "25", developing: "15", progressive: "10", exemplary: "5" },
            direction: "lower",
          },
          {
            id: "ma-4",
            name: "Women-only seating availability score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Gender-responsive transport features",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "terrain-infrastructure",
        name: "Terrain-responsive Infrastructure",
        indicators: [
          {
            id: "ma-5",
            name: "% of paths with handrails and non-slip surfaces",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Mountain-adapted pedestrian infrastructure",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "ma-6",
            name: "% of transit nodes with elevators/escalators",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Accessibility infrastructure",
            benchmark: { critical: "0", developing: "10", progressive: "30", exemplary: "60" },
            direction: "higher",
          },
          {
            id: "ma-7",
            name: "% of facilities reachable without vehicle",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Walkability metric",
            benchmark: { critical: "0", developing: "30", progressive: "60", exemplary: "85" },
            direction: "higher",
          },
        ],
      },
      {
        id: "care-mobility",
        name: "Care Economy Mobility",
        indicators: [
          {
            id: "ma-8",
            name: "Avg travel time to childcare/health (minutes)",
            type: "Quantitative",
            dataType: "number",
            unit: "min",
            description: "Care trip efficiency (lower is better)",
            benchmark: { critical: "60", developing: "40", progressive: "25", exemplary: "15" },
            direction: "lower",
          },
          {
            id: "ma-9",
            name: "% of plans incorporating care trip chains",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Planning integration of care needs",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "ma-10",
            name: "Women's mobility difficulty score",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Lived experience (lower is better)",
            benchmark: { critical: "8", developing: "6", progressive: "4", exemplary: "2" },
            direction: "lower",
          },
        ],
      },
    ],
  },
  {
    id: "housing-land",
    name: "Housing and Land",
    shortName: "Housing",
    description: "Secure tenure, affordable and climate-adapted housing, and women's legal access to land in Bhutan's urban growth areas.",
    icon: "home",
    color: "#8b5cf6",
    subdomains: [
      {
        id: "tenure-ownership",
        name: "Tenure and Ownership",
        indicators: [
          {
            id: "hl-1",
            name: "% of women with land/housing title",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Land ownership security",
            benchmark: { critical: "0", developing: "10", progressive: "25", exemplary: "50" },
            direction: "higher",
            source: "World Bank Bhutan Gender Policy Note",
          },
          {
            id: "hl-2",
            name: "% of plots with women as co-owners",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Property registration metrics",
            benchmark: { critical: "0", developing: "15", progressive: "30", exemplary: "50" },
            direction: "higher",
          },
          {
            id: "hl-3",
            name: "Legal barriers score for divorced/widowed women",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "0=Major barriers, 10=No barriers",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
          {
            id: "hl-4",
            name: "% of housing schemes with gender criteria",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Policy inclusiveness",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
        ],
      },
      {
        id: "affordability",
        name: "Affordability and Habitability",
        indicators: [
          {
            id: "hl-5",
            name: "% of women-headed households >30% income on rent",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Housing cost burden (lower is better)",
            benchmark: { critical: "60", developing: "40", progressive: "25", exemplary: "10" },
            direction: "lower",
          },
          {
            id: "hl-6",
            name: "Overcrowding index (women-headed households)",
            type: "Quantitative",
            dataType: "index",
            unit: "ratio",
            description: "Persons per room (lower is better)",
            benchmark: { critical: "3", developing: "2", progressive: "1.5", exemplary: "1" },
            direction: "lower",
          },
          {
            id: "hl-7",
            name: "% with access to functional sanitation",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Basic services access",
            benchmark: { critical: "0", developing: "40", progressive: "70", exemplary: "95" },
            direction: "higher",
          },
          {
            id: "hl-8",
            name: "Affordable rental housing availability score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Housing availability for migrant women",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "climate-housing",
        name: "Climate and Disaster Resilience",
        indicators: [
          {
            id: "hl-9",
            name: "% of housing retrofitted in high-risk zones",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Climate-resilient housing",
            benchmark: { critical: "0", developing: "15", progressive: "40", exemplary: "70" },
            direction: "higher",
          },
          {
            id: "hl-10",
            name: "% of women included in disaster risk mapping",
            type: "Participatory",
            dataType: "percentage",
            unit: "%",
            description: "Participation in resilience planning",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "hl-11",
            name: "% aware of housing insurance/relief schemes",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Awareness of protection mechanisms",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
        ],
      },
    ],
  },
  {
    id: "economic-inclusion",
    name: "Economic Inclusion",
    shortName: "Economy",
    description: "Access to livelihoods, financial services, and economic agency in Bhutan's emerging urban economy.",
    icon: "chart",
    color: "#f59e0b",
    subdomains: [
      {
        id: "labor-market",
        name: "Labor Market Participation",
        indicators: [
          {
            id: "ei-1",
            name: "Gender wage gap (%)",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Pay equity (lower is better)",
            benchmark: { critical: "40", developing: "25", progressive: "15", exemplary: "5" },
            direction: "lower",
          },
          {
            id: "ei-2",
            name: "% of women in managerial roles",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Leadership representation",
            benchmark: { critical: "0", developing: "10", progressive: "20", exemplary: "35" },
            direction: "higher",
          },
          {
            id: "ei-3",
            name: "% of informal workers with social protection",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Social safety net coverage",
            benchmark: { critical: "0", developing: "15", progressive: "35", exemplary: "60" },
            direction: "higher",
          },
          {
            id: "ei-4",
            name: "Unpaid care work gap (women vs men hrs/day)",
            type: "Quantitative",
            dataType: "number",
            unit: "hrs",
            description: "Care work burden gap (lower is better)",
            benchmark: { critical: "6", developing: "4", progressive: "2", exemplary: "1" },
            direction: "lower",
          },
        ],
      },
      {
        id: "entrepreneurship",
        name: "Entrepreneurship and Financial Access",
        indicators: [
          {
            id: "ei-5",
            name: "% of women-owned businesses with formal credit",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Financial inclusion",
            benchmark: { critical: "0", developing: "10", progressive: "25", exemplary: "50" },
            direction: "higher",
          },
          {
            id: "ei-6",
            name: "% uptake of enterprise support by women",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Government support accessibility",
            benchmark: { critical: "0", developing: "15", progressive: "35", exemplary: "55" },
            direction: "higher",
          },
          {
            id: "ei-7",
            name: "Women-led cooperatives per 10,000 women",
            type: "Quantitative",
            dataType: "number",
            unit: "per 10k",
            description: "Collective economic empowerment",
            benchmark: { critical: "0", developing: "1", progressive: "3", exemplary: "6" },
            direction: "higher",
          },
          {
            id: "ei-8",
            name: "Digital financial literacy rate (women)",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Digital financial inclusion",
            benchmark: { critical: "0", developing: "20", progressive: "45", exemplary: "70" },
            direction: "higher",
          },
        ],
      },
      {
        id: "care-infrastructure",
        name: "Childcare and Care Infrastructure",
        indicators: [
          {
            id: "ei-9",
            name: "Childcare centres per 1,000 working-age women",
            type: "Quantitative",
            dataType: "number",
            unit: "per 1k",
            description: "Childcare accessibility",
            benchmark: { critical: "0", developing: "0.5", progressive: "1", exemplary: "2" },
            direction: "higher",
          },
          {
            id: "ei-10",
            name: "% of workplaces with lactation/flexible policies",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Workplace support infrastructure",
            benchmark: { critical: "0", developing: "15", progressive: "40", exemplary: "70" },
            direction: "higher",
          },
          {
            id: "ei-11",
            name: "Care barriers to employment score",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "0=No barriers, 10=Major barriers",
            benchmark: { critical: "8", developing: "6", progressive: "4", exemplary: "2" },
            direction: "lower",
          },
        ],
      },
    ],
  },
  {
    id: "health-services",
    name: "Health and Services",
    shortName: "Health",
    description: "Equitable access to gender-responsive health, WASH, and social services in Bhutan's mountain urban centres.",
    icon: "heart",
    color: "#ec4899",
    subdomains: [
      {
        id: "srh",
        name: "Sexual and Reproductive Health",
        indicators: [
          {
            id: "hs-1",
            name: "% within 30min of primary health centre",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Healthcare accessibility",
            benchmark: { critical: "0", developing: "30", progressive: "50", exemplary: "75" },
            direction: "higher",
          },
          {
            id: "hs-2",
            name: "Maternal mortality ratio (per 100k)",
            type: "Quantitative",
            dataType: "number",
            unit: "per 100k",
            description: "Maternal health outcome (lower is better)",
            benchmark: { critical: "300", developing: "150", progressive: "70", exemplary: "30" },
            direction: "lower",
            source: "WHO Global Maternal Health Standards",
          },
          {
            id: "hs-3",
            name: "Contraceptive prevalence rate (%)",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Reproductive health access",
            benchmark: { critical: "0", developing: "30", progressive: "55", exemplary: "75" },
            direction: "higher",
          },
          {
            id: "hs-4",
            name: "Menstrual health product availability score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Infrastructure assessment",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "mental-health",
        name: "Mental Health and Wellbeing",
        indicators: [
          {
            id: "hs-5",
            name: "Prevalence of depression/anxiety (%)",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Mental health burden (lower is better)",
            benchmark: { critical: "40", developing: "25", progressive: "15", exemplary: "8" },
            direction: "lower",
          },
          {
            id: "hs-6",
            name: "Mental health counsellors per 10,000",
            type: "Quantitative",
            dataType: "number",
            unit: "per 10k",
            description: "Service capacity",
            benchmark: { critical: "0", developing: "0.5", progressive: "1", exemplary: "2" },
            direction: "higher",
          },
          {
            id: "hs-7",
            name: "Satisfaction with mental health services",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Service quality perception",
            benchmark: { critical: "0", developing: "4", progressive: "6", exemplary: "8" },
            direction: "higher",
          },
          {
            id: "hs-8",
            name: "Mental health integration in GBV recovery score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Integrated service delivery",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "wash",
        name: "WASH Access",
        indicators: [
          {
            id: "hs-9",
            name: "% of public toilets women-specific & safe",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Gender-responsive WASH",
            benchmark: { critical: "0", developing: "20", progressive: "40", exemplary: "70" },
            direction: "higher",
          },
          {
            id: "hs-10",
            name: "% within 500m of safe water source",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Water access equity",
            benchmark: { critical: "0", developing: "40", progressive: "70", exemplary: "95" },
            direction: "higher",
          },
          {
            id: "hs-11",
            name: "% of schools with gender-separated toilets",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Education facility WASH",
            benchmark: { critical: "0", developing: "30", progressive: "60", exemplary: "90" },
            direction: "higher",
          },
        ],
      },
    ],
  },
  {
    id: "governance-voice",
    name: "Governance and Voice",
    shortName: "Governance",
    description: "Women's meaningful participation in urban planning, local governance, and decision-making processes.",
    icon: "users",
    color: "#06b6d4",
    subdomains: [
      {
        id: "political-representation",
        name: "Political Representation",
        indicators: [
          {
            id: "gv-1",
            name: "% of Thromde council seats held by women",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Political representation",
            benchmark: { critical: "0", developing: "15", progressive: "30", exemplary: "40" },
            direction: "higher",
            source: "UNDP Bhutan NAP GEPA",
          },
          {
            id: "gv-2",
            name: "% of planning committees with 40%+ women",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Committee gender balance",
            benchmark: { critical: "0", developing: "15", progressive: "35", exemplary: "60" },
            direction: "higher",
          },
          {
            id: "gv-3",
            name: "% of senior urban admin roles held by women",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Administrative leadership",
            benchmark: { critical: "0", developing: "10", progressive: "25", exemplary: "40" },
            direction: "higher",
          },
          {
            id: "gv-4",
            name: "Women's perception of being heard in government",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Voice and influence",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "8" },
            direction: "higher",
          },
        ],
      },
      {
        id: "participatory-planning",
        name: "Participatory Planning",
        indicators: [
          {
            id: "gv-5",
            name: "% of master plans with gender consultations",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Inclusive planning process",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "gv-6",
            name: "Women's participation in planning meetings (%)",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Civic participation",
            benchmark: { critical: "0", developing: "15", progressive: "30", exemplary: "45" },
            direction: "higher",
          },
          {
            id: "gv-7",
            name: "Gender-responsive budgeting score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Budget inclusiveness",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
          {
            id: "gv-8",
            name: "% of projects with women's safety audits",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Safety-integrated planning",
            benchmark: { critical: "0", developing: "15", progressive: "40", exemplary: "70" },
            direction: "higher",
          },
        ],
      },
      {
        id: "data-monitoring",
        name: "Data and Monitoring",
        indicators: [
          {
            id: "gv-9",
            name: "% of urban indicators disaggregated by sex",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Data gender responsiveness",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "gv-10",
            name: "Gender surveys per year",
            type: "Quantitative",
            dataType: "number",
            unit: "per year",
            description: "Monitoring frequency",
            benchmark: { critical: "0", developing: "1", progressive: "2", exemplary: "4" },
            direction: "higher",
          },
          {
            id: "gv-11",
            name: "Gender data repository availability score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Data infrastructure",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
    ],
  },
  {
    id: "climate-resilience",
    name: "Climate Resilience",
    shortName: "Climate",
    description: "Women's agency in climate adaptation, disaster risk reduction, and sustainable resource management in Bhutan's fragile mountain ecosystem.",
    icon: "leaf",
    color: "#10b981",
    subdomains: [
      {
        id: "disaster-warning",
        name: "Disaster Risks and Early Warning",
        indicators: [
          {
            id: "cr-1",
            name: "% of women reached by early warning systems",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Early warning coverage",
            benchmark: { critical: "0", developing: "20", progressive: "40", exemplary: "70" },
            direction: "higher",
            source: "Sendai Framework for DRR",
          },
          {
            id: "cr-2",
            name: "% of women trained in disaster management",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "DRR capacity building",
            benchmark: { critical: "0", developing: "10", progressive: "25", exemplary: "50" },
            direction: "higher",
          },
          {
            id: "cr-3",
            name: "Gender gap in disaster mortality ratio",
            type: "Quantitative",
            dataType: "ratio",
            unit: "ratio",
            description: "1=equal, >1=women more affected (lower is better)",
            benchmark: { critical: "2", developing: "1.5", progressive: "1.2", exemplary: "1" },
            direction: "lower",
            source: "Shillington et al. 2021",
          },
          {
            id: "cr-4",
            name: "Women's leadership in DRR committees score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "DRR governance participation",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "climate-adaptation",
        name: "Climate Adaptation and Livelihood",
        indicators: [
          {
            id: "cr-5",
            name: "% of women in climate adaptation programmes",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Adaptation program reach",
            benchmark: { critical: "0", developing: "15", progressive: "35", exemplary: "60" },
            direction: "higher",
          },
          {
            id: "cr-6",
            name: "Adoption of climate-resilient practices score",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Knowledge and adoption",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "8" },
            direction: "higher",
          },
          {
            id: "cr-7",
            name: "Women's access to climate finance score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Green economy access",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "green-infrastructure",
        name: "Green and Blue Urban Infrastructure",
        indicators: [
          {
            id: "cr-8",
            name: "% of green spaces with women's safety design",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Gender-responsive green design",
            benchmark: { critical: "0", developing: "10", progressive: "25", exemplary: "50" },
            direction: "higher",
          },
          {
            id: "cr-9",
            name: "Women's satisfaction with public parks",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Green space utilization",
            benchmark: { critical: "0", developing: "4", progressive: "6", exemplary: "8" },
            direction: "higher",
          },
          {
            id: "cr-10",
            name: "% of women in environmental groups",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Environmental participation",
            benchmark: { critical: "0", developing: "10", progressive: "25", exemplary: "45" },
            direction: "higher",
          },
        ],
      },
    ],
  },
  {
    id: "culture-identity",
    name: "Culture and Identity",
    shortName: "Culture",
    description: "Integration of Bhutan's GNH values, Buddhist traditions, and indigenous knowledge with gender equity in urban life.",
    icon: "globe",
    color: "#a855f7",
    subdomains: [
      {
        id: "gnh-alignment",
        name: "GNH and Gender Equity Alignment",
        indicators: [
          {
            id: "ci-1",
            name: "GNH wellbeing score (women, urban)",
            type: "Quantitative",
            dataType: "index",
            unit: "/10",
            description: "GNH wellbeing metric",
            benchmark: { critical: "0", developing: "4", progressive: "6", exemplary: "8" },
            direction: "higher",
            source: "Centre for Bhutan Studies & GNH Research",
          },
          {
            id: "ci-2",
            name: "% of cultural programmes promoting gender equity",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Cultural programming equity",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "ci-3",
            name: "Community acceptance of women in leadership",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Social acceptance metric",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "8" },
            direction: "higher",
          },
        ],
      },
      {
        id: "indigenous-knowledge",
        name: "Indigenous and Traditional Knowledge",
        indicators: [
          {
            id: "ci-4",
            name: "Integration of women's ecological knowledge score",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Knowledge integration",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
          {
            id: "ci-5",
            name: "% of heritage initiatives centring women's roles",
            type: "Qualitative",
            dataType: "percentage",
            unit: "%",
            description: "Cultural preservation equity",
            benchmark: { critical: "0", developing: "15", progressive: "40", exemplary: "70" },
            direction: "higher",
          },
          {
            id: "ci-6",
            name: "Ethnic diversity in planning participation score",
            type: "Participatory",
            dataType: "index",
            unit: "/10",
            description: "Diverse representation",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
      {
        id: "social-norms",
        name: "Social Norms and Gender Attitudes",
        indicators: [
          {
            id: "ci-7",
            name: "Gender attitude index change (pts/yr)",
            type: "Quantitative",
            dataType: "number",
            unit: "pts",
            description: "Attitudinal change (higher is better)",
            benchmark: { critical: "0", developing: "1", progressive: "3", exemplary: "5" },
            direction: "higher",
          },
          {
            id: "ci-8",
            name: "% of schools with gender equality curricula",
            type: "Quantitative",
            dataType: "percentage",
            unit: "%",
            description: "Education integration",
            benchmark: { critical: "0", developing: "20", progressive: "50", exemplary: "80" },
            direction: "higher",
          },
          {
            id: "ci-9",
            name: "Media representation index for women leaders",
            type: "Qualitative",
            dataType: "index",
            unit: "/10",
            description: "Media representation",
            benchmark: { critical: "0", developing: "3", progressive: "6", exemplary: "9" },
            direction: "higher",
          },
        ],
      },
    ],
  },
];

export const CITIES: { id: string; name: string }[] = [
  { id: "thimphu", name: "Thimphu" },
  { id: "phuntsholing", name: "Phuntsholing" },
  { id: "gelephu", name: "Gelephu" },
  { id: "paro", name: "Paro" },
];

export function getAllIndicators(): (Indicator & { domainId: string; subdomainId: string })[] {
  return DEFAULT_DOMAINS.flatMap((d) =>
    d.subdomains.flatMap((s) =>
      s.indicators.map((i) => ({
        ...i,
        domainId: d.id,
        subdomainId: s.id,
      }))
    )
  );
}

/** @deprecated Use DEFAULT_DOMAINS or pass domains as a prop instead. */
export const DOMAINS = DEFAULT_DOMAINS;
