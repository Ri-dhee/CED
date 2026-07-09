const experts = [
  {
    name: "Dr. Sarah Mitchell",
    title: "Chief Environmental Strategist",
    expertise: ["Environmental Policy", "Climate Adaptation", "Strategic Planning"],
    bio: "Former Minister of Environment with over 25 years of experience in national environmental strategy development and international climate negotiations.",
  },
  {
    name: "Prof. James Okonkwo",
    title: "Lead Urban Development Advisor",
    expertise: ["Urban Planning", "Sustainable Infrastructure", "Community Development"],
    bio: "Professor of Urban Planning with extensive experience designing sustainable city frameworks across Africa and Asia, specializing in gender-inclusive urban design.",
  },
  {
    name: "Elena Vasquez",
    title: "Senior Climate Finance Specialist",
    expertise: ["Climate Finance", "Risk Assessment", "Green Bonds"],
    bio: "Expert in mobilizing climate finance for developing nations, having facilitated over $500M in green investments across 20+ countries.",
  },
  {
    name: "Dr. Rajesh Patel",
    title: "Biodiversity & Conservation Lead",
    expertise: ["Biodiversity", "Ecosystem Restoration", "Conservation Planning"],
    bio: "Conservation biologist with 20 years of field experience in biodiversity assessment, protected area management, and community-based conservation.",
  },
  {
    name: "Dr. Aisha Benali",
    title: "Gender & Social Inclusion Advisor",
    expertise: ["Gender Equity", "Social Inclusion", "GRME Framework"],
    bio: "Leading expert on gender-responsive urban development, architect of the GRME framework for gender-inclusive city planning in South Asia.",
  },
  {
    name: "Dr. Kenji Tanaka",
    title: "Climate Resilience Specialist",
    expertise: ["Climate Modeling", "DRR", "Early Warning Systems"],
    bio: "Climate scientist specializing in disaster risk reduction and climate adaptation for mountain ecosystems and vulnerable urban populations.",
  },
  {
    name: "Maria Santos",
    title: "Water Resources & WASH Expert",
    expertise: ["Water Management", "WASH", "Sanitation"],
    bio: "Water resources engineer with extensive experience in gender-responsive WASH programs and integrated water resource management in urban settings.",
  },
  {
    name: "Dr. Peter Chen",
    title: "Digital Solutions & EIA Specialist",
    expertise: ["Digital Transformation", "EIA Systems", "Data Analytics"],
    bio: "Technology expert who designed and deployed national-scale digital EIA tracking systems, bringing transparency and efficiency to environmental assessments.",
  },
  {
    name: "Dr. Fatima Al-Rashid",
    title: "Renewable Energy & Energy Access Advisor",
    expertise: ["Renewable Energy", "Energy Policy", "Green Technology"],
    bio: "Energy specialist focused on renewable energy integration and sustainable energy access for underserved communities in developing regions.",
  },
];

export default function Experts() {
  return (
    <div>
      <section aria-label="Experts header" className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-0 left-0" />
        <div className="hero-glow bottom-0 right-0" style={{ animationDelay: "-3s" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Our Team</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              Consortium of <span className="gradient-text">Experts</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Our multidisciplinary team brings together world-class expertise
              across environmental science, urban planning, policy, finance, and
              social development.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Expert profiles" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {experts.map((expert, i) => (
              <article
                key={i}
                className="group bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all hover:-translate-y-0.5 card-shine"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-primary group-hover:to-primary-light transition-all">
                  <span className="text-primary font-bold text-lg group-hover:text-white transition-colors">
                    {expert.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{expert.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{expert.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{expert.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {expert.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
