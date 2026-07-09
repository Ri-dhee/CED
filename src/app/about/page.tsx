import Link from "next/link";

const timeline = [
  {
    year: "2024",
    title: "GRME Framework Launch",
    description:
      "Published the Gender Responsive, Livable and Resilient Urban Centers framework for Bhutan, establishing a comprehensive assessment methodology across 8 domains.",
  },
  {
    year: "2022",
    title: "Regional Expansion",
    description:
      "Extended operations across South Asia, establishing partnerships with governments and development organizations for large-scale environmental programs.",
  },
  {
    year: "2020",
    title: "Climate Finance Advisory",
    description:
      "Launched dedicated climate finance advisory practice, helping secure funding for adaptation and mitigation projects in developing regions.",
  },
  {
    year: "2018",
    title: "Digital Transformation",
    description:
      "Developed digital EIA tracking systems and data-driven sustainability assessment platforms, revolutionizing how environmental impact is measured.",
  },
  {
    year: "2015",
    title: "Policy Advisory Practice",
    description:
      "Established policy advisory division, providing evidence-based recommendations to governments on environmental regulations and sustainability frameworks.",
  },
  {
    year: "2012",
    title: "Foundation of CED",
    description:
      "Founded with a mission to bridge the gap between environmental sustainability and developmental growth through expert consultation.",
  },
];

const values = [
  {
    title: "Environmental Stewardship",
    description:
      "We believe in protecting and restoring natural ecosystems as the foundation of sustainable development.",
  },
  {
    title: "Evidence-Based Approach",
    description:
      "Every recommendation is grounded in rigorous research, data analysis, and scientific methodology.",
  },
  {
    title: "Inclusive Development",
    description:
      "We ensure our solutions benefit all members of society, with particular attention to gender equity and marginalized communities.",
  },
  {
    title: "Local Context, Global Standards",
    description:
      "We combine international best practices with deep understanding of local cultural, ecological, and social contexts.",
  },
  {
    title: "Long-Term Partnership",
    description:
      "We build enduring relationships with clients, staying engaged beyond project delivery to ensure lasting impact.",
  },
  {
    title: "Innovation & Adaptability",
    description:
      "We continuously evolve our methodologies to address emerging environmental challenges and technological opportunities.",
  },
];

export default function About() {
  return (
    <div>
      <section aria-label="About header" className="relative pt-28 sm:pt-40 pb-16 sm:pb-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-0 -right-20" />
        <div className="hero-glow bottom-0 -left-20" style={{ animationDelay: "-3s" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Who We Are</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-3 sm:mt-4 mb-4 sm:mb-6">
              About <span className="gradient-text">CED</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Center for Environment & Development is a premier consultation firm
              dedicated to bridging environmental sustainability with developmental
              growth through expert guidance and innovative strategies.
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
                To empower organizations, governments, and communities with
                expert environmental consultation that drives sustainable
                development, protects natural ecosystems, and creates lasting
                value for future generations.
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
                A world where every development project enhances rather than
                diminishes our natural environment — where economic growth and
                ecological health advance hand in hand.
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
              Our Core <span className="gradient-text">Values</span>
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
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">History</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-3 sm:mt-4">
              Our <span className="gradient-text">Journey</span>
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-3 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary-light -translate-x-1/2 hidden sm:block" />
            {timeline.map((item, i) => (
              <div key={i} className={`relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8 mb-8 sm:mb-12 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                <div className="hidden sm:flex flex-1 justify-end">
                  {i % 2 === 0 && (
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm max-w-md">
                      <span className="text-primary font-bold text-sm">{item.year}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-primary border-4 border-white shadow shrink-0 relative z-10" />
                <div className="flex-1">
                  {i % 2 !== 0 && (
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm max-w-md">
                      <span className="text-primary font-bold text-sm">{item.year}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  )}
                </div>
                <div className="sm:hidden ml-8">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <span className="text-primary font-bold text-sm">{item.year}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Contact" className="py-16 sm:py-24 bg-gradient-to-br from-primary-deeper via-primary-dark to-primary-deeper text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Want to Learn <span className="text-accent">More</span>?
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-10">
            Get in touch to discuss how CED can support your environmental and
            development goals.
          </p>
          <Link
            href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@ced-consult.com&subject=CED%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 text-sm sm:text-base"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
