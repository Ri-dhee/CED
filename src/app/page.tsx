import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Sustainable Solutions for
              <span className="text-accent"> Environment & Development</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
              CED is a private consultation firm dedicated to bridging the gap
              between environmental sustainability and developmental growth. We
              provide expert guidance, strategic planning, and innovative
              solutions for a better tomorrow.
            </p>
            <div className="flex gap-4">
              <Link
                href="/experience"
                className="inline-flex items-center px-6 py-3 bg-accent text-primary-dark font-semibold rounded-lg hover:bg-white transition-colors"
              >
                Our Experience
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Our Partners
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Company Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">
                Who We Are
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Center for Environment & Development (CED) is a premier
                private consultation firm specializing in environmental
                management, sustainable development, and policy advisory. With
                years of collective expertise, we empower organizations,
                governments, and communities to achieve their environmental and
                developmental goals.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our team comprises seasoned environmental scientists, policy
                analysts, urban planners, and development specialists who bring
                a multidisciplinary approach to every project.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe in evidence-based solutions, stakeholder engagement,
                and long-term sustainability — ensuring that development today
                does not compromise the opportunities of tomorrow.
              </p>
            </div>
            <div className="bg-accent-light rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    50+
                  </div>
                  <div className="text-sm text-gray-600">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    15+
                  </div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    30+
                  </div>
                  <div className="text-sm text-gray-600">Expert Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    20+
                  </div>
                  <div className="text-sm text-gray-600">Partner Organizations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Environmental Impact Assessment
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Comprehensive EIA services for projects of all scales, ensuring
                regulatory compliance and environmental protection.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sustainable Development Planning
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Strategic planning for urban and rural development projects that
                balance growth with environmental stewardship.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Policy Advisory
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Evidence-based policy recommendations for governments and
                organizations on environmental regulations and sustainability
                frameworks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Let&apos;s discuss how CED can help you achieve your environmental
            and development goals.
          </p>
          <Link
            href="/partners"
            className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
