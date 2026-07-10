import { Heart, TrendingUp, GraduationCap, Users, MapPin, Briefcase } from "lucide-react";
import PageHero from "@/components/PageHero";

const perks = [
  { icon: TrendingUp, title: "Growth", desc: "Clear career paths and internal promotions across a fast-growing brand." },
  { icon: GraduationCap, title: "Learning", desc: "On-the-job training, mentorship and skill development programs." },
  { icon: Heart, title: "Wellbeing", desc: "Health cover, paid leave and a supportive, family-first culture." },
  { icon: Users, title: "Team", desc: "Work alongside passionate people who take pride in their craft." },
];

const openings = [
  { role: "Area Sales Manager", dept: "Sales", location: "Mumbai, MH", type: "Full-time" },
  { role: "Product Design Engineer", dept: "R&D", location: "Pune, MH", type: "Full-time" },
  { role: "Quality Control Inspector", dept: "Manufacturing", location: "Ahmedabad, GJ", type: "Full-time" },
  { role: "Digital Marketing Specialist", dept: "Marketing", location: "Remote", type: "Full-time" },
  { role: "Customer Support Executive", dept: "Support", location: "Delhi, NCR", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <div className="bg-white">
      <PageHero
        title="Careers at Prayag"
        breadcrumb="Careers"
        subtitle="Build a career with one of India's most trusted plumbing and sanitaryware brands."
      />

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <div className="text-xs font-semibold text-[hsl(38,52%,45%)] uppercase tracking-[0.25em] mb-3">Join The Team</div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4 tracking-tight">Do Work That <span className="italic text-gradient-gold">Flows</span></h2>
        <p className="text-gray-600 leading-relaxed">
          At Prayag, we believe great products are built by great people. Whether you're on the factory floor, in the
          field, or behind a screen, you'll be part of a team that's shaping how India experiences water — one home at a time.
        </p>
      </section>

      {/* Perks */}
      <section className="bg-stone-50 py-14 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {perks.map((p) => (
              <div key={p.title} className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-5 h-5 text-[hsl(24,14%,8%)]" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Open <span className="italic text-gradient-gold">Positions</span></h2>
          <div className="gold-divider w-24 mx-auto mt-3" />
        </div>
        <div className="space-y-3">
          {openings.map((o) => (
            <div key={o.role} className="flex flex-wrap items-center justify-between gap-4 border border-gray-100 rounded-2xl p-5 hover:border-[hsl(38,52%,52%)]/30 hover:shadow-sm transition-all">
              <div>
                <h3 className="font-semibold text-gray-900">{o.role}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {o.dept}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.location}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[hsl(38,52%,52%)]/10 text-[hsl(38,52%,40%)] font-medium">{o.type}</span>
                </div>
              </div>
              <a
                href={`mailto:careers@prayag.com?subject=Application: ${encodeURIComponent(o.role)}`}
                className="bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] gold-sheen text-white text-sm font-bold px-5 py-2.5 rounded-xl"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          Don't see a role that fits? Send your resume to{" "}
          <a href="mailto:careers@prayag.com" className="text-[hsl(38,52%,45%)] font-semibold hover:underline">careers@prayag.com</a>
        </div>
      </section>
    </div>
  );
}
