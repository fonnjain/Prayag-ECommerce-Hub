import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useSiteContent } from "@/lib/siteContent";

const faqs = [
  {
    q: "What product categories does Prayag offer?",
    a: "Prayag offers a complete range including CP faucets, PTMT faucets, sanitaryware, kitchen sinks, water heaters, pipes & fittings, bathroom accessories and flush tanks — over 4,500 products in all.",
  },
  {
    q: "Do Prayag products come with a warranty?",
    a: "Yes. Most faucets and sanitaryware carry a manufacturer warranty (typically 5–10 years on the cartridge/finish depending on the series). Warranty details are listed on each product page.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you can track it anytime from the Track Order page or from your account under 'My Orders'. You'll also receive updates on your registered contact.",
  },
  {
    q: "What is your shipping timeline?",
    a: "Orders are typically dispatched within 1–2 business days and delivered within 3–7 business days depending on your location. See our Shipping Policy for full details.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Yes, unused products in their original packaging can be returned within 7 days of delivery. Please review our Returns & Refunds policy for eligibility and the step-by-step process.",
  },
  {
    q: "How do I become a Prayag dealer or distributor?",
    a: "We welcome new partners! Register through our Dealer Registration or Distributor Registration pages and our team will get in touch to discuss margins, schemes and onboarding.",
  },
  {
    q: "Do you offer bulk or project pricing?",
    a: "Absolutely. For bulk, builder or project requirements, use the Bulk Order option in the top bar or reach out via the Dealer portal for customised quotations.",
  },
  {
    q: "Are spare parts available for older models?",
    a: "Yes, cartridges, aerators and common spares are stocked for most current and recent series. Contact customer care with your product SKU for availability.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const { section } = useSiteContent();
  const contact = section("contact");
  return (
    <div className="bg-white">
      <PageHero
        title="Frequently Asked Questions"
        breadcrumb="FAQs"
        subtitle="Everything you need to know about Prayag products, orders, warranty and support."
      />

      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="space-y-3">
          {faqs.map((f, i) => {
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
