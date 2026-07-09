const partners = [
  { name: "Global Environment Facility", category: "International Organization" },
  { name: "United Nations Development Programme", category: "International Organization" },
  { name: "World Wildlife Fund", category: "NGO" },
  { name: "Ministry of Environment", category: "Government" },
  { name: "Green Climate Fund", category: "Financial Institution" },
  { name: "International Institute for Sustainable Development", category: "Research Organization" },
  { name: "EcoPeace Foundation", category: "NGO" },
  { name: "Asian Development Bank", category: "Financial Institution" },
  { name: "Conservation International", category: "NGO" },
];

const categories = ["International Organization", "NGO", "Government", "Financial Institution", "Research Organization"];

export default function Partners() {
  return (
    <div>
      <section aria-label="Header" className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((partner, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-bold text-gray-900">{partner.name}</h3>
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