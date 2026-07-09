import Link from "next/link";

const services = [
  {
    title: "Environmental Impact Assessment",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Sustainable Development Planning",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: "Policy Advisory",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Climate Risk Assessment",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Biodiversity Conservation",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Capacity Building",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "15+", label: "Years of Excellence" },
  { value: "30+", label: "Expert Consultants" },
  { value: "12", label: "Countries Served" },
];

export default function Home() {
  return (
    <div>
      <section aria-label="Hero" className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent top-20 -left-20 pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent bottom-20 -right-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium mb-6 border border-primary/10">
                <span className="w-2 h-2 bg-primary rounded-full mr-2" />
                Trusted by leading organizations worldwide
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                Sustainable Solutions for{" "}
                <span className="text-primary">Environment & Development</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
                CED is a premier private consultation firm bridging the gap
                between environmental sustainability and developmental growth
                through expert guidance and innovative strategies.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/experience" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105">
                  Explore Our Work
                </Link>
                <Link href="/about" className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all">
                  About Us
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 rounded-[40px]" />
                <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-primary to-primary-light rounded-[24px] shadow-2xl shadow-primary/20" />
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-accent to-accent-light rounded-[24px] shadow-2xl shadow-accent/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-emerald-50 to-white rounded-[32px] shadow-2xl border border-white/50 flex items-center justify-center backdrop-blur">
                  <span className="text-6xl font-bold text-primary/30">CED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="About summary" className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Shaping a <span className="text-primary">Sustainable Tomorrow</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            CED empowers organizations, governments, and communities with
            expert environmental consultation that drives sustainable
            development, protects natural ecosystems, and creates lasting
            value for future generations.
          </p>
        </div>
      </section>

      <section aria-label="Impact numbers" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Services" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Our <span className="text-primary">Services</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.title} className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-primary/20 transition-all hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center text-primary mb-5 group-hover:from-primary group-hover:to-primary-light group-hover:text-white transition-all">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Call to action" className="py-20 sm:py-28 bg-gradient-to-br from-primary-deeper via-primary-dark to-primary-deeper text-white relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-white/5 -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-white/5 -bottom-10 -left-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Make a <span className="text-accent">Difference</span>?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Contact us to discuss how CED can support your environmental and development goals.
          </p>
          <a
            href="mailto:contact@ced-consult.com"
            className="inline-flex px-8 py-4 bg-white text-primary-dark font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            contact@ced-consult.com
          </a>
        </div>
      </section>
    </div>
  );
}
