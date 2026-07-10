import { Benchmark, DataType, Direction, Domain, Indicator, IndicatorType, SubDomain } from "./grme-data";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function benchmarkFor(dataType: DataType, direction: Direction): Benchmark {
  if (direction === "lower") {
    return dataType === "percentage"
      ? { critical: "80", developing: "60", progressive: "35", exemplary: "10" }
      : { critical: "100", developing: "70", progressive: "40", exemplary: "10" };
  }
  return dataType === "percentage"
    ? { critical: "0", developing: "30", progressive: "60", exemplary: "80" }
    : { critical: "0", developing: "25", progressive: "50", exemplary: "75" };
}

function inferDataType(name: string, type: IndicatorType): DataType {
  const lower = name.toLowerCase();
  if (type === "Participatory") return "number";
  if (type === "Qualitative") {
    if (/existence|presence|functional|available|availability|policy|mechanism|updated list|integration|functionality|leadership/.test(lower)) {
      return "boolean";
    }
    return "text";
  }
  if (/%/.test(name) || /percentage|coverage|share|proportion/.test(lower)) return "percentage";
  if (/time|rate|index|ratio|score|gap|count|number|mortality|income|wage|displacement|affordability|prevalence|utili[sz]ation/.test(lower)) {
    return "number";
  }
  return "number";
}

function inferDirection(name: string, type: IndicatorType): Direction {
  const lower = name.toLowerCase();
  if (type === "Qualitative") return "higher";
  if (/rate of|crime rate|overcrowding|unpaved|degraded|average response time|travel time|spending >|prevalence|mortality|noise levels|water quality|air quality|turnaround time|displacement|gender wage gap|online harassment|difficulty|barriers/.test(lower)) {
    return "lower";
  }
  return "higher";
}

function makeIndicator(name: string, type: IndicatorType, id?: string): Indicator {
  const dataType = inferDataType(name, type);
  const direction = inferDirection(name, type);
  return {
    id: id || slugify(name),
    name,
    type,
    dataType,
    unit: dataType === "percentage" ? "%" : dataType === "boolean" ? "yes/no" : "",
    description: name,
    benchmark: benchmarkFor(dataType, direction),
    direction,
    validationStatus: "draft",
  };
}

function q(...names: string[]): Indicator[] {
  return names.map((name) => makeIndicator(name, "Quantitative"));
}

function ql(...names: string[]): Indicator[] {
  return names.map((name) => makeIndicator(name, "Qualitative"));
}

function p(...names: string[]): Indicator[] {
  return names.map((name) => makeIndicator(name, "Participatory"));
}

function subdomain(id: string, name: string, indicators: Indicator[], description?: string, weight?: number): SubDomain {
  return { id, name, description, indicators, weight };
}

function domain(
  id: string,
  name: string,
  shortName: string,
  description: string,
  icon: string,
  color: string,
  subdomains: SubDomain[],
  methodologyNote?: string
): Domain {
  return { id, name, shortName, description, icon, color, subdomains, methodologyNote, weight: 1 };
}

export const DEFAULT_DOMAINS: Domain[] = [
  domain(
    "safety-security",
    "Safety and Security",
    "Safety",
    "Women's physical safety, freedom from violence, and sense of security in public and private spaces across diverse altitudes and terrains.",
    "shield",
    "#ef4444",
    [
      subdomain(
        "public-space-safety",
        "Public Space Safety",
        [...q(
          "% of women who feel safe walking alone in urban areas at night",
          "Rate of gender-based violence (GBV) incidents reported in urban centres, disaggregated by type",
          "% of streets with adequate lighting, especially in hilly/steep zones",
          "% of total length of streets with pedestrian walkways in kms",
          "% of total pedestrian walkways with tactiles in kms",
          "Crime rate"
        ), ...p("Women's perception of safety at public transport nodes"), ...ql("Presence and functionality of accessible emergency call points in urban zones")],
        "Public safety conditions in shared urban spaces"
      ),
      subdomain(
        "institutional-response-to-gbv",
        "Institutional Response to Gender-Based Violence (GBV)",
        q(
          "Number of functional GBV response centres per 1000 women",
          "Average response time of law enforcement to GBV complaints",
          "% of reported GBV cases reaching resolution in formal justice systems"
        ).concat(p("Awareness among women of formal GBV complaint mechanisms")),
        "Service response and justice-system readiness"
      ),
      subdomain(
        "digital-safety",
        "Digital Safety",
        q("Prevalence of online harassment experienced by women in urban areas", "% of women aware of cyber-crime reporting channels").concat(
          ql("Existence of digital safety policies and enforcement mechanisms for platforms used locally")
        ),
        "Online safety and cyber-awareness"
      ),
    ],
    "Composite scores emphasize public safety outcomes, GBV response, and digital protection."
  ),
  domain(
    "mobility-access",
    "Mobility and Access",
    "Mobility",
    "Equitable, affordable, and terrain-adapted transport and mobility for women across Bhutan's steep, high-altitude urban settings.",
    "route",
    "#f97316",
    [
      subdomain(
        "public-transport",
        "Public Transport",
        q(
          "% of people using public transport to commute to work",
          "% of women-headed households within 400m of a regular bus stop or shared transport node",
          "Gender-disaggregated public transport ridership and satisfaction scores",
          "Affordability index: % of household income spent on transport"
        ).concat(ql("Presence of women-only seating or reserved space on public transport")),
        "Transport access and affordability"
      ),
      subdomain(
        "terrain-responsive-infrastructure",
        "Terrain-Responsive Infrastructure",
        q(
          "% of total length of roads that are unpaved or degraded",
          "% of pedestrian paths (in meters) with handrails, adequate width, and non-slip surfaces in hilly zones",
          "Coverage of elevators or escalators at major public transit nodes for persons with disabilities and elderly residents",
          "% of market areas, health facilities, and schools reachable without a vehicle"
        ),
        "Terrain-sensitive access and universal design"
      ),
      subdomain(
        "care-economy-mobility",
        "Care Economy Mobility",
        q(
          "Average travel time for residents to access childcare, schools, and health facilities"
        ).concat(
          ql("% of urban plans incorporating 'care trip chains' in transport modelling"),
          p("Women's reported difficulty in combining work, care, and service access trips")
        ),
        "Travel linked to unpaid care work and service access"
      ),
    ],
    "Scores reward accessible transport, terrain-resilient infrastructure, and reduced care-travel burdens."
  ),
  domain(
    "housing-land",
    "Housing and Land",
    "Housing",
    "Secure tenure, affordable and climate-adapted housing, and women's legal access to land in Bhutan's urban growth areas.",
    "home",
    "#8b5cf6",
    [
      subdomain(
        "tenure-and-ownership",
        "Tenure and Ownership",
        q(
          "% of households living in self owned homes (Home ownership by gender and age)",
          "% of land ownership (by sex and age)"
        ).concat(
          ql("Legal barriers faced by divorced or widowed women in retaining housing"),
          ql("% of urban housing allocation schemes with explicit gender equity criteria")
        ),
        "Tenure security and equitable ownership"
      ),
      subdomain(
        "affordability-and-habitability",
        "Affordability and Habitability",
        q(
          "% of household heads spending >30% of income on rent (gender disaggregated)",
          "Overcrowding index in women-headed households",
          "% of urban households with access to at least one independent toilet."
        ).concat(
          ql("Availability of affordable (<30% income) rental housing near (within 5mins drive) employment centres for women")
        ),
        "Housing cost and liveability"
      ),
      subdomain(
        "climate-and-disaster-resilience-housing",
        "Climate and Disaster Resilience (Housing)",
        q(
          "% of households living in houses/ buildings built prior to 2002 (Note: All houses/ buildings constructed prior to 2002 were not subject to Bhutan building code)",
          "% of community members involved in community-level disaster risk mapping processes"
        ).concat(
          p("% of household heads aware of housing insurance schemes or government disaster relief entitlements")
        ),
        "Safe housing in risk-prone environments"
      ),
    ],
    "Composite housing scores reflect tenure, affordability, habitability, and resilience."
  ),
  domain(
    "economic-inclusion",
    "Economic Inclusion",
    "Economy",
    "Access to livelihoods, financial services, and economic agency in Bhutan's emerging urban economy.",
    "briefcase",
    "#f59e0b",
    [
      subdomain(
        "labor-market-participation",
        "Labor Market Participation",
        q(
          "Gender wage gap in urban formal and informal sectors",
          "% of women in urban workforce in managerial/decision-making roles",
          "% of urban women engaged in informal economy with access to social protection/ privileges",
          "Prevalence of unpaid care work hours per day for women vs men in urban households (Time-use survey)"
        ),
        "Jobs, wages, and economic agency"
      ),
      subdomain(
        "entrepreneurship-and-financial-access",
        "Entrepreneurship and Financial Access",
        q(
          "% of urban small businesses owned by women with access to formal credit",
          "Gender-disaggregated uptake of government enterprise support schemes",
          "Number of women-led cooperatives in urban commercial zones",
          "Gender disaggregated Digital financial literacy and mobile banking usage rates"
        ),
        "Business, credit, and digital finance"
      ),
      subdomain(
        "childcare-and-care-infrastructure",
        "Childcare and Care Infrastructure",
        q(
          "Coverage of subsidised or community childcare centres per 1,000 working-age women (need to define working age)",
          "% of workplaces with lactation facilities and flexible working provisions"
        ).concat(
          ql("% of workplaces with changing room facilities for women")
        ),
        "Services that enable women's paid work"
      ),
      subdomain(
        "sexual-and-reproductive-health",
        "Sexual and Reproductive Health",
        q("% of households with access to functional primary health centre within 30 minutes"),
        "A small bridge indicator linking economic access and health access"
      ),
    ],
    "Economic inclusion combines work, entrepreneurship, care infrastructure, and access to services."
  ),
  domain(
    "health-wash",
    "Water, Sanitation, and Hygiene (WASH)",
    "WASH",
    "Equitable access to gender-responsive health, WASH, and social services in Bhutan's mountain urban centres.",
    "heart",
    "#06b6d4",
    [
      subdomain(
        "sexual-and-reproductive-health",
        "Sexual and Reproductive Health",
        q(
          "Gender disaggregated mortality ratio of the urban area",
          "Availability and use of menstrual health products in public spaces and workplaces"
        ),
        "Health access and dignity"
      ),
      subdomain(
        "mental-health-and-wellbeing",
        "Mental Health and Wellbeing",
        q(
          "Prevalence of depression and anxiety among urban residents, disaggregated by gender and age",
          "Number of trained mental health counsellors accessible per 1000 population"
        ).concat(
          p("Level of satisfaction with mental health services (GNH-aligned wellbeing index)"),
          ql("Integration of mental health support in GBV and disaster recovery services")
        ),
        "Wellbeing and support systems"
      ),
      subdomain(
        "wash-access",
        "WASH Access",
        q(
          "% of public toilets with equitable Gender-specific, clean, and safe facilities (Note: women need more toilet space compared to men)",
          "% of public toilets with elderly and disabled-specific, clean, and safe facilities",
          "% of urban schools with gender-separated functional toilets",
          "% of households with access to 24/7 potable water supply",
          "% of public toilets meeting the minimum requirements as per the Sanitation and Hygiene Guideline, MoIT",
          "% of households with access (within 15 mins?? drive) to solid waste collection centres",
          "% of households with access to at least twice a week door-door solid waste collection"
        ),
        "WASH services and sanitation reliability"
      ),
    ],
    "Health scoring combines care access, wellbeing, and WASH service quality."
  ),
  domain(
    "governance-participation",
    "Governance and Participation",
    "Governance",
    "Women's meaningful participation in urban planning, local governance, and decision-making processes.",
    "users",
    "#14b8a6",
    [
      subdomain(
        "political-representation",
        "Political Representation",
        q(
          "Voter participation in Local Government (Thromde) elections",
          "% of Thromde (municipal) council seats held by women",
          "% of women in urban planning committees",
          "Number of women serving in senior roles in urban administration (Chief and above)"
        ).concat(p("Women's perception of being heard in local government processes")),
        "Women in elected and appointed roles"
      ),
      subdomain(
        "participatory-planning",
        "Participatory Planning",
        q(
          "% of urban master plans developed with gender-disaggregated participatory consultations",
          "Women's participation rate in local area planning meetings"
        ).concat(
          ql("Existence of gender-responsive budgeting in Throm/ Thromde budgets"),
          ql("% of urban infrastructure projects with safety audits conducted")
        ),
        "Planning with women's input"
      ),
      subdomain(
        "data-and-monitoring-systems",
        "Data and Monitoring Systems",
        q(
          "% of urban indicators in national/local databases disaggregated by sex",
          "Frequency of gender-disaggregated urban living conditions surveys (compliance with Bhutan Building Code)"
        ).concat(
          ql("Existence of a dedicated gender and urban data repository accessible to planners")
        ),
        "Data systems for evidence-based planning"
      ),
      subdomain(
        "grievance-redress-mechanisms-grm",
        "Grievance Redress Mechanisms (GRM)",
        q(
          "Functional grievance redress mechanism in place",
          "Turnaround time to address grievances (Grievance submission date, type, days before grievance is addressed)"
        ),
        "Mechanisms that close the accountability loop"
      ),
    ],
    "Governance scoring rewards participation, data systems, and grievance responsiveness."
  ),
  domain(
    "environment-climate-resilience",
    "Environment and Climate Resilience",
    "Climate",
    "Women's agency in climate adaptation, disaster risk reduction, and sustainable resource management in Bhutan's fragile mountain ecosystem.",
    "leaf",
    "#84cc16",
    [
      subdomain(
        "urban-environment",
        "Urban Environment",
        q(
          "Ambient Air quality within permissible limits (as per NEC's Environmental standards 2020)",
          "Ambient noise levels within permissible levels for mixed areas (as per NEC's Environmental standards 2020)",
          "Ambient Water Quality meet the prescribed standard for mixed areas (as per NEC's Environmental standards 2020)",
          "% of urban area under forest, and designated parks and recreational areas",
          "% of urban open space used for kitchen garden"
        ),
        "Environmental quality and green cover"
      ),
      subdomain(
        "disaster-and-climate-resilience",
        "Disaster and climate resilience",
        q(
          "Number of designated evacuation centers per neighborhood",
          "% of urban residents reached by early warning systems for GLOF, landslides, and earthquakes",
          "% of residents trained in first response and community disaster management teams",
          "Gender-disaggregated mortality and displacement in urban disaster events"
        ).concat(
          ql("Women's leadership roles in community disaster management committees"),
          q(
            "Community-level disaster preparedness drills conducted annually",
            "Share of neighbourhoods with accessible emergency shelter plans",
            "Percentage of households with emergency response kits",
            "Coverage of climate-risk mapping updates in the last 12 months"
          )
        ),
        "Disaster preparedness and leadership"
      ),
      subdomain(
        "climate-adaptation-and-livelihood",
        "Climate Adaptation and Livelihood",
        q(
          "% of household beneficiaries of climate adaptation livelihood support programmes"
        ).concat(
          ql("Access to climate finance and green business opportunities for entrepreneurs")
        ),
        "Adaptation support and green livelihoods"
      ),
      subdomain(
        "green-and-blue-urban-infrastructure",
        "Green and Blue Urban Infrastructure",
        q(
          "% of land area under built and open spaces",
          "% of urban green spaces (parks and natural green areas) within 500m of households."
        ).concat(
          p("Gender disaggregated use of and satisfaction with public parks and natural spaces")
        ),
        "Nature-based infrastructure and public spaces"
      ),
    ],
    "This domain combines environmental quality, climate risk, and adaptation capacity."
  ),
  domain(
    "culture-identity",
    "Culture and Identity",
    "Culture",
    "Integration of Bhutan's GNH values, Buddhist traditions, and indigenous knowledge with gender equity in urban life.",
    "sparkles",
    "#ec4899",
    [
      subdomain(
        "gnh-and-gender-equity-alignment",
        "GNH and Gender Equity Alignment",
        q(
          "Subjective wellbeing scores (GNH survey) by gender",
          "% of urban cultural programmes that promote gender-equitable narratives"
        ).concat(
          p("Level of community acceptance of women in public leadership (attitudinal survey)")
        ),
        "GNH-aligned social progress"
      ),
      subdomain(
        "culture-and-tradition",
        "Culture and Tradition",
        q(
          "% of urban heritage and cultural preservation initiatives"
        ).concat(
          ql("Updated list of protected heritage sites in the urban centre"),
          q("Number of religious and cultural programs held"),
          q("Number of recreational and entertainment centers per 1000 residents")
        ),
        "Heritage, traditions, and public life"
      ),
      subdomain(
        "social-norms-and-gender-attitudes",
        "Social Norms and Gender Attitudes",
        q("% of urban schools incorporating gender equality programmes"),
        "Norms and education"
      ),
    ],
    "Cultural scoring tracks wellbeing, heritage, and attitudes that shape inclusion."
  ),
];
