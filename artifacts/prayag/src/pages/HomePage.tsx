import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, Shield, Truck, Award, RefreshCw, BadgeCheck, Headphones, Tag, Star, Droplets, Sparkles, Package } from "lucide-react";
import { useListCategoriesWithCounts, useListProducts, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import SkuBadge from "@/components/SkuBadge";
import { useSiteContent } from "@/lib/siteContent";
import heroFaucet from "@assets/generated_images/prayag_hero_luxury.png";

function AddToCartButton({ productId, productName }: { productId: number; productName: string }) {
  const { toast } = useToast();
  const { setItemCount } = useCartStore();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: (cart) => {
        setItemCount(cart.itemCount);
        queryClient.setQueryData(getGetCartQueryKey(), cart);
        toast({ title: "Added to cart", description: productName });
      },
    });
  }

  return (
    <button onClick={handleClick} disabled={addToCart.isPending}
      className="shimmer-hover w-full bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] text-white text-[10px] font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1 disabled:opacity-60"
      data-testid={`button-home-add-cart-${productId}`}>
      <ShoppingCart className="w-3 h-3" />
      {addToCart.isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}

const categoryImages: Record<string, string> = {
  "cp-faucets": "/images/categories/cp-faucets.webp",
  "ptmt-faucets": "/images/categories/ptmt-faucets.webp",
  "sanitaryware": "/images/categories/sanitaryware.webp",
  "kitchen-sinks": "/images/categories/kitchen-sinks.webp",
  "water-heaters": "/images/categories/water-heaters.webp",
  "bathroom-accessories": "/images/categories/bathroom-accessories.webp",
  "pipes-fittings": "/images/categories/pipes-fittings.webp",
  "flush-tanks": "/images/categories/flush-tanks.webp",
  "storage-tanks": "/images/categories/storage-tanks.webp",
};

const trustIcons = [BadgeCheck, RefreshCw, Shield, Tag, Headphones];

/* Animated number counter */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: v => setVal(Math.floor(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString("en-IN")}{suffix}</span>;
}

/* Scroll reveal wrapper */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, accent, href, icon: Icon }: { title: string; accent?: string; href?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-end justify-between mb-7">
      <div>
        <h2 className="font-display text-3xl md:text-[2.1rem] font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
          {Icon && <Icon className="w-5 h-5 text-[hsl(38,52%,52%)]" />}
          {title}{" "}
          {accent && <span className="text-gradient-gold italic">{accent}</span>}
        </h2>
        <div className="w-16 h-[2px] bg-gradient-to-r from-[hsl(38,52%,52%)] to-transparent mt-2.5 rounded-full" />
      </div>
      {href && (
        <Link href={href} className="group text-sm font-semibold text-[hsl(24,10%,16%)] flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { data: categories, isLoading: catsLoading } = useListCategoriesWithCounts();
  const { data: cpFaucetDeals, isLoading: cpDealsLoading } = useListProducts({ category: "cp-faucets", sortBy: "photo_ready", limit: 10 });
  const { data: tankShowcase, isLoading: tankShowcaseLoading } = useListProducts({ category: "storage-tanks", sortBy: "photo_ready", limit: 4 });
  const faucetScrollRef = useRef<HTMLDivElement>(null);
  const { section } = useSiteContent();
  const hero = section("hero");
  const heroFeatureProduct = cpFaucetDeals?.products.find((product) => Boolean(product.imageUrl));
  const verifiedTankProducts = (tankShowcase?.products ?? []).filter((product) => Boolean(product.imageUrl)).slice(0, 4);
  const verifiedFaucetProducts = (cpFaucetDeals?.products ?? []).filter((product) => Boolean(product.imageUrl)).slice(5, 10);
  const heroFeatureName = heroFeatureProduct?.name ?? hero.featured.name;
  const heroFeatureImage = heroFeatureProduct?.imageUrl ?? hero.featured.image;
  const heroFeaturePrice = heroFeatureProduct?.price ?? hero.featured.price;
  const heroFeatureMrp = heroFeatureProduct?.mrp ?? hero.featured.mrp;
  const heroFeatureReviews = heroFeatureProduct?.reviewCount ?? hero.featured.reviews;
  const heroFeatureLink = heroFeatureProduct ? `/products/${heroFeatureProduct.slug}` : hero.featured.link;
  const collectionCards = section("collections").cards;
  const roomCards = section("rooms").cards;
  const trustItems = section("trust").items;
  const marqueeWords = section("marquee").words;

  // parallax mouse for hero product card
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(my, { stiffness: 120, damping: 15 });
  const ry = useSpring(mx, { stiffness: 120, damping: 15 });

  function scrollFaucets(dir: "left" | "right") {
    faucetScrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }

  const catList = (categories && categories.length > 0) ? categories : [
    { id: 1, name: "CP Faucets", slug: "cp-faucets", productCount: 12 },
    { id: 2, name: "PTMT Faucets", slug: "ptmt-faucets", productCount: 8 },
    { id: 3, name: "Sanitaryware", slug: "sanitaryware", productCount: 15 },
    { id: 4, name: "Kitchen Sinks", slug: "kitchen-sinks", productCount: 6 },
    { id: 5, name: "Water Heaters", slug: "water-heaters", productCount: 5 },
    { id: 6, name: "Bathroom Accessories", slug: "bathroom-accessories", productCount: 20 },
    { id: 7, name: "Pipes & Fittings", slug: "pipes-fittings", productCount: 10 },
    { id: 8, name: "Storage Tanks", slug: "storage-tanks", productCount: 7 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative bg-gradient-to-br from-[hsl(24,12%,8%)] via-[hsl(24,10%,10%)] to-[hsl(24,10%,13%)] overflow-hidden">
        {/* animated blobs */}
        <div className="absolute top-[-120px] right-[10%] w-96 h-96 bg-[hsl(38,52%,52%)]/25 blur-3xl animate-blob" />
        <div className="absolute bottom-[-140px] left-[5%] w-[28rem] h-[28rem] bg-[hsl(24,9%,26%)]/20 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
        <img src={hero.backgroundImage || heroFaucet} alt="Luxury Prayag bathroom with gold fixtures" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(24,12%,8%)]/90 via-[hsl(24,12%,8%)]/55 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border border-[hsl(38,52%,52%)]/30">
              <Droplets className="w-3.5 h-3.5 text-[hsl(42,62%,68%)]" /> <span className="tracking-[0.15em] uppercase text-[hsl(42,62%,78%)]">{hero.badge}</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-[4.2rem] font-bold leading-[1.05] mb-6 tracking-tight">
              {hero.titleLine1}{" "}
              <span className="relative inline-block">
                <span className="italic text-gradient-gold">{hero.titleAccent}</span>
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.7 }}
                  className="absolute left-0 -bottom-1 w-full h-[3px] bg-gold-gradient origin-left rounded-full" />
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="text-stone-300 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              {hero.subtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-3 mb-10">
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="shimmer-hover bg-white text-[hsl(24,10%,16%)] font-bold px-7 py-3 rounded-xl shadow-lg flex items-center gap-2" data-testid="button-shop-now">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/dealer-registration">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="glass text-white font-bold px-7 py-3 rounded-xl flex items-center gap-2" data-testid="button-become-dealer">
                  Become Dealer <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
            {/* animated stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {hero.stats.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="glass rounded-2xl px-3 py-3 text-center border border-[hsl(38,52%,52%)]/20">
                  <div className="font-display text-2xl md:text-[1.7rem] font-bold text-gradient-gold"><Counter to={stat.n} suffix={stat.s} /></div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: floating parallax product card */}
          <div className="hidden lg:flex justify-center"
            onMouseMove={e => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set(((e.clientX - r.left) / r.width - 0.5) * 16);
              my.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
            }}
            onMouseLeave={() => { mx.set(0); my.set(0); }}>
            <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
              className="animate-float relative bg-white rounded-3xl shadow-2xl p-6 w-72">
              <div className="absolute -top-3 -right-3 bg-gold-gradient text-[hsl(24,14%,8%)] text-[11px] font-bold px-3 py-1 rounded-full shadow-gold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured
              </div>
              <div className="rounded-2xl overflow-hidden mb-4 bg-stone-100">
                <img src={heroFeatureImage} alt={heroFeatureName} className="w-full h-40 bg-white object-contain p-3" />
              </div>
              <div className="text-sm font-black text-gray-900 mb-1 line-clamp-2">{heroFeatureName}</div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[hsl(38,52%,52%)] text-[hsl(38,52%,52%)]" />)}
                <span className="text-[11px] text-gray-400 ml-1">({heroFeatureReviews})</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-[hsl(24,10%,16%)]">₹{Number(heroFeaturePrice).toLocaleString("en-IN")}</span>
                {heroFeatureMrp > heroFeaturePrice && <>
                  <span className="text-sm text-gray-400 line-through">₹{Number(heroFeatureMrp).toLocaleString("en-IN")}</span>
                  <span className="text-[11px] font-bold text-green-600">{Math.round((1 - heroFeaturePrice / heroFeatureMrp) * 100)}% OFF</span>
                </>}
              </div>
              <Link href={heroFeatureLink}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="gold-sheen w-full bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-1.5">
                  Explore Now <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

      </section>

      {/* ══════════ MARQUEE STRIP ══════════ */}
      <div className="bg-[hsl(24,10%,16%)] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="inline-flex items-center text-white/90 text-sm font-bold mx-6 uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 mr-2 text-[hsl(42,62%,68%)]" /> {w}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ GRAB BEST DEAL ══════════ */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal><SectionHeader title="Grab the best deal on" accent="Faucets" href="/products?category=cp-faucets" icon={Tag} /></Reveal>
          <div className="relative">
            <button onClick={() => scrollFaucets("left")} aria-label="Scroll deals left" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center hover:bg-[hsl(24,10%,16%)] hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div ref={faucetScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pt-3 -mt-3 pb-2 scroll-smooth">
              {cpDealsLoading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="w-44 h-72 flex-shrink-0 rounded-2xl" />) :
                (cpFaucetDeals?.products || []).map((p, idx) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="flex-shrink-0 w-44">
                    <Link href={`/products/${p.slug}`}>
                      <motion.div whileHover={{ y: -8 }} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(28,22,16,0.25)] hover:border-[hsl(24,10%,16%)]/40 transition-shadow" data-testid={`card-deal-${p.id}`}>
                        <div className="relative overflow-hidden">
                          {p.discount && p.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,24%)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">-{p.discount}%</span>
                          )}
                          <img loading="lazy" decoding="async" src={p.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=160&fit=crop"} alt={p.name} className="w-full aspect-square object-contain bg-white hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-3">
                          <SkuBadge sku={p.sku} className="mb-1" />
                          <div className="text-xs font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2">{p.name}</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-sm text-gray-900">₹{Number(p.price).toLocaleString("en-IN")}</span>
                            {p.mrp && <span className="text-[9px] text-gray-400 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
            </div>
            <button onClick={() => scrollFaucets("right")} aria-label="Scroll deals right" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center hover:bg-[hsl(24,10%,16%)] hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ TOP CATEGORIES ══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fcfaf7] to-stone-100/60 py-11 md:py-14 border-b">
        <div className="pointer-events-none absolute -top-24 right-[8%] h-64 w-64 rounded-full bg-[hsl(38,52%,52%)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-[12%] h-72 w-72 rounded-full bg-stone-200/50 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4">
          <Reveal><SectionHeader title="Shop From" accent="Top Categories" href="/products" icon={Package} /></Reveal>
          {catsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-44 md:h-52 rounded-[1.35rem]" />)}</div>
          ) : (
            <div className="relative grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
              {catList.map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/products?category=${cat.slug}`} data-testid={`card-category-${cat.id}`}>
                    <motion.div whileHover={{ y: -7 }} className="group cursor-pointer">
                      <div className="relative aspect-[0.88] overflow-hidden rounded-[1.35rem] border border-white bg-stone-100 shadow-[0_8px_24px_-16px_rgba(28,22,16,0.55)] transition-all duration-500 group-hover:border-[hsl(38,52%,52%)]/50 group-hover:shadow-[0_18px_34px_-16px_rgba(28,22,16,0.42)]">
                        <img loading="lazy" decoding="async" src={categoryImages[cat.slug] || cat.imageUrl || "/images/categories/cp-faucets.webp"} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(24,12%,8%)]/65 via-transparent to-white/10 opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                        <span className="absolute left-2.5 top-2.5 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/70 bg-white/75 px-1.5 text-[10px] font-black text-[hsl(24,10%,16%)] shadow-sm backdrop-blur-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="absolute bottom-2.5 left-2.5 right-2.5 translate-y-1 text-[11px] font-bold leading-tight text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          Explore collection <ArrowRight className="ml-0.5 inline-block h-3 w-3" />
                        </span>
                      </div>
                      <div className="px-1 pt-3">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-bold leading-tight text-gray-800 transition-colors group-hover:text-[hsl(24,10%,16%)]">{cat.name}</span>
                          <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-[hsl(38,52%,52%)] transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.12em] text-gray-400">
                          {cat.productCount.toLocaleString("en-IN")} products
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════ COLLECTIONS ══════════ */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal><SectionHeader title="Explore Our" accent="Collections" href="/products" icon={Sparkles} /></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {collectionCards.map((col, i) => (
              <Reveal key={col.slug} delay={i * 0.1}>
                <Link href={`/products?category=${col.slug}`}>
                  <motion.div whileHover={{ y: -8 }} className="relative rounded-3xl overflow-hidden h-56 group cursor-pointer shadow-md hover:shadow-2xl transition-shadow" data-testid={`card-collection-${col.slug}`}>
                    <img loading="lazy" decoding="async" src={col.img} alt={col.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(24,12%,7%)]/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5 text-white w-full">
                      <div className="font-black text-lg mb-0.5">{col.title}</div>
                      <div className="text-xs text-white/70 mb-3">{col.sub}</div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {col.chips.map(chip => (
                          <span key={chip} className="text-[10px] font-medium text-white glass px-2 py-0.5 rounded-full">{chip}</span>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-300 group-hover:gap-2.5 transition-all">
                        Explore Now <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BEST SELLERS + NEW ARRIVALS ══════════ */}
      <section className="bg-gradient-to-b from-stone-100/60 to-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          {/* Best Sellers */}
          <Reveal>
            <SectionHeader title="Best" accent="Sellers" href="/products" icon={Award} />
            {tankShowcaseLoading ? (
              <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
            ) : verifiedTankProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {verifiedTankProducts.map(p => (
                  <Link key={p.id} href={`/products/${p.slug}`}>
                    <motion.div whileHover={{ y: -6 }} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-[hsl(38,52%,52%)]/60 hover:shadow-xl" data-testid={`card-bestseller-${p.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-stone-50 to-white p-3">
                        <span className="absolute left-2 top-2 z-10 rounded-full bg-gold-gradient px-2 py-0.5 text-[9px] font-bold text-[hsl(24,14%,8%)]">Bestseller</span>
                        <img loading="lazy" decoding="async" src={p.imageUrl!} alt={p.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute bottom-2 left-2 rounded-full bg-[hsl(24,10%,16%)]/85 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">{p.categoryName}</span>
                      </div>
                      <div className="p-3.5">
                        <SkuBadge sku={p.sku} className="mb-2" />
                        <div className="mb-2 min-h-9 text-xs font-semibold leading-tight text-gray-800 line-clamp-2">{p.name}</div>
                        <div className="mb-2 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-0.5 text-[hsl(38,52%,52%)]">{[...Array(5)].map((_, i) => <Star key={i} className={`h-2.5 w-2.5 ${i < Math.round(p.rating) ? "fill-current" : ""}`} />)}</span>
                          <span className="text-[9px] font-semibold text-gray-500">{p.rating.toFixed(1)} · {p.reviewCount} reviews</span>
                        </div>
                        <div className="mb-3 flex items-baseline gap-1.5"><span className="text-base font-black text-[hsl(24,10%,16%)]">₹{Number(p.price).toLocaleString("en-IN")}</span>{p.mrp > p.price && <span className="text-[9px] text-gray-400 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>}</div>
                        <AddToCartButton productId={p.id} productName={p.name} />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Verified product photos are being added to this collection.</div>
            )}
          </Reveal>

          {/* New Arrivals */}
          <Reveal delay={0.15}>
            <SectionHeader title="New" accent="Arrivals" href="/products" icon={Sparkles} />
            {cpDealsLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
            ) : verifiedFaucetProducts.length > 0 ? (
              <div className="space-y-2.5">
                {verifiedFaucetProducts.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <Link href={`/products/${p.slug}`}>
                      <div className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm transition-all hover:border-[hsl(38,52%,52%)]/60 hover:shadow-md" data-testid={`card-new-arrival-${p.id}`}>
                        <div className="flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-stone-50 to-white p-2">
                          <img loading="lazy" decoding="async" src={p.imageUrl!} alt={p.name} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <SkuBadge sku={p.sku} className="mb-1" />
                          <div className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800 transition-colors group-hover:text-[hsl(24,10%,16%)]">{p.name}</div>
                          <div className="mt-1 flex items-center gap-1.5"><span className="text-[10px] font-semibold text-gray-500">{p.categoryName}</span><span className="h-1 w-1 rounded-full bg-gray-300" /><span className="inline-flex items-center gap-0.5 text-[hsl(38,52%,52%)]"><Star className="h-2.5 w-2.5 fill-current" /> <span className="text-[9px]">{p.rating.toFixed(1)}</span></span></div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black text-sm text-[hsl(24,10%,16%)]">₹{Number(p.price).toLocaleString("en-IN")}</div>
                          {p.mrp > p.price && <div className="text-[9px] text-gray-400 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</div>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Verified product photos are being added to this collection.</div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ══════════ SHOP BY ROOM ══════════ */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal><SectionHeader title="Shop By" accent="Room" /></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roomCards.map((room, i) => (
              <Reveal key={room.label} delay={i * 0.08}>
                <Link href={`/products?category=${room.slug}`}>
                  <motion.div whileHover={{ y: -8 }} className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer shadow-md hover:shadow-2xl transition-shadow" data-testid={`card-room-${room.label.toLowerCase().replace(/ /g, "-")}`}>
                    <img loading="lazy" decoding="async" src={room.img} alt={room.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(24,12%,7%)]/85 to-transparent group-hover:from-[hsl(24,10%,13%)]/85 transition-colors" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <div className="font-black text-base">{room.label}</div>
                      <div className="text-xs text-white/80 flex items-center gap-1 mt-0.5 group-hover:gap-2 transition-all">Explore <ArrowRight className="w-3 h-3" /></div>
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRUST STRIP ══════════ */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {trustItems.map(({ label, sub }, i) => {
            const Icon = trustIcons[i % trustIcons.length];
            return (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(24,10%,16%)]/10 to-[hsl(24,9%,26%)]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[hsl(24,10%,16%)] group-hover:to-[hsl(24,9%,26%)] transition-colors">
                <Icon className="w-5 h-5 text-[hsl(24,10%,16%)] group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-900 leading-tight">{label}</div>
                <div className="text-[10px] text-gray-400 leading-tight">{sub}</div>
              </div>
            </motion.div>
          );})}
        </div>
      </section>

      {/* ══════════ DEALER CTA ══════════ */}
      <section className="relative bg-gradient-to-br from-[hsl(24,12%,7%)] via-[hsl(24,10%,10%)] to-[hsl(24,10%,12%)] py-14 overflow-hidden">
        <div className="absolute top-[-80px] right-[8%] w-80 h-80 bg-[hsl(38,52%,52%)]/20 blur-3xl animate-blob" />
        <div className="relative max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="text-xs font-semibold text-[hsl(42,62%,68%)] uppercase tracking-[0.25em] mb-3">Become A Partner</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Become A <span className="italic text-gradient-gold">Prayag Dealer</span></h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-md">Grow your business with premium products and exclusive dealer benefits. Join 10,000+ partners across India.</p>
            <div className="grid grid-cols-2 gap-3 mb-7 max-w-md">
              {["Exclusive Dealer Discounts", "Special Schemes", "Marketing Support", "Priority Service"].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-stone-200">
                  <div className="w-5 h-5 rounded-full bg-[hsl(24,9%,26%)] flex items-center justify-center flex-shrink-0"><BadgeCheck className="w-3 h-3 text-white" /></div>{b}
                </div>
              ))}
            </div>
            <Link href="/dealer-registration">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="shimmer-hover bg-white text-[hsl(24,10%,16%)] font-bold px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2" data-testid="button-dealer-cta">
                Register Now <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="hidden md:block">
            <motion.img whileHover={{ scale: 1.03 }} loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=340&fit=crop" alt="Become a Dealer" className="w-full h-72 object-cover rounded-3xl shadow-2xl" />
          </Reveal>
        </div>
      </section>

      {/* ══════════ NEWSLETTER ══════════ */}
      <section className="bg-[hsl(24,14%,8%)] py-9 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 gold-divider" />
        <div className="relative max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center flex-shrink-0"><Droplets className="w-6 h-6 text-[hsl(24,14%,8%)]" /></div>
            <div>
              <div className="font-display text-xl font-bold">Join the Prayag Circle</div>
              <div className="text-stone-400 text-xs">Get the latest updates on new products & offers</div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="email" placeholder="Enter your email address" className="flex-1 sm:w-72 border border-white/10 bg-white/5 rounded-xl px-4 py-3 text-sm outline-none text-white placeholder:text-gray-500 focus:border-[hsl(38,52%,52%)]/50" />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="gold-sheen bg-gold-gradient text-[hsl(24,14%,8%)] font-bold px-6 py-3 rounded-xl text-sm whitespace-nowrap">Subscribe</motion.button>
          </div>
        </div>
      </section>

    </div>
  );
}
