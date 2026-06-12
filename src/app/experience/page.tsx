const experiences = [
  {
    year: "2023 - Present",
    title: "National Environmental Strategy",
    client: "Ministry of Environment",
    description:
      "Leading the development of a comprehensive national environmental strategy, including policy frameworks, implementation roadmaps, and stakeholder engagement programs across multiple sectors.",
  },
  {
    year: "2021 - 2023",
    title: "Urban Sustainability Program",
    client: "City Development Authority",
    description:
      "Designed and oversaw a large-scale urban sustainability initiative focusing on green infrastructure, waste management optimization, and renewable energy integration for metropolitan areas.",
  },
  {
    year: "2019 - 2021",
    title: "Coastal Ecosystem Restoration",
    client: "International Conservation Fund",
    description:
      "Managed a multi-stakeholder coastal restoration project, including mangrove reforestation, biodiversity monitoring, and community-based conservation programs spanning 500+ hectares.",
  },
  {
    year: "2017 - 2019",
    title: "Climate Resilience Framework",
    client: "Regional Development Bank",
    description:
      "Developed climate risk assessment models and resilience frameworks for infrastructure investments, helping secure sustainable financing for climate-adaptive projects.",
  },
  {
    year: "2015 - 2017",
    title: "Community Development Initiative",
    client: "NGO Partnership Network",
    description:
      "Implemented participatory development programs in rural communities, focusing on sustainable agriculture, water resource management, and livelihood diversification.",
  },
  {
    year: "2012 - 2015",
    title: "Environmental Impact Assessment System",
    client: "National Regulatory Agency",
    description:
      "Designed and deployed a digital EIA tracking and management system, streamlining the approval process for development projects while strengthening environmental safeguards.",
  },
];

export default function Experience() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Experience</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Over a decade of delivering impactful environmental and development
            solutions across the globe.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-accent -translate-x-1/2" />
            {experiences.map((exp, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-8 mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden md:block w-1/2" />
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-accent -translate-x-1/2 mt-6 z-10" />
                <div className="w-full md:w-1/2 pl-10 md:pl-0">
                  <span className="text-sm font-semibold text-primary bg-accent-light px-3 py-1 rounded-full">
                    {exp.year}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mt-3 mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-sm font-medium text-primary mb-2">
                    {exp.client}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
