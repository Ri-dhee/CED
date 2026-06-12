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

export default function Partners() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Partners</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            We collaborate with leading organizations worldwide to deliver
            impactful environmental and development solutions.
          </p>
        </div>
      </section>

      {categories.map((category) => {
        const filtered = partners.filter((p) => p.category === category);
        if (filtered.length === 0) return null;
        return (
          <section
            key={category}
            className="py-16 even:bg-gray-50 odd:bg-white"
          >
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((partner, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-accent transition-all"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {partner.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
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
