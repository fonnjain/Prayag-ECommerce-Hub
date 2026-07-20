import { Link } from "wouter";
import { ShieldCheck, Award, Users, Leaf, Droplets, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useSiteContent } from "@/lib/siteContent";

const valueIcons = [ShieldCheck, Award, Leaf, Users];

export default function AboutPage() {
  const { section } = useSiteContent();
  const about = section("about");

  return (
    <div className="bg-white">
      <PageHero
        title={about.heroTitle}
        breadcrumb="About Us"
        subtitle={about.heroSubtitle}
      />

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs font-semibold text-[hsl(38,52%,45%)] uppercase tracking-[0.25em] mb-3">Our Story</div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4 tracking-tight">{about.storyHeading} <span className="italic text-gradient-gold">{about.storyAccent}</span></h2>
          <p className="text-gray-600 leading-relaxed mb-4">{about.storyPara1}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{about.storyPara2}</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] gold-sheen text-white font-bold px-6 py-3 rounded-xl">
            Explore Our Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-gold">
          <img src={about.storyImage} alt="Prayag craftsmanship" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-[hsl(24,12%,8%)] to-[hsl(24,10%,13%)] py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {about.stats.map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">{s.n}</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-[0.15em] mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight">What We <span className="italic text-gradient-gold">Stand For</span></h2>
          <div className="gold-divider w-24 mx-auto mt-3" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {about.values.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length];
            return (
              <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[hsl(38,52%,52%)]/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[hsl(24,14%,8%)]" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-stone-50 py-14 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Our <span className="italic text-gradient-gold">Journey</span></h2>
          </div>
          <div className="space-y-6">
            {about.milestones.map((m) => (
              <div key={m.year} className="flex gap-5 items-start">
                <div className="font-display text-2xl font-bold text-gradient-gold w-20 flex-shrink-0">{m.year}</div>
                <div className="flex-1 border-l-2 border-[hsl(38,52%,52%)]/30 pl-5 pb-2">
                  <p className="text-gray-700">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[hsl(24,12%,8%)] to-[hsl(24,10%,13%)] py-14 text-center">
        <Droplets className="w-8 h-8 text-[hsl(42,62%,68%)] mx-auto mb-4" />
        <h2 className="font-display text-3xl font-bold text-white mb-3">{about.ctaTitle} <span className="italic text-gradient-gold">Prayag</span></h2>
        <p className="text-stone-300 max-w-md mx-auto mb-7">{about.ctaSubtitle}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/dealer-registration" className="bg-gold-gradient text-[hsl(24,14%,8%)] font-bold px-7 py-3 rounded-xl gold-sheen">Become a Dealer</Link>
          <Link href="/products" className="border border-white/20 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/5 transition-colors">Browse Products</Link>
        </div>
      </section>
    </div>
  );
}
