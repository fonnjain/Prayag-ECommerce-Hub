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
} as const;

export type CmsSectionKey = keyof typeof cmsDefaults;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge CMS data over defaults so missing fields fall back gracefully. */
export function mergeWithDefaults<T>(fallback: T, data: unknown): T {
  if (data === undefined || data === null) return fallback;
  if (Array.isArray(fallback)) return (Array.isArray(data) && data.length > 0 ? data : fallback) as T;
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
