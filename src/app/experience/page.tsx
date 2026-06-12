const experiences = [
  {
    year: "2023 - Present",
    title: "National Environmental Strategy",
    client: "Ministry of Environment",
    description:
      "Leading the development of a comprehensive national environmental strategy, including policy frameworks, implementation roadmaps, and stakeholder engagement programs across multiple sectors.",
    tags: ["Policy", "Strategy", "Government"],
  },
  {
    year: "2021 - 2023",
    title: "Urban Sustainability Program",
    client: "City Development Authority",
    description:
      "Designed and oversaw a large-scale urban sustainability initiative focusing on green infrastructure, waste management optimization, and renewable energy integration for metropolitan areas.",
    tags: ["Urban Planning", "Infrastructure", "Energy"],
  },
  {
    year: "2019 - 2021",
    title: "Coastal Ecosystem Restoration",
    client: "International Conservation Fund",
    description:
      "Managed a multi-stakeholder coastal restoration project, including mangrove reforestation, biodiversity monitoring, and community-based conservation programs spanning 500+ hectares.",
    tags: ["Conservation", "Biodiversity", "Community"],
  },
  {
    year: "2017 - 2019",
    title: "Climate Resilience Framework",
    client: "Regional Development Bank",
    description:
      "Developed climate risk assessment models and resilience frameworks for infrastructure investments, helping secure sustainable financing for climate-adaptive projects.",
    tags: ["Climate", "Finance", "Risk Assessment"],
  },
  {
    year: "2015 - 2017",
    title: "Community Development Initiative",
    client: "NGO Partnership Network",
    description:
      "Implemented participatory development programs in rural communities, focusing on sustainable agriculture, water resource management, and livelihood diversification.",
    tags: ["Community", "Agriculture", "Water"],
  },
  {
    year: "2012 - 2015",
    title: "Environmental Impact Assessment System",
    client: "National Regulatory Agency",
    description:
      "Designed and deployed a digital EIA tracking and management system, streamlining the approval process for development projects while strengthening environmental safeguards.",
    tags: ["Technology", "Regulatory", "Digital"],
  },
];

export default function Experience() {
  return (
    <div>
      <section aria-label="Experience header" className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-0 left-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Our Track Record</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              Decades of <span className="gradient-text">Proven Impact</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Over a decade of delivering impactful environmental and development
              solutions across the globe. Each project reflects our commitment to
              excellence and sustainability.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Project timeline" className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-8">
            {experiences.map((exp, i) => (
              <article
                key={i}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 hover:shadow-xl hover:border-primary/20 transition-all hover:-translate-y-0.5"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="md:w-48 shrink-0">
                    <span className="inline-flex px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/20 text-primary font-semibold rounded-lg text-sm">
                      {exp.year}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.title}
                      </h3>
                    </div>
                    <p className="text-primary font-medium text-sm mb-3">
                      {exp.client}
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {exp.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
