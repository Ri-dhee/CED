export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">About</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Center for Environment <span className="text-primary">&</span> Development
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            We help governments and organizations turn environmental challenges into sustainable outcomes.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 text-gray-600 text-base leading-relaxed">
          <p>
            CED is a consultation firm specializing in environmental management, gender-responsive urban
            development, climate adaptation, and policy advisory.
          </p>
          <p>
            Founded in 2012, we work across South Asia with national governments, development banks,
            and international agencies — from the GRME Index in Bhutan to climate resilience programs
            across the region.
          </p>
          <p>
            Our team combines scientific rigor with local knowledge. We don&apos;t just deliver reports —
            we stay through implementation to ensure lasting impact.
          </p>
        </div>
      </section>
    </div>
  );
}