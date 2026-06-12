const partners = [
  {
    name: "Global Environment Facility",
    category: "International Organization",
    description:
      "Collaborating on climate resilience and biodiversity conservation projects worldwide.",
  },
  {
    name: "United Nations Development Programme",
    category: "International Organization",
    description:
      "Partnering on sustainable development goals implementation and capacity building programs.",
  },
  {
    name: "World Wildlife Fund",
    category: "NGO",
    description:
      "Joint initiatives in ecosystem conservation, species protection, and sustainable resource management.",
  },
  {
    name: "Ministry of Environment",
    category: "Government",
    description:
      "Strategic advisory and policy development for national environmental regulations.",
  },
  {
    name: "Green Climate Fund",
    category: "Financial Institution",
    description:
      "Facilitating climate finance for adaptation and mitigation projects in developing regions.",
  },
  {
    name: "International Institute for Sustainable Development",
    category: "Research Organization",
    description:
      "Research collaboration on sustainable development metrics, policy analysis, and best practices.",
  },
  {
    name: "EcoPeace Foundation",
    category: "NGO",
    description:
      "Community-based environmental education and grassroots conservation programs.",
  },
  {
    name: "Asian Development Bank",
    category: "Financial Institution",
    description:
      "Advisory services for green infrastructure investments and sustainable urban development.",
  },
  {
    name: "Conservation International",
    category: "NGO",
    description:
      "Biodiversity hotspot protection and natural capital accounting projects.",
  },
];

const categories = [
  "International Organization",
  "NGO",
  "Government",
  "Financial Institution",
  "Research Organization",
];

const categoryIcons: Record<string, string> = {
  "International Organization": "🌐",
  "NGO": "🤝",
  "Government": "🏛️",
  "Financial Institution": "🏦",
  "Research Organization": "🔬",
};

export default function Partners() {
  return (
    <div>
      <section className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Our Network</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              Trusted by <span className="gradient-text">Global Leaders</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
              We collaborate with leading organizations worldwide to deliver
              impactful environmental and development solutions that create
              lasting change.
            </p>
          </div>
        </div>
      </section>

      {categories.map((category, ci) => {
        const filtered = partners.filter((p) => p.category === category);
        if (filtered.length === 0) return null;
        return (
          <section key={category} className={`py-12 sm:py-20 ${ci % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-6 sm:mb-10">
                <span className="text-xl sm:text-2xl">{categoryIcons[category]}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category}</h2>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-primary-light rounded-full mt-2" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((partner, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all hover:-translate-y-0.5 card-shine"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-primary-light transition-all">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {categoryIcons[category]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {partner.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
