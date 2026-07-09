import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experts",
  description: "Meet CED's multidisciplinary team of environmental strategists, climate finance specialists, and policy advisors driving sustainable development.",
};

interface Expert {
  name: string;
  title: string;
  expertise: string[];
}

const experts: Expert[] = [
  { name: "Dr. Sarah Mitchell", title: "Chief Environmental Strategist", expertise: ["Policy", "Climate Adaptation"] },
  { name: "Prof. James Okonkwo", title: "Urban Development Advisor", expertise: ["Urban Planning", "Sustainable Infrastructure"] },
  { name: "Elena Vasquez", title: "Climate Finance Specialist", expertise: ["Climate Finance", "Green Bonds"] },
  { name: "Dr. Rajesh Patel", title: "Biodiversity Lead", expertise: ["Biodiversity", "Ecosystem Restoration"] },
  { name: "Dr. Aisha Benali", title: "Gender & Inclusion Advisor", expertise: ["Gender Equity", "GRME Framework"] },
  { name: "Dr. Kenji Tanaka", title: "Climate Resilience Specialist", expertise: ["Climate Modeling", "DRR"] },
  { name: "Maria Santos", title: "Water & WASH Expert", expertise: ["Water Management", "Sanitation"] },
  { name: "Dr. Peter Chen", title: "Digital Solutions Lead", expertise: ["Digital Transformation", "EIA Systems"] },
  { name: "Dr. Fatima Al-Rashid", title: "Energy Access Advisor", expertise: ["Renewable Energy", "Green Technology"] },
];

export default function Experts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Team</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Consortium of <span className="gradient-text">Experts</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Multidisciplinary professionals with decades of combined experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {experts.map((expert, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-primary font-bold">
                  {expert.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{expert.name}</h3>
              <p className="text-primary text-sm font-medium mb-3">{expert.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {expert.expertise.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}