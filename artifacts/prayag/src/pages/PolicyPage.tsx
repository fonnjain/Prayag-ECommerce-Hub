import PageHero from "@/components/PageHero";
import { useSiteContent, type PoliciesContent } from "@/lib/siteContent";

type PolicyKey = Exclude<keyof PoliciesContent, "contactEmail">;

const BREADCRUMBS: Record<PolicyKey, string> = {
  shipping: "Shipping Policy",
  returns: "Returns & Refunds",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

export default function PolicyPage({ type }: { type: PolicyKey }) {
  const { section } = useSiteContent();
  const policies = section("policies");
  const policy = policies[type];
  if (!policy) return null;
  return (
    <div className="bg-white">
      <PageHero title={policy.title} breadcrumb={BREADCRUMBS[type] || policy.title} subtitle={policy.subtitle} />
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
          <a href={`mailto:${policies.contactEmail}`} className="text-[hsl(38,52%,45%)] font-semibold hover:underline">{policies.contactEmail}</a>.
        </div>
      </section>
    </div>
  );
}
