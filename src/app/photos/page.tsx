const photos = [
  {
    src: "/photos/placeholder-1.jpg",
    alt: "Team conducting field research in a forest ecosystem",
    caption: "Field Research — Forest Ecosystem Assessment",
    category: "Field Work",
  },
  {
    src: "/photos/placeholder-2.jpg",
    alt: "Community workshop on sustainable development",
    caption: "Community Engagement Workshop",
    category: "Community",
  },
  {
    src: "/photos/placeholder-3.jpg",
    alt: "Coastal restoration project aerial view",
    caption: "Coastal Ecosystem Restoration",
    category: "Conservation",
  },
  {
    src: "/photos/placeholder-4.jpg",
    alt: "Urban green infrastructure planning session",
    caption: "Urban Sustainability Planning",
    category: "Planning",
  },
  {
    src: "/photos/placeholder-5.jpg",
    alt: "Conference presentation on climate resilience",
    caption: "Climate Resilience Conference",
    category: "Events",
  },
  {
    src: "/photos/placeholder-6.jpg",
    alt: "Team photo at project site",
    caption: "CED Team at Project Site",
    category: "Team",
  },
  {
    src: "/photos/placeholder-7.jpg",
    alt: "Mangrove reforestation initiative",
    caption: "Mangrove Reforestation Initiative",
    category: "Conservation",
  },
  {
    src: "/photos/placeholder-8.jpg",
    alt: "Stakeholder meeting with government officials",
    caption: "Government Stakeholder Meeting",
    category: "Events",
  },
  {
    src: "/photos/placeholder-9.jpg",
    alt: "Renewable energy project assessment",
    caption: "Renewable Energy Assessment",
    category: "Field Work",
  },
];

const categories = ["All", ...Array.from(new Set(photos.map((p) => p.category)))];

export default function Photos() {
  return (
    <div>
      <section aria-label="Photos header" className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-0 left-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Gallery</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              Our Work in <span className="gradient-text">Pictures</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              A visual journey through our projects, team, and the impact we
              create around the world.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Photo gallery" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {photos.map((photo, index) => (
              <figure
                key={index}
                className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] shadow-sm border border-gray-100 cursor-pointer"
              >
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10" />
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur text-gray-700 text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.category}
                  </span>
                </div>
                <figcaption className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <p className="text-white font-medium text-sm">{photo.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
