import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experts",
  description: "Meet CED's multidisciplinary team of environmental strategists, climate finance specialists, and policy advisors driving sustainable development.",
};

interface Expert {
  name: string;
  title: string;
  expertise: string[];
  bio: string;
}

const experts: Expert[] = [
  { name: "Dr. Sarah Mitchell", title: "Chief Environmental Strategist", expertise: ["Environmental Policy", "Climate Adaptation", "Strategic Planning"], bio: "Former Minister of Environment with over 25 years of experience in national environmental strategy development and international climate negotiations." },
  { name: "Prof. James Okonkwo", title: "Lead Urban Development Advisor", expertise: ["Urban Planning", "Sustainable Infrastructure", "Community Development"], bio: "Professor of Urban Planning with extensive experience designing sustainable city frameworks across Africa and Asia." },
  { name: "Elena Vasquez", title: "Senior Climate Finance Specialist", expertise: ["Climate Finance", "Risk Assessment", "Green Bonds"], bio: "Expert in mobilizing climate finance for developing nations, having facilitated over $500M in green investments across 20+ countries." },
  { name: "Dr. Rajesh Patel", title: "Biodiversity & Conservation Lead", expertise: ["Biodiversity", "Ecosystem Restoration", "Conservation Planning"], bio: "Conservation biologist with 20 years of field experience in biodiversity assessment, protected area management, and community-based conservation." },
  { name: "Dr. Aisha Benali", title: "Gender & Social Inclusion Advisor", expertise: ["Gender Equity", "Social Inclusion", "GRME Framework"], bio: "Leading expert on gender-responsive urban development, architect of the GRME framework for gender-inclusive city planning in South Asia." },
  { name: "Dr. Kenji Tanaka", title: "Climate Resilience Specialist", expertise: ["Climate Modeling", "Disaster Risk Reduction", "Early Warning Systems"], bio: "Climate scientist specializing in disaster risk reduction and climate adaptation for mountain ecosystems and vulnerable urban populations." },
  { name: "Maria Santos", title: "Water Resources & WASH Expert", expertise: ["Water Management", "Sanitation", "Community Engagement"], bio: "Water resources engineer with extensive experience in gender-responsive WASH programs and integrated water resource management in urban settings." },
  { name: "Dr. Peter Chen", title: "Digital Solutions & EIA Specialist", expertise: ["Digital Transformation", "EIA Systems", "Data Analytics"], bio: "Technology expert who designed and deployed national-scale digital EIA tracking systems, bringing transparency and efficiency to environmental assessments." },
  { name: "Dr. Fatima Al-Rashid", title: "Renewable Energy & Energy Access Advisor", expertise: ["Renewable Energy", "Energy Policy", "Green Technology"], bio: "Energy specialist focused on renewable energy integration and sustainable energy access for underserved communities in developing regions." },
];

export default function Experts() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <section className="relative pt-28 sm:pt-40 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent -top-20 -right-20 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
          <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest">Team</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Consortium of <span className="text-primary">Experts</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Multidisciplinary professionals with decades of combined experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          {experts.map((expert, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-primary font-bold">
                  {expert.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{expert.name}</h3>
              <p className="text-primary text-sm font-medium mb-3">{expert.title}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{expert.bio}</p>
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
