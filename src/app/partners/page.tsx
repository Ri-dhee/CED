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

const categoryIcons: Record<string, React.ReactNode> = {
  "International Organization": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  NGO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  Government: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  "Financial Institution": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  "Research Organization": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
};

export default function Partners() {
  return (
    <div>
      <section aria-label="Partners header" className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Our Network</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              Trusted by <span className="gradient-text">Global Leaders</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
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
          <section key={category} aria-label={category} className={`py-12 sm:py-20 ${ci % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-6 sm:mb-10">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary" aria-hidden="true">
                  {categoryIcons[category]}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category}</h2>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-primary-light rounded-full mt-2" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((partner, index) => (
                  <article
                    key={index}
                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all hover:-translate-y-0.5 card-shine"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:from-primary group-hover:to-primary-light group-hover:text-white transition-all">
                      {categoryIcons[category]}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {partner.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {partner.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
