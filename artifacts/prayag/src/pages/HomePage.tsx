import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { ArrowRight, ChevronRight, ChevronLeft, Shield, Truck, Award, RefreshCw, BadgeCheck, Headphones, Tag, Star, Droplets, Sparkles, Package } from "lucide-react";
import { getListProductsQueryOptions, useListCategoriesWithCounts, useListProducts, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
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

function selectCategoryShowcaseProducts<T extends { imageUrl?: string | null; categoryName?: string | null }>(products: T[], perCategory: number) {
  const productsByCategory = new Map<string, T[]>();
  for (const product of products) {
    if (!product.imageUrl || !product.categoryName) continue;
    const category = product.categoryName.trim().toLowerCase();
    const categoryProducts = productsByCategory.get(category) ?? [];
    if (categoryProducts.length < perCategory) categoryProducts.push(product);
    productsByCategory.set(category, categoryProducts);
  }

  const selected: T[] = [];
  for (let index = 0; index < perCategory; index++) {
    for (const categoryProducts of productsByCategory.values()) {
      if (categoryProducts[index]) selected.push(categoryProducts[index]);
    }
  }
  return selected;
}

export default function HomePage() {
  const { data: categories, isLoading: catsLoading } = useListCategoriesWithCounts();
  const { data: cpFaucetDeals } = useListProducts({ category: "cp-faucets", sortBy: "photo_ready", limit: 14 });
  const collectionQueries = useQueries({
    queries: (categories ?? [])
      .filter((category) => category.productCount > 0)
      .map((category) => getListProductsQueryOptions({
        category: category.slug,
        sortBy: "photo_ready",
        limit: 6,
      })),
  });
  const showcaseScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { section } = useSiteContent();
  const hero = section("hero");
  const heroFeatureProduct = cpFaucetDeals?.products.find((product) => Boolean(product.imageUrl));
  const collectionProducts = collectionQueries.flatMap((query) => query.data?.products ?? []);
  const showcaseLoading = catsLoading || collectionQueries.some((query) => query.isLoading);
  const categoryShowcaseProducts = selectCategoryShowcaseProducts(collectionProducts, 6);
  const bestSellerProducts = categoryShowcaseProducts.slice(0, 4);
  const newArrivalProducts = categoryShowcaseProducts.slice(4, 12);
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

  function scrollShowcase(dir: "left" | "right") {
    showcaseScrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }

  useEffect(() => {
    const track = showcaseScrollRef.current;
    if (!track || categoryShowcaseProducts.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let previousTime = performance.now();
    const tick = (time: number) => {
      const elapsed = Math.min(time - previousTime, 80);
      previousTime = time;
      const loopWidth = track.scrollWidth / 2;

      if (loopWidth > track.clientWidth) {
        track.scrollLeft += elapsed * 0.035;
        if (track.scrollLeft >= loopWidth) track.scrollLeft -= loopWidth;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [categoryShowcaseProducts.length]);

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

      {/* ══════════ ALL-CATEGORY SHOWCASE ══════════ */}
      <section className="relative overflow-hidden border-b bg-white py-10 md:py-12">
        <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-[hsl(38,52%,52%)]/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4">
          <Reveal>
            <div className="relative mb-7 flex items-end justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(38,52%,52%)]">
                  <span className="h-px w-8 bg-[hsl(38,52%,52%)]" /> Curated collection highlights
                </p>
                <h2 className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-[2.1rem]">
                  Discover the <span className="text-gradient-gold italic">Prayag Edit</span>
                </h2>
                <div className="mt-2.5 h-[2px] w-16 rounded-full bg-gradient-to-r from-[hsl(38,52%,52%)] to-transparent" />
                <p className="mt-3 text-sm text-gray-500">A moving selection of photo-ready favourites across our collections.</p>
              </div>
              <Link href="/products" className="group mb-2 hidden items-center gap-1.5 text-sm font-semibold text-[hsl(24,10%,16%)] transition-all hover:gap-2.5 sm:flex">
                View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
          <div className="relative">
            <button onClick={() => scrollShowcase("left")} aria-label="Scroll showcase left" className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white shadow-lg transition-colors hover:bg-[hsl(24,10%,16%)] hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div
              ref={showcaseScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 pt-3 scroll-smooth"
              aria-label="All-category product carousel"
            >
              {showcaseLoading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 w-52 flex-shrink-0 rounded-2xl" />) :
                categoryShowcaseProducts.length > 0 ? [...categoryShowcaseProducts, ...categoryShowcaseProducts].map((p, idx) => (
                  <motion.div key={`${p.id}-${idx}`} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: (idx % 18) * 0.05 }} className="w-52 flex-shrink-0 md:w-60">
                    <Link href={`/products/${p.slug}`}>
                      <motion.div whileHover={{ y: -8 }} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(28,22,16,0.25)] hover:border-[hsl(24,10%,16%)]/40 transition-shadow" data-testid={idx < categoryShowcaseProducts.length ? `card-deal-${p.id}` : `card-deal-loop-${p.id}`}>
                        <div className="relative aspect-[1.08] overflow-hidden bg-gradient-to-b from-stone-50 to-white">
                          {p.discount && p.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,24%)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">-{p.discount}%</span>
                          )}
                          <span className="absolute right-2 top-2 z-10 rounded-full border border-[hsl(38,52%,52%)]/30 bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[hsl(38,52%,42%)] shadow-sm backdrop-blur-sm">{p.categoryName}</span>
                          <img loading="lazy" decoding="async" src={p.imageUrl!} alt={p.name} className="h-full w-full object-contain bg-white transition-transform duration-500 group-hover:scale-110" />
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
                )) : (
                  <div className="w-full rounded-2xl border border-dashed border-gray-200 bg-stone-50 p-8 text-center text-sm text-gray-500">Verified product photos are being added across our collections.</div>
                )}
            </div>
            <button onClick={() => scrollShowcase("right")} aria-label="Scroll showcase right" className="absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white shadow-lg transition-colors hover:bg-[hsl(24,10%,16%)] hover:text-white">
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
          <Reveal>
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(38,52%,52%)]">
                  <span className="h-px w-8 bg-[hsl(38,52%,52%)]" /> Curated collections
                </p>
                <SectionHeader title="Shop From" accent="Top Categories" icon={Package} />
              </div>
              <Link href="/products" className="group mb-2 hidden items-center gap-1.5 text-sm font-semibold text-[hsl(24,10%,16%)] transition-all hover:gap-2.5 sm:flex">
                View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
          {catsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[1.25] rounded-[1.6rem]" />)}</div>
          ) : (
            <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {catList.map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="group"
                    onMouseEnter={() => setHoveredCategory(cat.slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onFocus={() => setHoveredCategory(cat.slug)}
                    onBlur={() => setHoveredCategory(null)}
                    data-testid={`card-category-${cat.id}`}
                  >
                    <motion.div whileHover={{ y: -7 }} className="cursor-pointer">
                      <div className={`relative aspect-[1.25] overflow-hidden rounded-[1.6rem] border border-white bg-stone-100 shadow-[0_12px_28px_-16px_rgba(28,22,16,0.55)] transition-all duration-500 ${hoveredCategory === cat.slug ? "border-[hsl(38,52%,52%)]/60 shadow-[0_22px_38px_-16px_rgba(28,22,16,0.42)]" : ""}`}>
                        <img loading="lazy" decoding="async" src={categoryImages[cat.slug] || cat.imageUrl || "/images/categories/cp-faucets.webp"} alt={cat.name} className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${hoveredCategory === cat.slug ? "scale-110" : ""}`} />
                        <div className={`absolute inset-0 bg-gradient-to-t from-[hsl(24,12%,8%)]/80 via-[hsl(24,12%,8%)]/5 to-white/15 transition-opacity duration-500 ${hoveredCategory === cat.slug ? "opacity-100" : "opacity-80"}`} />
                        <span className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 px-2 text-[10px] font-black text-[hsl(24,10%,16%)] shadow-sm backdrop-blur-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`absolute bottom-4 left-4 right-4 text-xs font-bold leading-tight text-white transition-all duration-300 ${hoveredCategory === cat.slug ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                          Explore collection <ArrowRight className="ml-1 inline-block h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3 px-1 pt-3.5">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-sm font-bold leading-tight text-gray-800 transition-colors group-hover:text-[hsl(24,10%,16%)]">{cat.name}</span>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(38,52%,52%)] transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <span className="mt-1 block px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400">
                          {cat.productCount.toLocaleString("en-IN")} products
                      </span>
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
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-stone-100/60 to-white py-10 md:py-12">
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[hsl(38,52%,52%)]/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto grid gap-8 px-4 md:grid-cols-2">
          {/* Best Sellers */}
          <Reveal>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/75 p-4 shadow-[0_18px_40px_-30px_rgba(28,22,16,0.5)] backdrop-blur-sm md:p-5">
            <SectionHeader title="Best Picks Across" accent="Categories" href="/products" icon={Award} />
            {showcaseLoading ? (
              <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
            ) : bestSellerProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {bestSellerProducts.map(p => (
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
            </div>
          </Reveal>

          {/* New Arrivals */}
          <Reveal delay={0.15}>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/75 p-4 shadow-[0_18px_40px_-30px_rgba(28,22,16,0.5)] backdrop-blur-sm md:p-5">
            <SectionHeader title="Fresh From" accent="The Collection" href="/products" icon={Sparkles} />
            {showcaseLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
            ) : newArrivalProducts.length > 0 ? (
              <div className="space-y-2.5">
                {newArrivalProducts.map((p, i) => (
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
            </div>
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
