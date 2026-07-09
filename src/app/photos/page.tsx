import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photos",
  description: "A visual journey through CED's field research, community engagement, conservation initiatives, and events.",
};

const photos = [
  { src: "/photos/placeholder-1.jpg", alt: "Team conducting field research in a forest ecosystem", caption: "Field Research — Forest Ecosystem Assessment", category: "Field Work" },
  { src: "/photos/placeholder-2.jpg", alt: "Community workshop on sustainable development", caption: "Community Engagement Workshop", category: "Community" },
  { src: "/photos/placeholder-3.jpg", alt: "Coastal restoration project aerial view", caption: "Coastal Ecosystem Restoration", category: "Conservation" },
  { src: "/photos/placeholder-4.jpg", alt: "Urban green infrastructure planning session", caption: "Urban Sustainability Planning", category: "Planning" },
  { src: "/photos/placeholder-5.jpg", alt: "Conference presentation on climate resilience", caption: "Climate Resilience Conference", category: "Events" },
  { src: "/photos/placeholder-6.jpg", alt: "Team photo at project site", caption: "CED Team at Project Site", category: "Team" },
  { src: "/photos/placeholder-7.jpg", alt: "Mangrove reforestation initiative", caption: "Mangrove Reforestation Initiative", category: "Conservation" },
  { src: "/photos/placeholder-8.jpg", alt: "Stakeholder meeting with government officials", caption: "Government Stakeholder Meeting", category: "Events" },
  { src: "/photos/placeholder-9.jpg", alt: "Renewable energy project assessment", caption: "Renewable Energy Assessment", category: "Field Work" },
];

const categories = ["Field Work", "Community", "Conservation", "Planning", "Events", "Team"];

export default function Photos() {
  return (
    <div>
      <section aria-label="Header" className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-center overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent -top-20 left-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Work in <span className="text-primary">Pictures</span>
          </h1>
          <p className="text-gray-600">A visual journey through our projects and impact.</p>
        </div>
      </section>

      {categories.map((category, ci) => {
        const filtered = photos.filter((p) => p.category === category);
        if (filtered.length === 0) return null;
        return (
          <section key={category} className={`py-12 sm:py-20 ${ci % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((photo, i) => (
                  <figure key={i} className="group rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all">
                    <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center p-6">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{photo.category}</span>
                      </div>
                    </div>
                    <figcaption className="p-4">
                      <p className="text-sm text-gray-600">{photo.caption}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
