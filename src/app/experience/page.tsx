interface Project {
  title: string;
  client: string;
  period: string;
  description: string;
  tags: string[];
}

const projects: Project[] = [
  {
    title: "GRME Index Implementation — Bhutan",
    client: "Royal Government of Bhutan",
    period: "2024 - Present",
    description: "Deploying the gender-responsive urban assessment framework across Thimphu, Phuntsholing, Gelephu, and Paro. Field assessments and capacity building with municipal authorities.",
    tags: ["Gender Equity", "Urban Planning"],
  },
  {
    title: "National Climate Resilience Program",
    client: "Ministry of Environment & UNDP",
    period: "2023 - Present",
    description: "Climate risk assessment and adaptation strategies for 12 districts. Integrating early warning systems with community-based disaster preparedness.",
    tags: ["Climate", "DRR", "Community"],
  },
  {
    title: "South Asia Urban Sustainability Initiative",
    client: "Asian Development Bank",
    period: "2024 - Present",
    description: "Green infrastructure investment planning across 5 South Asian cities. Gender-responsive design and climate-adapted urban development.",
    tags: ["Urban Planning", "Infrastructure", "Finance"],
  },
  {
    title: "Digital EIA Platform",
    client: "National Regulatory Agency",
    period: "2024 - Present",
    description: "Building a digital platform for environmental impact assessment tracking, public disclosure, and regulatory compliance monitoring.",
    tags: ["Technology", "EIA"],
  },
  {
    title: "Urban Sustainability Program",
    client: "City Development Authority",
    period: "2021 - 2023",
    description: "Large-scale urban sustainability initiative: green infrastructure, waste management optimization, and renewable energy integration for metropolitan areas.",
    tags: ["Urban Planning", "Infrastructure", "Energy"],
  },
  {
    title: "Coastal Ecosystem Restoration",
    client: "International Conservation Fund",
    period: "2019 - 2021",
    description: "Multi-stakeholder coastal restoration across 500+ hectares. Mangrove reforestation, biodiversity monitoring, and community-based conservation.",
    tags: ["Conservation", "Biodiversity", "Community"],
  },
  {
    title: "Climate Resilience Framework",
    client: "Regional Development Bank",
    period: "2017 - 2019",
    description: "Climate risk assessment models and resilience frameworks for infrastructure investments. Sustainable financing for climate-adaptive projects.",
    tags: ["Climate", "Finance", "Risk Assessment"],
  },
  {
    title: "Climate Resilience Framework",
    client: "NGO Partnership Network",
    period: "2015 - 2017",
    description: "Participatory development programs in rural communities: sustainable agriculture, water resource management, and livelihood diversification.",
    tags: ["Community", "Agriculture", "Water"],
  },
  {
    title: "Environmental Impact Assessment System",
    client: "National Regulatory Agency",
    period: "2012 - 2015",
    description: "Designed and deployed a digital EIA tracking and management system, streamlining approval processes while strengthening environmental safeguards.",
    tags: ["Technology", "Regulatory"],
  },
];

export default function Experience() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Our Work</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Experience & <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Active engagements and completed work across sectors.
          </p>
        </div>

        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{proj.title}</h3>
                  <p className="text-primary text-sm">{proj.client}</p>
                </div>
                <span className="shrink-0 px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full whitespace-nowrap">
                  {proj.period}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{proj.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {proj.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}