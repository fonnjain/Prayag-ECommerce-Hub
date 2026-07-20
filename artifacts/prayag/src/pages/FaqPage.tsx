import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useSiteContent } from "@/lib/siteContent";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const { section } = useSiteContent();
  const contact = section("contact");
  const faq = section("faq");
  return (
    <div className="bg-white">
      <PageHero
        title="Frequently Asked Questions"
        breadcrumb="FAQs"
        subtitle={faq.heroSubtitle}
      />

      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="space-y-3">
          {faq.items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-[hsl(38,52%,52%)]/40 shadow-sm" : "border-gray-100"}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[hsl(38,52%,52%)] flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">{f.a}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-gradient-to-br from-[hsl(24,12%,8%)] to-[hsl(24,10%,13%)] rounded-3xl p-8 text-center">
          <MessageCircle className="w-8 h-8 text-[hsl(42,62%,68%)] mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">{contact.title}</h2>
          <p className="text-stone-300 text-sm mb-6">{contact.subtitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="bg-gold-gradient text-[hsl(24,14%,8%)] font-bold px-6 py-3 rounded-xl gold-sheen">Call {contact.phone}</a>
            <Link href="/account/orders" className="border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">Track My Order</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
