import PageHero from "@/components/PageHero";

type Section = { h: string; p: string };
type Policy = { title: string; breadcrumb: string; subtitle: string; sections: Section[] };

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping Policy",
    breadcrumb: "Shipping Policy",
    subtitle: "How and when your Prayag order reaches you.",
    sections: [
      { h: "Order Processing", p: "Orders are processed within 1–2 business days of confirmation. You will receive a notification once your order has been dispatched, along with tracking details." },
      { h: "Delivery Timeline", p: "Standard delivery takes 3–7 business days depending on your location. Metro cities are typically served faster than remote or non-serviceable pin codes." },
      { h: "Shipping Charges", p: "Shipping is calculated at checkout based on order value, weight and destination. Orders above the eligible threshold qualify for free shipping." },
      { h: "Tracking Your Order", p: "You can track your shipment anytime from the Track Order page or under 'My Orders' in your account. Updates are also shared on your registered contact." },
      { h: "Delays & Exceptions", p: "Deliveries may be delayed due to weather, regional restrictions or unforeseen logistics issues. We will keep you informed of any material delay." },
    ],
  },
  returns: {
    title: "Returns & Refunds",
    breadcrumb: "Returns & Refunds",
    subtitle: "Our hassle-free return and refund process.",
    sections: [
      { h: "Eligibility", p: "Unused products in their original, undamaged packaging can be returned within 7 days of delivery. Installed or used items are not eligible unless found defective." },
      { h: "How to Initiate a Return", p: "Raise a return request from 'My Orders' in your account or contact customer care with your order number. Our team will guide you through pickup or drop-off." },
      { h: "Defective or Damaged Items", p: "If you receive a damaged or defective product, notify us within 48 hours of delivery with photographs. We will arrange a free replacement or full refund." },
      { h: "Refund Timeline", p: "Once your return is received and inspected, refunds are processed to the original payment method within 5–7 business days." },
      { h: "Non-Returnable Items", p: "Made-to-order, customised, or clearance items are non-returnable unless they arrive damaged or defective." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    breadcrumb: "Privacy Policy",
    subtitle: "How we collect, use and protect your information.",
    sections: [
      { h: "Information We Collect", p: "We collect information you provide — such as name, contact details, shipping address and order history — as well as basic usage data to improve your experience." },
      { h: "How We Use It", p: "Your information is used to process orders, provide support, personalise your experience and send relevant updates. We do not sell your personal data to third parties." },
      { h: "Data Security", p: "We use industry-standard measures to protect your data. Payment information is handled through secure, encrypted payment gateways." },
      { h: "Cookies", p: "We use cookies to remember your preferences, keep your cart intact and analyse site performance. You can control cookies through your browser settings." },
      { h: "Your Rights", p: "You may request access to, correction of, or deletion of your personal data at any time by contacting our support team." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    breadcrumb: "Terms & Conditions",
    subtitle: "The terms governing your use of the Prayag platform.",
    sections: [
      { h: "Acceptance of Terms", p: "By accessing or using this website, you agree to be bound by these terms and conditions and all applicable laws and regulations." },
      { h: "Product Information", p: "We strive to display product details, pricing and availability accurately. Minor variations in colour or finish may occur, and we reserve the right to correct errors." },
      { h: "Pricing & Payment", p: "All prices are listed in INR and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice." },
      { h: "Intellectual Property", p: "All content, logos, images and designs on this site are the property of Prayag and may not be reproduced without written permission." },
      { h: "Limitation of Liability", p: "Prayag shall not be liable for any indirect or consequential damages arising from the use of our products or website beyond the value of the product purchased." },
    ],
  },
};

export default function PolicyPage({ type }: { type: keyof typeof POLICIES }) {
  const policy = POLICIES[type];
  if (!policy) return null;
  return (
    <div className="bg-white">
      <PageHero title={policy.title} breadcrumb={policy.breadcrumb} subtitle={policy.subtitle} />
      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="space-y-8">
          {policy.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <span className="text-gradient-gold">{String(i + 1).padStart(2, "0")}</span>
                {s.h}
              </h2>
              <p className="text-gray-600 leading-relaxed pl-9">{s.p}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
          Last updated: July 2026. For questions about this policy, contact us at{" "}
          <a href="mailto:support@prayag.com" className="text-[hsl(38,52%,45%)] font-semibold hover:underline">support@prayag.com</a>.
        </div>
      </section>
    </div>
  );
}
