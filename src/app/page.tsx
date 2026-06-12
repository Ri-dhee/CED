import Link from "next/link";

const services = [
  {
    title: "Environmental Impact Assessment",
    description:
      "Comprehensive EIA services ensuring regulatory compliance and environmental protection for projects of every scale.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Sustainable Development Planning",
    description:
      "Strategic urban and rural development planning that balances economic growth with environmental stewardship.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: "Policy Advisory",
    description:
      "Evidence-based policy recommendations for governments and organizations on environmental regulations and sustainability frameworks.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Climate Risk Assessment",
    description:
      "Advanced climate modeling and risk analysis to help organizations prepare for and adapt to climate change impacts.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Biodiversity Conservation",
    description:
      "Ecosystem assessment and conservation strategy development for protecting biodiversity in development projects.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Capacity Building",
    description:
      "Training programs and workshops to empower communities and organizations with the skills needed for sustainable development.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote:
      "CED's expertise was instrumental in shaping our national environmental strategy. Their team brought unparalleled insight and dedication.",
    author: "Dr. Sarah Mitchell",
    role: "Minister of Environment",
  },
  {
    quote:
      "The sustainability framework CED developed for our city has become a model for urban development across the region.",
    author: "James Okonkwo",
    role: "City Development Authority",
  },
  {
    quote:
      "Working with CED transformed our approach to conservation. Their evidence-based methodology delivered measurable results.",
    author: "Elena Vasquez",
    role: "International Conservation Fund",
  },
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "15+", label: "Years of Excellence" },
  { value: "30+", label: "Expert Consultants" },
  { value: "25+", label: "Global Partners" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "12", label: "Countries Served" },
];

export default function Home() {
  return (
    <div>
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="hero-glow top-20 -left-20" />
        <div className="hero-glow bottom-20 -right-20" style={{ animationDelay: "-3s" }} />
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium mb-8 border border-primary/10 animate-fade-in-up">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                Trusted by leading organizations worldwide
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6 animate-fade-in-up">
                Sustainable Solutions for{" "}
                <span className="gradient-text">Environment & Development</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl animate-fade-in-up-delay-1">
                CED is a premier private consultation firm bridging the gap
                between environmental sustainability and developmental growth
                through expert guidance and innovative strategies.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up-delay-2">
                <Link
                  href="/experience"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
                >
                  Explore Our Work
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/partners"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  Our Partners
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 rounded-[40px] animate-float" />
                <div className="absolute top-10 right-10 w-48 h-48 bg-gradient-to-br from-primary to-primary-light rounded-[24px] shadow-2xl shadow-primary/20" />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-accent to-accent-light rounded-[24px] shadow-2xl shadow-accent/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-50 to-white rounded-[32px] shadow-2xl border border-white/50 flex items-center justify-center backdrop-blur">
                  <div className="text-center">
                    <div className="text-6xl font-bold gradient-text">15+</div>
                    <div className="text-sm text-gray-500 mt-2">Years of Impact</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">About Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Shaping a <span className="gradient-text">Sustainable Tomorrow</span>
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
              At CED, we believe that environmental stewardship and developmental
              progress are not opposing forces — they are partners in building a
              resilient future.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-10 border border-emerald-100/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To empower organizations, governments, and communities with
                expert environmental consultation that drives sustainable
                development, protects natural ecosystems, and creates lasting
                value for future generations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent-light to-white rounded-2xl p-10 border border-accent/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where every development project enhances rather than
                diminishes our natural environment — where economic growth and
                ecological health advance hand in hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="hero-glow top-0 right-0" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">By the Numbers</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
              Our Impact in <span className="gradient-text">Numbers</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all group">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">What We Do</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              End-to-end environmental consultation tailored to your unique challenges and goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center text-primary mb-5 group-hover:from-primary group-hover:to-primary-light group-hover:text-white transition-all">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-primary-deeper via-primary-dark to-primary-deeper text-white relative overflow-hidden">
        <div className="hero-glow top-10 left-10 opacity-30" />
        <div className="hero-glow bottom-10 right-10 opacity-30" style={{ animationDelay: "-4s" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              What Our <span className="text-accent">Clients Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                <svg className="w-8 h-8 text-accent/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-white/80 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white">{t.author}</div>
                  <div className="text-sm text-white/50">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Let&apos;s Collaborate</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
            Ready to Make a <span className="gradient-text">Difference</span>?
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
            Partner with CED to transform your environmental challenges into
            opportunities for sustainable growth.
          </p>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@ced-consult.com&subject=CED%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Us an Email
          </a>
        </div>
      </section>
    </div>
  );
}
