import { useState, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, ChevronLeft, Shield, Truck, Award, RefreshCw, BadgeCheck, Headphones, Tag, Star } from "lucide-react";
import { useListCategoriesWithCounts, useListFeaturedProducts, useListNewArrivals } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const BLUE = "hsl(215,100%,34%)";

const categoryImages: Record<string, string> = {
  "cp-faucets": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&h=300&fit=crop",
  "ptmt-faucets": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&h=300&fit=crop",
  "sanitaryware": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=300&h=300&fit=crop",
  "kitchen-sinks": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
  "water-heaters": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
  "bathroom-accessories": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&h=300&fit=crop",
  "pipes-fittings": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop",
  "flush-tanks": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=300&h=300&fit=crop",
};

const collectionCards = [
  {
    title: "Premium Faucet Collection",
    sub: "Crafted to perfection",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop",
    chips: ["Royale Series", "Elegance Series", "Aqua Series"],
    slug: "cp-faucets",
  },
  {
    title: "Luxury Bathroom Collection",
    sub: "Luxury that lasts",
    img: "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=600&h=400&fit=crop",
    chips: ["Wall Hung Closets", "Wash Basins", "Concealed Cisterns"],
    slug: "sanitaryware",
  },
  {
    title: "Kitchen Collection",
    sub: "Functional. Durable. Stylish.",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    chips: ["Stainless Steel Sinks", "Sink Mixers", "Drain Systems"],
    slug: "kitchen-sinks",
  },
];

const roomCards = [
  { label: "Bathroom", img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop", slug: "sanitaryware" },
  { label: "Kitchen", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", slug: "kitchen-sinks" },
  { label: "Utility Area", img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop", slug: "pipes-fittings" },
  { label: "Commercial Space", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop", slug: "cp-faucets" },
];

const trustItems = [
  { icon: BadgeCheck, label: "100% Original Products", sub: "Sourcing directly" },
  { icon: RefreshCw, label: "Easy Returns", sub: "Hassle Free Returns\nWithin 7 Days" },
  { icon: Shield, label: "Secure Payments", sub: "Multiple Options" },
  { icon: Tag, label: "Best Price", sub: "Guaranteed Best Price\nOn All Products" },
  { icon: Headphones, label: "Expert Support", sub: "We are here to\nhelp you 24x7" },
];

function SectionHeader({ title, accent, href }: { title: string; accent?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {title}{" "}
          {accent && <span className="text-[hsl(215,100%,34%)]">{accent}</span>}
        </h2>
        <div className="w-10 h-0.5 bg-[hsl(215,100%,34%)] mt-1.5 rounded-full" />
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-[hsl(215,100%,34%)] flex items-center gap-1 hover:underline">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { data: categories, isLoading: catsLoading } = useListCategoriesWithCounts();
  const { data: featured, isLoading: featLoading } = useListFeaturedProducts();
  const { data: newArrivals, isLoading: newLoading } = useListNewArrivals();
  const [heroSlide] = useState(0);
  const faucetScrollRef = useRef<HTMLDivElement>(null);

  function scrollFaucets(dir: "left" | "right") {
    if (faucetScrollRef.current) {
      faucetScrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  }

  const catList = (categories && categories.length > 0) ? categories : [
    { id: 1, name: "CP Faucets", slug: "cp-faucets", productCount: 12 },
    { id: 2, name: "PTMT Faucets", slug: "ptmt-faucets", productCount: 8 },
    { id: 3, name: "Sanitaryware", slug: "sanitaryware", productCount: 15 },
    { id: 4, name: "Kitchen Sinks", slug: "kitchen-sinks", productCount: 6 },
    { id: 5, name: "Water Heaters", slug: "water-heaters", productCount: 5 },
    { id: 6, name: "Bathroom Accessories", slug: "bathroom-accessories", productCount: 20 },
    { id: 7, name: "Pipes & Fittings", slug: "pipes-fittings", productCount: 10 },
    { id: 8, name: "Flush Tanks", slug: "flush-tanks", productCount: 7 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ────── HERO ────── */}
      <section className="relative bg-[hsl(215,100%,20%)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&h=600&fit=crop"
          alt="Bathroom"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-7xl mx-auto px-4 py-14 flex items-center gap-8">
          {/* Left Content */}
          <div className="flex-1 text-white max-w-lg">
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
              Complete Bathroom &<br />Plumbing{" "}
              <span className="text-blue-300">Solutions</span>
            </h1>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Premium faucets, sanitaryware,<br className="hidden md:block" /> kitchen sinks & water heaters.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/products">
                <button className="bg-[hsl(215,100%,34%)] text-white font-bold px-6 py-2.5 rounded-md hover:bg-[hsl(215,100%,28%)] transition-colors flex items-center gap-2 text-sm" data-testid="button-shop-now">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dealer-registration">
                <button className="border border-white/70 text-white font-bold px-6 py-2.5 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2 text-sm" data-testid="button-become-dealer">
                  Become Dealer <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Award, label: "4500+", sub: "Products" },
                { icon: Truck, label: "Pan India", sub: "Network" },
                { icon: Shield, label: "Premium", sub: "Quality" },
                { icon: Award, label: "Fast", sub: "Delivery" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-bold text-white">{label}</div>
                    <div className="text-blue-200">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured Product Card */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 w-52 text-center">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Featured</div>
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=180&fit=crop"
                alt="Royale Series Basin Mixer"
                className="w-full h-28 object-cover rounded-lg mb-3"
              />
              <div className="text-xs font-bold text-gray-900 mb-1">Royale Series<br />Basin Mixer</div>
              <div className="text-[10px] text-gray-400 mb-2">Starting from</div>
              <div className="text-lg font-black text-[hsl(215,100%,34%)]">₹2,499</div>
              <Link href="/products?category=cp-faucets">
                <button className="mt-3 w-full bg-[hsl(215,100%,34%)] text-white text-xs font-bold py-1.5 rounded-md hover:bg-[hsl(215,100%,28%)] transition-colors flex items-center justify-center gap-1">
                  Explore Now <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slider dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`rounded-full transition-all ${heroSlide === i ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
          ))}
        </div>
      </section>

      {/* ────── GRAB BEST DEAL ON FAUCETS ────── */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader title="Grab the best deal on" accent="Faucets" href="/products?category=cp-faucets" />
          <div className="relative">
            <button onClick={() => scrollFaucets("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div ref={faucetScrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
              {featLoading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="w-40 h-64 flex-shrink-0 rounded-xl" />) :
                (featured || []).slice(0, 10).map(p => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="flex-shrink-0 w-40">
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-[hsl(215,100%,34%)] transition-all" data-testid={`card-deal-${p.id}`}>
                      <div className="relative">
                        {p.discountPercentage && p.discountPercentage > 0 && (
                          <span className="absolute top-2 left-2 bg-[hsl(215,100%,34%)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                            -{p.discountPercentage}%
                          </span>
                        )}
                        <img src={p.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=160&fit=crop"}
                          alt={p.name} className="w-full h-32 object-cover" />
                      </div>
                      <div className="p-2.5">
                        <div className="text-[9px] text-gray-400 font-mono mb-1">{p.sku}</div>
                        <div className="text-xs font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2">{p.name}</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm text-gray-900">₹{Number(p.price).toLocaleString("en-IN")}</span>
                          {p.originalPrice && <span className="text-[9px] text-gray-400 line-through">₹{Number(p.originalPrice).toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
            <button onClick={() => scrollFaucets("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* ────── SHOP FROM TOP CATEGORIES ────── */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader title="Shop From" accent="Top Categories" href="/products" />
          {catsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="w-24 h-24 flex-shrink-0 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {catList.map(cat => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} data-testid={`card-category-${cat.id}`}>
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[hsl(215,100%,34%)] transition-all">
                      <img
                        src={categoryImages[cat.slug] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop"}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center leading-tight group-hover:text-[hsl(215,100%,34%)] transition-colors">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────── EXPLORE OUR COLLECTIONS ────── */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader title="Explore Our" accent="Collections" href="/products" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {collectionCards.map(col => (
              <Link key={col.slug} href={`/products?category=${col.slug}`}>
                <div className="relative rounded-xl overflow-hidden h-44 group cursor-pointer" data-testid={`card-collection-${col.slug}`}>
                  <img src={col.img} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <div className="font-bold text-sm">{col.title}</div>
                    <div className="text-xs text-white/70 mb-2">{col.sub}</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-200 hover:text-white transition-colors">
                      Explore Now <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Sub-chips row */}
          <div className="grid grid-cols-3 gap-4">
            {collectionCards.map(col => (
              <div key={col.slug} className="flex gap-2 flex-wrap">
                {col.chips.map(chip => (
                  <Link key={chip} href={`/products?category=${col.slug}`}>
                    <span className="text-[10px] font-medium text-gray-600 bg-gray-100 hover:bg-[hsl(215,100%,34%)]/10 hover:text-[hsl(215,100%,34%)] px-2.5 py-1 rounded-full cursor-pointer transition-colors">
                      {chip}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── BEST SELLERS + NEW ARRIVALS ────── */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Best Sellers */}
            <div>
              <SectionHeader title="Best Sellers" href="/products" />
              {featLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(featured || []).slice(0, 4).map(p => (
                    <Link key={p.id} href={`/products/${p.slug}`}>
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-[hsl(215,100%,34%)] transition-all" data-testid={`card-bestseller-${p.id}`}>
                        <div className="relative">
                          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Bestseller</span>
                          <img src={p.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=160&fit=crop"}
                            alt={p.name} className="w-full h-28 object-cover" />
                        </div>
                        <div className="p-2.5">
                          <div className="text-[9px] text-gray-400 font-mono">{p.sku}</div>
                          <div className="text-xs font-semibold text-gray-800 leading-tight mt-0.5 mb-1 line-clamp-1">{p.name}</div>
                          <div className="flex items-center gap-1 mb-1.5">
                            {[...Array(4)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                            <span className="text-[9px] text-gray-400">({Math.floor(Math.random() * 200 + 50)})</span>
                          </div>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="font-black text-sm text-[hsl(215,100%,34%)]">₹{Number(p.price).toLocaleString("en-IN")}</span>
                            {p.originalPrice && <span className="text-[9px] text-gray-400 line-through">₹{Number(p.originalPrice).toLocaleString("en-IN")}</span>}
                          </div>
                          <button className="w-full bg-[hsl(215,100%,34%)] text-white text-[10px] font-bold py-1.5 rounded-md hover:bg-[hsl(215,100%,28%)] transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* New Arrivals */}
            <div>
              <SectionHeader title="New Arrivals" href="/products" />
              {newLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(newArrivals || []).slice(0, 5).map(p => (
                    <Link key={p.id} href={`/products/${p.slug}`}>
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-2.5 hover:border-[hsl(215,100%,34%)] hover:bg-white transition-all" data-testid={`card-new-arrival-${p.id}`}>
                        <img src={p.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=80&h=80&fit=crop"}
                          alt={p.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] text-gray-400 font-mono">{p.sku}</div>
                          <div className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(4)].map((_, i) => <Star key={i} className="w-2 h-2 fill-amber-400 text-amber-400" />)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black text-sm text-[hsl(215,100%,34%)]">₹{Number(p.price).toLocaleString("en-IN")}</div>
                          {p.originalPrice && <div className="text-[9px] text-gray-400 line-through">₹{Number(p.originalPrice).toLocaleString("en-IN")}</div>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────── SHOP BY ROOM ────── */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader title="Shop By Room" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roomCards.map(room => (
              <Link key={room.label} href={`/products?category=${room.slug}`}>
                <div className="relative rounded-xl overflow-hidden h-36 group cursor-pointer" data-testid={`card-room-${room.label.toLowerCase().replace(/ /g, "-")}`}>
                  <img src={room.img} alt={room.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3 text-white">
                    <div className="font-bold text-sm">{room.label}</div>
                    <div className="text-xs text-white/70 flex items-center gap-1 mt-0.5">Explore <ArrowRight className="w-2.5 h-2.5" /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────── TRUST STRIP ────── */}
      <section className="bg-white py-6 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {trustItems.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[hsl(215,100%,34%)]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[hsl(215,100%,34%)]" />
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900 leading-tight">{label}</div>
                  <div className="text-[10px] text-gray-400 leading-tight whitespace-pre-line">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── DEALER CTA ────── */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-white">
            <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-2">Become A Partner</div>
            <h2 className="text-2xl font-black mb-2">Become A Prayag Dealer</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Grow your business with premium products and exclusive dealer benefits.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
              {["Exclusive Dealer Discounts", "Special Schemes", "Marketing Support", "Priority Service"].map(b => (
                <div key={b} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[hsl(215,100%,60%)] rounded-full" />
                  {b}
                </div>
              ))}
            </div>
            <Link href="/dealer-registration">
              <button className="bg-[hsl(215,100%,34%)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] transition-colors flex items-center gap-2" data-testid="button-dealer-cta">
                Register Now <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="hidden md:block flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=280&fit=crop"
              alt="Become a Dealer"
              className="w-80 h-48 object-cover rounded-xl opacity-80"
            />
          </div>
        </div>
      </section>

      {/* ────── NEWSLETTER ────── */}
      <section className="bg-[hsl(215,100%,34%)] py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <div className="font-bold text-sm">Subscribe to our newsletter</div>
            <div className="text-blue-200 text-xs">Get the latest updates on new products and offers</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 sm:w-72 border-0 rounded-lg px-4 py-2 text-sm outline-none text-gray-900"
            />
            <button className="bg-gray-900 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-black transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
