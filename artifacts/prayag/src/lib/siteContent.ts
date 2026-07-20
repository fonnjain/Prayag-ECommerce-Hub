import { useGetSiteContent } from "@workspace/api-client-react";

export interface HeroStat { n: number; s: string; label: string }
export interface HeroFeatured { name: string; image: string; price: number; mrp: number; reviews: number; link: string }
export interface HeroContent {
  badge: string;
  titleLine1: string;
  titleAccent: string;
  subtitle: string;
  stats: HeroStat[];
  featured: HeroFeatured;
  backgroundImage: string;
}
export interface CollectionCard { title: string; sub: string; img: string; chips: string[]; slug: string }
export interface RoomCard { label: string; img: string; slug: string }
export interface TrustItem { label: string; sub: string }
export interface TopbarContent { text: string; phone: string }
export interface FooterContent { phone: string; email: string; hours: string; about: string }

export const defaultHero: HeroContent = {
  badge: "India's Premier Plumbing Maison",
  titleLine1: "Complete Bathroom & Plumbing",
  titleAccent: "Solutions",
  subtitle: "Premium faucets, sanitaryware, kitchen sinks & water heaters — engineered to last a lifetime.",
  stats: [
    { n: 4500, s: "+", label: "Products" },
    { n: 10000, s: "+", label: "Dealers" },
    { n: 40, s: "+ yrs", label: "Legacy" },
  ],
  featured: {
    name: "Royale Series Basin Mixer",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&h=240&fit=crop",
    price: 2499,
    mrp: 3299,
    reviews: 214,
    link: "/products?category=cp-faucets",
  },
  backgroundImage: "",
};

export const defaultCollections: CollectionCard[] = [
  { title: "Premium Faucet Collection", sub: "Crafted to perfection", img: "/images/collections/faucet-collection.webp", chips: ["Royale Series", "Elegance Series", "Aqua Series"], slug: "cp-faucets" },
  { title: "Luxury Bathroom Collection", sub: "Luxury that lasts", img: "/images/collections/bathroom-collection.webp", chips: ["Wall Hung Closets", "Wash Basins", "Concealed Cisterns"], slug: "sanitaryware" },
  { title: "Kitchen Collection", sub: "Functional. Durable. Stylish.", img: "/images/collections/kitchen-collection.webp", chips: ["Stainless Steel Sinks", "Sink Mixers", "Drain Systems"], slug: "kitchen-sinks" },
];

export const defaultRooms: RoomCard[] = [
  { label: "Bathroom", img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop", slug: "sanitaryware" },
  { label: "Kitchen", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", slug: "kitchen-sinks" },
  { label: "Utility Area", img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop", slug: "pipes-fittings" },
  { label: "Commercial Space", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop", slug: "cp-faucets" },
];

export const defaultTrust: TrustItem[] = [
  { label: "100% Original Products", sub: "Sourced directly" },
  { label: "Easy Returns", sub: "Within 7 days" },
  { label: "Secure Payments", sub: "Multiple options" },
  { label: "Best Price", sub: "Guaranteed" },
  { label: "Expert Support", sub: "Available 24x7" },
];

export const defaultMarquee: string[] = ["CP FAUCETS", "SANITARYWARE", "KITCHEN SINKS", "WATER HEATERS", "PIPES & FITTINGS", "BATHROOM ACCESSORIES", "STORAGE TANKS", "PTMT FAUCETS"];

export const defaultTopbar: TopbarContent = { text: "Customer Care:", phone: "1800 123 4567" };

export const defaultFooter: FooterContent = {
  phone: "1800 123 4567",
  email: "support@prayag.com",
  hours: "Mon–Sat · 9AM – 6PM",
  about: "India's trusted plumbing and sanitaryware brand — delivering timeless quality for homes and commercial spaces since 1985.",
};

export interface AboutValue { title: string; desc: string }
export interface AboutMilestone { year: string; text: string }
export interface AboutStat { n: string; l: string }
export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  storyHeading: string;
  storyAccent: string;
  storyPara1: string;
  storyPara2: string;
  storyImage: string;
  stats: AboutStat[];
  values: AboutValue[];
  milestones: AboutMilestone[];
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface ContactContent {
  title: string;
  subtitle: string;
  phone: string;
}

export interface DealerRegContent {
  badge: string;
  title: string;
  intro: string;
  benefits: string[];
  statNumber: string;
  statText: string;
}

export const defaultAbout: AboutContent = {
  heroTitle: "About Prayag",
  heroSubtitle: "India's trusted plumbing and sanitaryware brand — crafting strong, beautiful spaces since 1985.",
  storyHeading: "Four Decades of",
  storyAccent: "Craftsmanship",
  storyPara1: "What began in 1985 as a modest faucet workshop has grown into one of India's most recognised names in plumbing and sanitaryware. For nearly forty years, Prayag has stood for products that combine engineering precision with timeless design.",
  storyPara2: "From CP and PTMT faucets to kitchen sinks, water heaters and complete bathroom solutions, every Prayag product is built to a single promise — Strong. Beautiful. Prayag.",
  storyImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&h=520&fit=crop",
  stats: [
    { n: "40+", l: "Years of Legacy" },
    { n: "4,500+", l: "Products" },
    { n: "10,000+", l: "Dealers" },
    { n: "28", l: "States Served" },
  ],
  values: [
    { title: "Built to Last", desc: "Every product is engineered and stress-tested for a lifetime of reliable performance." },
    { title: "Uncompromising Quality", desc: "Premium-grade brass, ceramic and PTMT materials with rigorous quality control." },
    { title: "Water Conscious", desc: "Aerated flow and precision valves that conserve water without sacrificing pressure." },
    { title: "Trusted Network", desc: "10,000+ dealers and distributors serving homes and businesses across India." },
  ],
  milestones: [
    { year: "1985", text: "Prayag founded with a single faucet workshop." },
    { year: "1998", text: "Expanded into complete sanitaryware & bath fittings." },
    { year: "2010", text: "Launched pan-India dealer & distributor network." },
    { year: "2024", text: "4,500+ SKUs across faucets, sinks, heaters & accessories." },
  ],
  ctaTitle: "Partner With",
  ctaSubtitle: "Join our growing network of dealers and distributors across India.",
};

export const defaultContact: ContactContent = {
  title: "Still have questions?",
  subtitle: "Our support team is available Mon–Sat, 9AM–6PM.",
  phone: "1800 123 4567",
};

export const defaultDealerReg: DealerRegContent = {
  badge: "Dealer Program",
  title: "Partner with PRAYAG",
  intro: "Join India's fastest-growing plumbing dealer network. Get access to 4500+ premium products, exclusive pricing, and dedicated support.",
  benefits: [
    "Exclusive dealer pricing & margins",
    "Free marketing support materials",
    "Dedicated relationship manager",
    "Priority order processing",
    "GST invoice generation",
    "Access to dealer schemes",
  ],
  statNumber: "10,000+",
  statText: "Active dealers trust PRAYAG across India",
};

export interface FaqItem { q: string; a: string }
export interface FaqContent { heroSubtitle: string; items: FaqItem[] }

export interface PolicySection { h: string; p: string }
export interface PolicyContent { title: string; subtitle: string; sections: PolicySection[] }
export interface PoliciesContent {
  contactEmail: string;
  shipping: PolicyContent;
  returns: PolicyContent;
  privacy: PolicyContent;
  terms: PolicyContent;
}

export interface CareersPerk { title: string; desc: string }
export interface CareersOpening { role: string; dept: string; location: string; type: string }
export interface CareersContent {
  heroSubtitle: string;
  introBadge: string;
  introTitle: string;
  introAccent: string;
  introText: string;
  perks: CareersPerk[];
  openings: CareersOpening[];
  email: string;
}

export const defaultFaq: FaqContent = {
  heroSubtitle: "Everything you need to know about Prayag products, orders, warranty and support.",
  items: [
    { q: "What product categories does Prayag offer?", a: "Prayag offers a complete range including CP faucets, PTMT faucets, sanitaryware, kitchen sinks, water heaters, pipes & fittings, bathroom accessories and flush tanks — over 4,500 products in all." },
    { q: "Do Prayag products come with a warranty?", a: "Yes. Most faucets and sanitaryware carry a manufacturer warranty (typically 5–10 years on the cartridge/finish depending on the series). Warranty details are listed on each product page." },
    { q: "How can I track my order?", a: "Once your order ships, you can track it anytime from the Track Order page or from your account under 'My Orders'. You'll also receive updates on your registered contact." },
    { q: "What is your shipping timeline?", a: "Orders are typically dispatched within 1–2 business days and delivered within 3–7 business days depending on your location. See our Shipping Policy for full details." },
    { q: "Can I return or exchange a product?", a: "Yes, unused products in their original packaging can be returned within 7 days of delivery. Please review our Returns & Refunds policy for eligibility and the step-by-step process." },
    { q: "How do I become a Prayag dealer or distributor?", a: "We welcome new partners! Register through our Dealer Registration or Distributor Registration pages and our team will get in touch to discuss margins, schemes and onboarding." },
    { q: "Do you offer bulk or project pricing?", a: "Absolutely. For bulk, builder or project requirements, use the Bulk Order option in the top bar or reach out via the Dealer portal for customised quotations." },
    { q: "Are spare parts available for older models?", a: "Yes, cartridges, aerators and common spares are stocked for most current and recent series. Contact customer care with your product SKU for availability." },
  ],
};

export const defaultPolicies: PoliciesContent = {
  contactEmail: "support@prayag.com",
  shipping: {
    title: "Shipping Policy",
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

export interface ProductsPageContent {
  allTitle: string;
  countText: string;
  bannerImage: string;
}

export const defaultProductsPage: ProductsPageContent = {
  allTitle: "The Collection",
  countText: "exceptional pieces discovered",
  bannerImage: "",
};

export interface CategoryPageEntry { slug: string; title: string; bannerImage: string }
export interface CategoryPagesContent { entries: CategoryPageEntry[] }

export const defaultCategoryPages: CategoryPagesContent = { entries: [] };

export const defaultCareers: CareersContent = {
  heroSubtitle: "Build a career with one of India's most trusted plumbing and sanitaryware brands.",
  introBadge: "Join The Team",
  introTitle: "Do Work That",
  introAccent: "Flows",
  introText: "At Prayag, we believe great products are built by great people. Whether you're on the factory floor, in the field, or behind a screen, you'll be part of a team that's shaping how India experiences water — one home at a time.",
  perks: [
    { title: "Growth", desc: "Clear career paths and internal promotions across a fast-growing brand." },
    { title: "Learning", desc: "On-the-job training, mentorship and skill development programs." },
    { title: "Wellbeing", desc: "Health cover, paid leave and a supportive, family-first culture." },
    { title: "Team", desc: "Work alongside passionate people who take pride in their craft." },
  ],
  openings: [
    { role: "Area Sales Manager", dept: "Sales", location: "Mumbai, MH", type: "Full-time" },
    { role: "Product Design Engineer", dept: "R&D", location: "Pune, MH", type: "Full-time" },
    { role: "Quality Control Inspector", dept: "Manufacturing", location: "Ahmedabad, GJ", type: "Full-time" },
    { role: "Digital Marketing Specialist", dept: "Marketing", location: "Remote", type: "Full-time" },
    { role: "Customer Support Executive", dept: "Support", location: "Delhi, NCR", type: "Full-time" },
  ],
  email: "careers@prayag.com",
};

export const cmsDefaults = {
  hero: defaultHero,
  collections: { cards: defaultCollections },
  rooms: { cards: defaultRooms },
  trust: { items: defaultTrust },
  marquee: { words: defaultMarquee },
  topbar: defaultTopbar,
  footer: defaultFooter,
  about: defaultAbout,
  contact: defaultContact,
  dealerReg: defaultDealerReg,
  faq: defaultFaq,
  policies: defaultPolicies,
  careers: defaultCareers,
  productsPage: defaultProductsPage,
  categoryPages: defaultCategoryPages,
} as const;

export type CmsSectionKey = keyof typeof cmsDefaults;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge CMS data over defaults so missing fields fall back gracefully. */
export function mergeWithDefaults<T>(fallback: T, data: unknown): T {
  if (data === undefined || data === null) return fallback;
  if (Array.isArray(fallback)) return (Array.isArray(data) ? data : fallback) as T;
  if (isPlainObject(fallback)) {
    if (!isPlainObject(data)) return fallback;
    const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
    for (const key of Object.keys(fallback as Record<string, unknown>)) {
      out[key] = mergeWithDefaults((fallback as Record<string, unknown>)[key], data[key]);
    }
    return out as T;
  }
  const sameType = typeof data === typeof fallback;
  if (!sameType) return fallback;
  if (typeof data === "string" && data.trim() === "") return fallback;
  return data as T;
}

export function useSiteContent() {
  const { data } = useGetSiteContent();
  const content = (data ?? {}) as Record<string, unknown>;
  function section<K extends CmsSectionKey>(key: K): (typeof cmsDefaults)[K] {
    return mergeWithDefaults(cmsDefaults[key], content[key]);
  }
  return { section, raw: content };
}
