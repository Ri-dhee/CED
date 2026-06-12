export type IndicatorType = "Quantitative" | "Qualitative" | "Participatory";

export interface Indicator {
  id: string;
  name: string;
  type: IndicatorType;
  description: string;
}

export interface SubDomain {
  id: string;
  name: string;
  indicators: Indicator[];
}

export interface Domain {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  subdomains: SubDomain[];
}

export interface DomainScore {
  domainId: string;
  score: number;
  subdomainScores: { subdomainId: string; score: number }[];
}

export interface GRMEResult {
  city: string;
  year: number;
  domainScores: DomainScore[];
  overallScore: number;
}

export const DOMAINS: Domain[] = [
  {
    id: "safety-security",
    name: "Safety and Security",
    shortName: "Safety",
    description:
      "Women's physical safety, freedom from violence, and sense of security in public and private spaces across diverse altitudes and terrains.",
    icon: "shield",
    color: "#ef4444",
    subdomains: [
      {
        id: "public-space-safety",
        name: "Public Space Safety",
        indicators: [
          {
            id: "ss-1",
            name: "% of women who feel safe walking alone in urban areas at night",
            type: "Quantitative",
            description: "Measures perceived safety in public spaces after dark",
          },
          {
            id: "ss-2",
            name: "Rate of gender-based violence (GBV) incidents reported in urban centres, disaggregated by type",
            type: "Quantitative",
            description: "Tracks reported GBV cases by category",
          },
          {
            id: "ss-3",
            name: "% of streets with adequate lighting, especially in hilly/steep zones",
            type: "Quantitative",
            description: "Infrastructure safety measure",
          },
          {
            id: "ss-4",
            name: "Women's perception of safety at public transport nodes",
            type: "Participatory",
            description: "Women's lived experience of safety at transit points",
          },
          {
            id: "ss-5",
            name: "Presence and functionality of accessible emergency call points in urban zones",
            type: "Qualitative",
            description: "Emergency response infrastructure",
          },
        ],
      },
      {
        id: "gbv-response",
        name: "Institutional Response to GBV",
        indicators: [
          {
            id: "ss-6",
            name: "Number of functional GBV response centres per 10,000 women",
            type: "Quantitative",
            description: "Access to GBV support services",
          },
          {
            id: "ss-7",
            name: "Average response time of law enforcement to GBV complaints",
            type: "Quantitative",
            description: "Institutional responsiveness",
          },
          {
            id: "ss-8",
            name: "% of reported GBV cases reaching resolution in formal justice systems",
            type: "Quantitative",
            description: "Justice system effectiveness",
          },
          {
            id: "ss-9",
            name: "Awareness among women of formal GBV complaint mechanisms",
            type: "Participatory",
            description: "Knowledge of available support",
          },
        ],
      },
      {
        id: "digital-safety",
        name: "Digital Safety",
        indicators: [
          {
            id: "ss-10",
            name: "Prevalence of online harassment experienced by women in urban areas",
            type: "Quantitative",
            description: "Digital violence metric",
          },
          {
            id: "ss-11",
            name: "Existence of digital safety policies and enforcement mechanisms for platforms used locally",
            type: "Qualitative",
            description: "Policy framework for digital safety",
          },
          {
            id: "ss-12",
            name: "% of women aware of cyber-crime reporting channels",
            type: "Quantitative",
            description: "Awareness of digital safety resources",
          },
        ],
      },
    ],
  },
  {
    id: "mobility-access",
    name: "Mobility and Access",
    shortName: "Mobility",
    description:
      "Equitable, affordable, and terrain-adapted transport and mobility for women across Bhutan's steep, high-altitude urban settings.",
    icon: "map",
    color: "#3b82f6",
    subdomains: [
      {
        id: "public-transport",
        name: "Public Transport Equity",
        indicators: [
          {
            id: "ma-1",
            name: "% of women-headed households within 400m of a regular bus stop or shared transport node",
            type: "Quantitative",
            description: "Transit accessibility",
          },
          {
            id: "ma-2",
            name: "Gender disaggregated public transport ridership and satisfaction scores",
            type: "Quantitative",
            description: "Usage and satisfaction metrics",
          },
          {
            id: "ma-3",
            name: "Affordability index: % of women's income spent on transport",
            type: "Quantitative",
            description: "Transport cost burden",
          },
          {
            id: "ma-4",
            name: "Presence of women-only seating or reserved space on public transport",
            type: "Qualitative",
            description: "Gender-responsive transport design",
          },
        ],
      },
      {
        id: "terrain-infrastructure",
        name: "Terrain-responsive Infrastructure",
        indicators: [
          {
            id: "ma-5",
            name: "% of pedestrian paths with handrails, adequate width, and non-slip surfaces in hilly zones",
            type: "Quantitative",
            description: "Mountain-adapted pedestrian infrastructure",
          },
          {
            id: "ma-6",
            name: "Coverage of elevators or escalators at major public transit nodes for persons with disabilities and elderly women",
            type: "Quantitative",
            description: "Accessibility infrastructure",
          },
          {
            id: "ma-7",
            name: "% of market areas, health facilities, and schools reachable without a vehicle",
            type: "Quantitative",
            description: "Walkability metric",
          },
        ],
      },
      {
        id: "care-mobility",
        name: "Care Economy Mobility",
        indicators: [
          {
            id: "ma-8",
            name: "Average travel time for women to access childcare, schools, and health facilities",
            type: "Quantitative",
            description: "Care trip efficiency",
          },
          {
            id: "ma-9",
            name: "% of urban plans incorporating 'care trip chains' in transport modelling",
            type: "Qualitative",
            description: "Planning integration of care needs",
          },
          {
            id: "ma-10",
            name: "Women's reported difficulty in combining work, care, and service access trips",
            type: "Participatory",
            description: "Lived experience of mobility challenges",
          },
        ],
      },
    ],
  },
  {
    id: "housing-land",
    name: "Housing and Land",
    shortName: "Housing",
    description:
      "Secure tenure, affordable and climate-adapted housing, and women's legal access to land in Bhutan's urban growth areas.",
    icon: "home",
    color: "#8b5cf6",
    subdomains: [
      {
        id: "tenure-ownership",
        name: "Tenure and Ownership",
        indicators: [
          {
            id: "hl-1",
            name: "% of women with independent or joint land/housing title in urban areas",
            type: "Quantitative",
            description: "Land ownership security",
          },
          {
            id: "hl-2",
            name: "% of registered urban plots with women as primary or co-owners",
            type: "Quantitative",
            description: "Property registration metrics",
          },
          {
            id: "hl-3",
            name: "Legal barriers faced by divorced or widowed women in retaining housing",
            type: "Qualitative",
            description: "Legal framework assessment",
          },
          {
            id: "hl-4",
            name: "% of urban housing allocation schemes with explicit gender equity criteria",
            type: "Qualitative",
            description: "Policy inclusiveness",
          },
        ],
      },
      {
        id: "affordability",
        name: "Affordability and Habitability",
        indicators: [
          {
            id: "hl-5",
            name: "% of women-headed households spending >30% of income on rent",
            type: "Quantitative",
            description: "Housing cost burden",
          },
          {
            id: "hl-6",
            name: "Overcrowding index in women-headed households",
            type: "Quantitative",
            description: "Living conditions metric",
          },
          {
            id: "hl-7",
            name: "Access to functional sanitation (private toilet) disaggregated by gender of household head",
            type: "Quantitative",
            description: "Basic services access",
          },
          {
            id: "hl-8",
            name: "Availability of affordable rental housing near employment centres for women migrants",
            type: "Qualitative",
            description: "Housing availability for migrant women",
          },
        ],
      },
      {
        id: "climate-housing",
        name: "Climate and Disaster Resilience",
        indicators: [
          {
            id: "hl-9",
            name: "% of women-headed households in high seismic or landslide risk zones with retrofitted housing",
            type: "Quantitative",
            description: "Climate-resilient housing",
          },
          {
            id: "hl-10",
            name: "Inclusion of women in community-level disaster risk mapping processes",
            type: "Participatory",
            description: "Participation in resilience planning",
          },
          {
            id: "hl-11",
            name: "% of women aware of housing insurance schemes or government disaster relief entitlements",
            type: "Quantitative",
            description: "Awareness of protection mechanisms",
          },
        ],
      },
    ],
  },
  {
    id: "economic-inclusion",
    name: "Economic Inclusion",
    shortName: "Economy",
    description:
      "Access to livelihoods, financial services, and economic agency in Bhutan's emerging urban economy.",
    icon: "chart",
    color: "#f59e0b",
    subdomains: [
      {
        id: "labor-market",
        name: "Labor Market Participation",
        indicators: [
          {
            id: "ei-1",
            name: "Gender wage gap in urban formal and informal sectors",
            type: "Quantitative",
            description: "Pay equity metric",
          },
          {
            id: "ei-2",
            name: "% of women in urban workforce in managerial/decision-making roles",
            type: "Quantitative",
            description: "Leadership representation",
          },
          {
            id: "ei-3",
            name: "% of urban women engaged in informal economy with access to social protection",
            type: "Quantitative",
            description: "Social safety net coverage",
          },
          {
            id: "ei-4",
            name: "Prevalence of unpaid care work hours per day for women vs men in urban households",
            type: "Quantitative",
            description: "Care work burden metric",
          },
        ],
      },
      {
        id: "entrepreneurship",
        name: "Entrepreneurship and Financial Access",
        indicators: [
          {
            id: "ei-5",
            name: "% of urban small businesses owned by women with access to formal credit",
            type: "Quantitative",
            description: "Financial inclusion",
          },
          {
            id: "ei-6",
            name: "Gender disaggregated uptake of government enterprise support schemes",
            type: "Quantitative",
            description: "Government support accessibility",
          },
          {
            id: "ei-7",
            name: "Number of women-led cooperatives in urban commercial zones",
            type: "Quantitative",
            description: "Collective economic empowerment",
          },
          {
            id: "ei-8",
            name: "Women's digital financial literacy and mobile banking usage rates",
            type: "Quantitative",
            description: "Digital financial inclusion",
          },
        ],
      },
      {
        id: "care-infrastructure",
        name: "Childcare and Care Infrastructure",
        indicators: [
          {
            id: "ei-9",
            name: "Coverage of subsidised or community childcare centres per 1,000 working-age women",
            type: "Quantitative",
            description: "Childcare accessibility",
          },
          {
            id: "ei-10",
            name: "% of workplaces with lactation facilities and flexible working provisions",
            type: "Qualitative",
            description: "Workplace support infrastructure",
          },
          {
            id: "ei-11",
            name: "Women's self-reported barriers to employment due to care responsibilities",
            type: "Participatory",
            description: "Lived experience of care barriers",
          },
        ],
      },
    ],
  },
  {
    id: "health-services",
    name: "Health and Services",
    shortName: "Health",
    description:
      "Equitable access to gender-responsive health, WASH, and social services in Bhutan's mountain urban centres.",
    icon: "heart",
    color: "#ec4899",
    subdomains: [
      {
        id: "srh",
        name: "Sexual and Reproductive Health",
        indicators: [
          {
            id: "hs-1",
            name: "% of urban women with access to a functional primary health centre within 30 minutes",
            type: "Quantitative",
            description: "Healthcare accessibility",
          },
          {
            id: "hs-2",
            name: "Maternal mortality ratio in urban vs peri-urban zones",
            type: "Quantitative",
            description: "Maternal health outcome",
          },
          {
            id: "hs-3",
            name: "Contraceptive prevalence rate and unmet need among urban women",
            type: "Quantitative",
            description: "Reproductive health access",
          },
          {
            id: "hs-4",
            name: "Availability and use of menstrual health products in public spaces and workplaces",
            type: "Qualitative",
            description: "Menstrual health infrastructure",
          },
        ],
      },
      {
        id: "mental-health",
        name: "Mental Health and Wellbeing",
        indicators: [
          {
            id: "hs-5",
            name: "Prevalence of depression and anxiety among urban women, disaggregated by age",
            type: "Quantitative",
            description: "Mental health burden",
          },
          {
            id: "hs-6",
            name: "Number of trained mental health counsellors accessible to women per 10,000 population",
            type: "Quantitative",
            description: "Mental health service capacity",
          },
          {
            id: "hs-7",
            name: "Women's satisfaction with mental health services (GNH-aligned wellbeing index)",
            type: "Participatory",
            description: "Service quality perception",
          },
          {
            id: "hs-8",
            name: "Integration of mental health support in GBV and disaster recovery services",
            type: "Qualitative",
            description: "Integrated service delivery",
          },
        ],
      },
      {
        id: "wash",
        name: "WASH Access",
        indicators: [
          {
            id: "hs-9",
            name: "% of public toilets in urban areas with women-specific, clean, and safe facilities",
            type: "Quantitative",
            description: "Gender-responsive WASH infrastructure",
          },
          {
            id: "hs-10",
            name: "Proximity of safe water sources to women-headed households in peri-urban zones",
            type: "Quantitative",
            description: "Water access equity",
          },
          {
            id: "hs-11",
            name: "% of urban schools with gender-separated functional toilets",
            type: "Quantitative",
            description: "Education facility WASH",
          },
        ],
      },
    ],
  },
  {
    id: "governance-voice",
    name: "Governance and Voice",
    shortName: "Governance",
    description:
      "Women's meaningful participation in urban planning, local governance, and decision-making processes.",
    icon: "users",
    color: "#06b6d4",
    subdomains: [
      {
        id: "political-representation",
        name: "Political Representation",
        indicators: [
          {
            id: "gv-1",
            name: "% of Thromde (municipal) council seats held by women",
            type: "Quantitative",
            description: "Political representation",
          },
          {
            id: "gv-2",
            name: "% of urban planning committees with at least 40% women membership",
            type: "Quantitative",
            description: "Committee gender balance",
          },
          {
            id: "gv-3",
            name: "Number of women serving in senior roles in urban administration",
            type: "Quantitative",
            description: "Administrative leadership",
          },
          {
            id: "gv-4",
            name: "Women's perception of being heard in local government processes",
            type: "Participatory",
            description: "Voice and influence perception",
          },
        ],
      },
      {
        id: "participatory-planning",
        name: "Participatory Planning",
        indicators: [
          {
            id: "gv-5",
            name: "% of urban master plans developed with gender-disaggregated participatory consultations",
            type: "Qualitative",
            description: "Inclusive planning process",
          },
          {
            id: "gv-6",
            name: "Women's participation rate in local area planning meetings",
            type: "Quantitative",
            description: "Civic participation",
          },
          {
            id: "gv-7",
            name: "Existence of gender-responsive budgeting in urban local body budgets",
            type: "Qualitative",
            description: "Budget inclusiveness",
          },
          {
            id: "gv-8",
            name: "% of urban infrastructure projects with women's safety audits conducted",
            type: "Qualitative",
            description: "Safety-integrated planning",
          },
        ],
      },
      {
        id: "data-monitoring",
        name: "Data and Monitoring Systems",
        indicators: [
          {
            id: "gv-9",
            name: "% of urban indicators in national/local databases disaggregated by sex",
            type: "Quantitative",
            description: "Data gender responsiveness",
          },
          {
            id: "gv-10",
            name: "Frequency of gender-disaggregated urban living conditions surveys",
            type: "Quantitative",
            description: "Monitoring frequency",
          },
          {
            id: "gv-11",
            name: "Existence of a dedicated gender and urban data repository accessible to planners",
            type: "Qualitative",
            description: "Data infrastructure",
          },
        ],
      },
    ],
  },
  {
    id: "climate-resilience",
    name: "Climate Resilience",
    shortName: "Climate",
    description:
      "Women's agency in climate adaptation, disaster risk reduction, and sustainable resource management in Bhutan's fragile mountain ecosystem.",
    icon: "leaf",
    color: "#10b981",
    subdomains: [
      {
        id: "disaster-warning",
        name: "Disaster Risks and Early Warning",
        indicators: [
          {
            id: "cr-1",
            name: "% of women reached by early warning systems for GLOF, landslides, and earthquakes",
            type: "Quantitative",
            description: "Early warning coverage",
          },
          {
            id: "cr-2",
            name: "% of women trained in first response and community disaster management teams",
            type: "Quantitative",
            description: "DRR capacity building",
          },
          {
            id: "cr-3",
            name: "Gender disaggregated mortality and displacement in urban disaster events",
            type: "Quantitative",
            description: "Disaster impact equity",
          },
          {
            id: "cr-4",
            name: "Women's leadership roles in community disaster management committees",
            type: "Qualitative",
            description: "DRR governance participation",
          },
        ],
      },
      {
        id: "climate-adaptation",
        name: "Climate Adaptation and Livelihood",
        indicators: [
          {
            id: "cr-5",
            name: "% of women beneficiaries of climate adaptation livelihood support programmes",
            type: "Quantitative",
            description: "Adaptation program reach",
          },
          {
            id: "cr-6",
            name: "Women's knowledge and adoption of climate-resilient building practices",
            type: "Participatory",
            description: "Adoption of resilient practices",
          },
          {
            id: "cr-7",
            name: "Access to climate finance and green business opportunities for women entrepreneurs",
            type: "Qualitative",
            description: "Green economy access",
          },
        ],
      },
      {
        id: "green-infrastructure",
        name: "Green and Blue Urban Infrastructure",
        indicators: [
          {
            id: "cr-8",
            name: "% of urban green spaces within 500m of residential areas designed with women's safety in mind",
            type: "Quantitative",
            description: "Gender-responsive green design",
          },
          {
            id: "cr-9",
            name: "Women's use of and satisfaction with public parks and natural spaces",
            type: "Participatory",
            description: "Green space utilization",
          },
          {
            id: "cr-10",
            name: "Women's participation in urban community gardens, water management groups, or forest user groups",
            type: "Quantitative",
            description: "Environmental participation",
          },
        ],
      },
    ],
  },
  {
    id: "culture-identity",
    name: "Culture and Identity",
    shortName: "Culture",
    description:
      "Integration of Bhutan's GNH values, Buddhist traditions, and indigenous knowledge with gender equity in urban life.",
    icon: "globe",
    color: "#a855f7",
    subdomains: [
      {
        id: "gnh-alignment",
        name: "GNH and Gender Equity Alignment",
        indicators: [
          {
            id: "ci-1",
            name: "Women's subjective wellbeing scores (GNH survey) disaggregated by urban/peri-urban residence",
            type: "Quantitative",
            description: "GNH wellbeing metric",
          },
          {
            id: "ci-2",
            name: "% of urban cultural programmes that promote gender-equitable narratives",
            type: "Qualitative",
            description: "Cultural programming equity",
          },
          {
            id: "ci-3",
            name: "Level of community acceptance of women in public leadership (attitudinal survey)",
            type: "Participatory",
            description: "Social acceptance metric",
          },
        ],
      },
      {
        id: "indigenous-knowledge",
        name: "Indigenous and Traditional Knowledge",
        indicators: [
          {
            id: "ci-4",
            name: "Recognition and integration of women's traditional ecological knowledge in urban climate plans",
            type: "Qualitative",
            description: "Knowledge integration",
          },
          {
            id: "ci-5",
            name: "% of urban heritage and cultural preservation initiatives that centre women's roles",
            type: "Qualitative",
            description: "Cultural preservation equity",
          },
          {
            id: "ci-6",
            name: "Representation of diverse ethnic women (Lhotshampa, Sharchop, Ngalop) in urban planning processes",
            type: "Participatory",
            description: "Ethnic diversity in participation",
          },
        ],
      },
      {
        id: "social-norms",
        name: "Social Norms and Gender Attitudes",
        indicators: [
          {
            id: "ci-7",
            name: "Change in gender attitude index scores among urban residents over time",
            type: "Quantitative",
            description: "Attitudinal change metric",
          },
          {
            id: "ci-8",
            name: "% of urban schools incorporating gender equality in curricula",
            type: "Quantitative",
            description: "Education integration",
          },
          {
            id: "ci-9",
            name: "Media representation index for women in leadership in local urban broadcasting",
            type: "Qualitative",
            description: "Media representation",
          },
        ],
      },
    ],
  },
];

export const SCORING_RUBRIC = {
  quantitative: [
    { range: [0, 25], label: "Critical", description: "Significant gap" },
    { range: [26, 50], label: "Developing", description: "Below average" },
    { range: [51, 75], label: "Progressive", description: "On track" },
    { range: [76, 100], label: "Exemplary", description: "Best practice" },
  ],
  qualitative: [
    { range: [0, 25], label: "Critical", description: "Non-existent" },
    { range: [26, 50], label: "Developing", description: "Partially implemented" },
    { range: [51, 75], label: "Progressive", description: "Substantially implemented" },
    { range: [76, 100], label: "Exemplary", description: "Fully implemented with monitoring" },
  ],
  participatory: [
    { range: [0, 25], label: "Critical", description: "Very dissatisfied" },
    { range: [26, 50], label: "Developing", description: "Dissatisfied" },
    { range: [51, 75], label: "Progressive", description: "Satisfied" },
    { range: [76, 100], label: "Exemplary", description: "Very satisfied" },
  ],
};

export function getScoreLabel(score: number): string {
  if (score <= 25) return "Critical";
  if (score <= 50) return "Developing";
  if (score <= 75) return "Progressive";
  return "Exemplary";
}

export function getScoreColor(score: number): string {
  if (score <= 25) return "#ef4444";
  if (score <= 50) return "#f59e0b";
  if (score <= 75) return "#3b82f6";
  return "#10b981";
}

export function calculateDomainScore(domain: Domain, scores: Record<string, number>): number {
  const allIndicators = domain.subdomains.flatMap((s) => s.indicators);
  const indicatorScores = allIndicators.map((ind) => scores[ind.id] ?? 50);
  return indicatorScores.reduce((a, b) => a + b, 0) / indicatorScores.length;
}

export function calculateOverallScore(scores: Record<string, number>): number {
  const domainScores = DOMAINS.map((d) => calculateDomainScore(d, scores));
  return domainScores.reduce((a, b) => a + b, 0) / domainScores.length;
}
