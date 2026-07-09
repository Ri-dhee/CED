import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section aria-label="Hero" className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Sustainable Solutions for <span className="text-primary">Environment & Development</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            CED is a premier private consultation firm bridging the gap
            between environmental sustainability and developmental growth
            through expert guidance and innovative strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/experience" className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
              Explore Our Work
            </Link>
            <Link href="/about" className="px-8 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors">
              About Us
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="About summary" className="py-16 sm:py-24 bg-white">
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

      <section aria-label="Services" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Our <span className="text-primary">Services</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              "Environmental Impact Assessment",
              "Sustainable Development Planning",
              "Policy Advisory",
              "Climate Risk Assessment",
              "Biodiversity Conservation",
              "Capacity Building",
            ].map((title) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Contact" className="py-16 sm:py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a <span className="text-primary">Difference</span>?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Contact us to discuss how CED can support your environmental and development goals.
          </p>
          <a
            href="mailto:contact@ced-consult.com"
            className="inline-flex px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            contact@ced-consult.com
          </a>
        </div>
      </section>
    </div>
  );
}