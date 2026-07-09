import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners",
  description: "CED's network of partners including international organizations, government agencies, NGOs, and financial institutions advancing sustainable development.",
};

const partners = [
  { name: "Global Environment Facility", category: "International Organization", description: "Collaborating on climate resilience and biodiversity conservation projects worldwide." },
  { name: "United Nations Development Programme", category: "International Organization", description: "Partnering on sustainable development goals implementation and capacity building programs." },
  { name: "World Wildlife Fund", category: "NGO", description: "Joint initiatives in ecosystem conservation, species protection, and sustainable resource management." },
  { name: "Ministry of Environment", category: "Government", description: "Strategic advisory and policy development for national environmental regulations." },
  { name: "Green Climate Fund", category: "Financial Institution", description: "Facilitating climate finance for adaptation and mitigation projects in developing regions." },
  { name: "International Institute for Sustainable Development", category: "Research Organization", description: "Research collaboration on sustainable development metrics, policy analysis, and best practices." },
  { name: "EcoPeace Foundation", category: "NGO", description: "Community-based environmental education and grassroots conservation programs." },
  { name: "Asian Development Bank", category: "Financial Institution", description: "Advisory services for green infrastructure investments and sustainable urban development." },
  { name: "Conservation International", category: "NGO", description: "Biodiversity hotspot protection and natural capital accounting projects." },
];

const categories = ["International Organization", "NGO", "Government", "Financial Institution", "Research Organization"];

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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
};

export default function Partners() {
  return (
    <div>
      <section aria-label="Header" className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-center overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent -top-20 left-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Trusted by <span className="text-primary">Global Leaders</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We collaborate with leading organizations worldwide to deliver impactful environmental solutions.
          </p>
        </div>
      </section>

      {categories.map((category, ci) => {
        const filtered = partners.filter((p) => p.category === category);
        if (filtered.length === 0) return null;
        return (
          <section key={category} className={`py-12 sm:py-20 ${ci % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {categoryIcons[category]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((partner, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all">
                    <h3 className="font-bold text-gray-900 mb-2">{partner.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{partner.description}</p>
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
