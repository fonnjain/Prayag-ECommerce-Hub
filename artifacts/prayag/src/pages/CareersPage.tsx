import { Heart, TrendingUp, GraduationCap, Users, MapPin, Briefcase } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useSiteContent } from "@/lib/siteContent";

const perkIcons = [TrendingUp, GraduationCap, Heart, Users];

export default function CareersPage() {
  const { section } = useSiteContent();
  const careers = section("careers");
  return (
    <div className="bg-white">
      <PageHero
        title="Careers at Prayag"
        breadcrumb="Careers"
        subtitle={careers.heroSubtitle}
      />

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <div className="text-xs font-semibold text-[hsl(38,52%,45%)] uppercase tracking-[0.25em] mb-3">{careers.introBadge}</div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4 tracking-tight">{careers.introTitle} <span className="italic text-gradient-gold">{careers.introAccent}</span></h2>
        <p className="text-gray-600 leading-relaxed">{careers.introText}</p>
      </section>

      {/* Perks */}
      <section className="bg-stone-50 py-14 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {careers.perks.map((p, i) => {
              const Icon = perkIcons[i % perkIcons.length];
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-[hsl(24,14%,8%)]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
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
          {careers.openings.map((o, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-4 border border-gray-100 rounded-2xl p-5 hover:border-[hsl(38,52%,52%)]/30 hover:shadow-sm transition-all">
              <div>
                <h3 className="font-semibold text-gray-900">{o.role}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {o.dept}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.location}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[hsl(38,52%,52%)]/10 text-[hsl(38,52%,40%)] font-medium">{o.type}</span>
                </div>
              </div>
              <a
                href={`mailto:${careers.email}?subject=Application: ${encodeURIComponent(o.role)}`}
                className="bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] gold-sheen text-white text-sm font-bold px-5 py-2.5 rounded-xl"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          Don't see a role that fits? Send your resume to{" "}
          <a href={`mailto:${careers.email}`} className="text-[hsl(38,52%,45%)] font-semibold hover:underline">{careers.email}</a>
        </div>
      </section>
    </div>
  );
}
