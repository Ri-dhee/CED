import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "CED is a premier private consultation firm specializing in environmental management, sustainable development, and policy advisory across Asia and beyond.",
};

const values = [
  {
    title: "Environmental Stewardship",
    description: "Protecting and restoring natural ecosystems as the foundation of sustainable development.",
  },
  {
    title: "Evidence-Based Approach",
    description: "Every recommendation grounded in rigorous research, data analysis, and scientific methodology.",
  },
  {
    title: "Inclusive Development",
    description: "Solutions that benefit all members of society, with attention to gender equity and marginalized communities.",
  },
  {
    title: "Local Context, Global Standards",
    description: "International best practices combined with deep understanding of local cultural, ecological, and social contexts.",
  },
  {
    title: "Long-Term Partnership",
    description: "Enduring relationships with clients, staying engaged beyond project delivery to ensure lasting impact.",
  },
  {
    title: "Innovation & Adaptability",
    description: "Continuously evolving methodologies to address emerging environmental challenges and technological opportunities.",
  },
];

const timeline = [
  { year: "2024", title: "GRME Framework Launch", description: "Published the Gender Responsive Urban Centers framework for Bhutan across 8 domains." },
  { year: "2022", title: "Regional Expansion", description: "Extended operations across South Asia with governments and development organizations." },
  { year: "2020", title: "Climate Finance Advisory", description: "Launched climate finance advisory, securing funding for adaptation and mitigation projects." },
  { year: "2018", title: "Digital Transformation", description: "Developed digital EIA tracking systems and data-driven sustainability platforms." },
  { year: "2015", title: "Policy Advisory Practice", description: "Established policy advisory division for evidence-based environmental recommendations." },
  { year: "2012", title: "Foundation of CED", description: "Founded to bridge environmental sustainability with developmental growth." },
];

export default function About() {
  return (
    <div>
      <section aria-label="About header" className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent top-0 -right-20 pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent bottom-0 -left-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Who We Are</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              About <span className="text-primary">CED</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              We help governments and organizations turn environmental challenges into sustainable outcomes.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Mission and Vision" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 sm:p-10 border border-emerald-100/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                CED empowers organizations, governments, and communities with expert environmental consultation that drives sustainable development, protects natural ecosystems, and creates lasting value for future generations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent-light to-white rounded-2xl p-6 sm:p-10 border border-accent/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A world where every development project enhances rather than diminishes our natural environment — where economic growth and ecological health advance hand in hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Core values" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Principles</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 sm:mt-4">
              Our Core <span className="text-primary">Values</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Timeline" className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Journey</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 sm:mt-4">
              Our <span className="text-primary">Timeline</span>
            </h2>
          </div>
          <div className="space-y-6">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-8 sm:pl-10">
                <div className="absolute left-0 top-1 w-3 h-3 bg-primary rounded-full border-2 border-white shadow" />
                {i < timeline.length - 1 && (
                  <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-primary/20" />
                )}
                <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.year}</span>
                  <h3 className="font-bold text-gray-900 mt-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
