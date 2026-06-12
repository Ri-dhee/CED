const photos = [
  {
    src: "/photos/placeholder-1.jpg",
    alt: "Team conducting field research in a forest ecosystem",
    caption: "Field Research - Forest Ecosystem Assessment",
  },
  {
    src: "/photos/placeholder-2.jpg",
    alt: "Community workshop on sustainable development",
    caption: "Community Engagement Workshop",
  },
  {
    src: "/photos/placeholder-3.jpg",
    alt: "Coastal restoration project aerial view",
    caption: "Coastal Ecosystem Restoration Project",
  },
  {
    src: "/photos/placeholder-4.jpg",
    alt: "Urban green infrastructure planning session",
    caption: "Urban Sustainability Planning",
  },
  {
    src: "/photos/placeholder-5.jpg",
    alt: "Conference presentation on climate resilience",
    caption: "Climate Resilience Conference",
  },
  {
    src: "/photos/placeholder-6.jpg",
    alt: "Team photo at project site",
    caption: "CED Team at Project Site",
  },
  {
    src: "/photos/placeholder-7.jpg",
    alt: "Mangrove reforestation initiative",
    caption: "Mangrove Reforestation Initiative",
  },
  {
    src: "/photos/placeholder-8.jpg",
    alt: "Stakeholder meeting with government officials",
    caption: "Government Stakeholder Meeting",
  },
  {
    src: "/photos/placeholder-9.jpg",
    alt: "Renewable energy project assessment",
    caption: "Renewable Energy Assessment",
  },
];

export default function Photos() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Photos</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            A glimpse into our projects, team, and impact around the world.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-sm border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform z-20">
                  <p className="text-sm font-medium">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
