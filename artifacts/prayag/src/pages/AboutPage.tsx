import { Link } from "wouter";
import { ShieldCheck, Award, Factory, Users, Leaf, Droplets, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";

const values = [
  { icon: ShieldCheck, title: "Built to Last", desc: "Every product is engineered and stress-tested for a lifetime of reliable performance." },
  { icon: Award, title: "Uncompromising Quality", desc: "Premium-grade brass, ceramic and PTMT materials with rigorous quality control." },
  { icon: Leaf, title: "Water Conscious", desc: "Aerated flow and precision valves that conserve water without sacrificing pressure." },
  { icon: Users, title: "Trusted Network", desc: "10,000+ dealers and distributors serving homes and businesses across India." },
];

const milestones = [
  { year: "1985", text: "Prayag founded with a single faucet workshop." },
  { year: "1998", text: "Expanded into complete sanitaryware & bath fittings." },
  { year: "2010", text: "Launched pan-India dealer & distributor network." },
  { year: "2024", text: "4,500+ SKUs across faucets, sinks, heaters & accessories." },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero
        title="About Prayag"
        breadcrumb="About Us"
        subtitle="India's trusted plumbing and sanitaryware brand — crafting strong, beautiful spaces since 1985."
      />

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs font-semibold text-[hsl(38,52%,45%)] uppercase tracking-[0.25em] mb-3">Our Story</div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4 tracking-tight">Four Decades of <span className="italic text-gradient-gold">Craftsmanship</span></h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            What began in 1985 as a modest faucet workshop has grown into one of India's most recognised names in
            plumbing and sanitaryware. For nearly forty years, Prayag has stood for products that combine engineering
            precision with timeless design.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            From CP and PTMT faucets to kitchen sinks, water heaters and complete bathroom solutions, every Prayag
            product is built to a single promise — <span className="font-semibold text-gray-800">Strong. Beautiful. Prayag.</span>
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] gold-sheen text-white font-bold px-6 py-3 rounded-xl">
            Explore Our Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-gold">
          <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&h=520&fit=crop" alt="Prayag craftsmanship" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-[hsl(24,12%,8%)] to-[hsl(24,10%,13%)] py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: "40+", l: "Years of Legacy" },
            { n: "4,500+", l: "Products" },
            { n: "10,000+", l: "Dealers" },
            { n: "28", l: "States Served" },
          ].map((s) => (
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
          {values.map((v) => (
            <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[hsl(38,52%,52%)]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-[hsl(24,14%,8%)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-stone-50 py-14 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Our <span className="italic text-gradient-gold">Journey</span></h2>
          </div>
          <div className="space-y-6">
            {milestones.map((m) => (
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
        <h2 className="font-display text-3xl font-bold text-white mb-3">Partner With <span className="italic text-gradient-gold">Prayag</span></h2>
        <p className="text-stone-300 max-w-md mx-auto mb-7">Join our growing network of dealers and distributors across India.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/dealer-registration" className="bg-gold-gradient text-[hsl(24,14%,8%)] font-bold px-7 py-3 rounded-xl gold-sheen">Become a Dealer</Link>
          <Link href="/products" className="border border-white/20 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/5 transition-colors">Browse Products</Link>
        </div>
      </section>
    </div>
  );
}
