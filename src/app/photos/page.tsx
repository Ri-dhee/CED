import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photos",
  description: "A visual journey through CED's field research, community engagement, conservation initiatives, and events.",
};

const photos = [
  { alt: "Field Research — Forest Ecosystem Assessment", category: "Field Work" },
  { alt: "Community Engagement Workshop", category: "Community" },
  { alt: "Coastal Ecosystem Restoration", category: "Conservation" },
  { alt: "Urban Sustainability Planning", category: "Planning" },
  { alt: "Climate Resilience Conference", category: "Events" },
  { alt: "CED Team at Project Site", category: "Team" },
  { alt: "Mangrove Reforestation Initiative", category: "Conservation" },
  { alt: "Government Stakeholder Meeting", category: "Events" },
  { alt: "Renewable Energy Assessment", category: "Field Work" },
];

export default function Photos() {
  return (
    <div>
      <section aria-label="Header" className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Work in <span className="text-primary">Pictures</span>
          </h1>
          <p className="text-gray-600">A visual journey through our projects and impact.</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, i) => (
              <figure key={i} className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] flex items-center justify-center border border-gray-200">
                <figcaption className="p-4 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{photo.category}</span>
                  <p className="text-sm text-gray-600 mt-1">{photo.alt}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}