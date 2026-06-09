import { Link } from "wouter";
import { ArrowRight, Shield, Truck, Award, Users, Star, ChevronRight } from "lucide-react";
import { useListCategoriesWithCounts, useListFeaturedProducts, useListNewArrivals, useListBanners } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  { icon: Award, label: "4500+ Products", sub: "Extensive catalog" },
  { icon: Truck, label: "Pan India Network", sub: "Fast delivery" },
  { icon: Shield, label: "Premium Quality", sub: "ISI Certified" },
  { icon: Users, label: "10,000+ Dealers", sub: "Nationwide" },
];

const categoryImages: Record<string, string> = {
  "cp-faucets": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop",
  "ptmt-faucets": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
  "sanitaryware": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&h=300&fit=crop",
  "kitchen-sinks": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  "water-heaters": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "bathroom-accessories": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
  "pipes-fittings": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop",
  "flush-tanks": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&h=300&fit=crop",
};

const testimonials = [
  { name: "Rajesh Kumar", role: "Architect, Delhi", text: "PRAYAG products have been our go-to choice for over 5 years. Exceptional quality and great after-sales service.", rating: 5 },
  { name: "Priya Sharma", role: "Interior Designer, Mumbai", text: "The CP faucets look stunning and last long. My clients are always impressed with the finish and build quality.", rating: 5 },
  { name: "Amit Patel", role: "Contractor, Ahmedabad", text: "Best plumbing brand for commercial projects. Competitive pricing and on-time delivery every single time.", rating: 4 },
];

export default function HomePage() {
  const { data: categories, isLoading: catsLoading } = useListCategoriesWithCounts();
  const { data: featured, isLoading: featLoading } = useListFeaturedProducts();
  const { data: newArrivals, isLoading: newLoading } = useListNewArrivals();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[hsl(215,100%,34%)] via-[hsl(215,100%,28%)] to-[hsl(222,47%,15%)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              India's Premier Plumbing Brand
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
              Elevate Your<br />
              <span className="text-blue-200">Bathroom Experience</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              4500+ premium plumbing and sanitaryware products. Trusted by 10,000+ dealers across India. Built to last a lifetime.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <button className="bg-white text-[hsl(215,100%,34%)] font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2" data-testid="button-shop-now">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dealer-registration">
                <button className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors" data-testid="button-become-dealer">
                  Become a Dealer
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop"
            alt="Premium Bathroom"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 bg-[hsl(215,100%,34%)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[hsl(215,100%,34%)]" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">{label}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Browse our complete range of plumbing products</p>
          </div>
          <Link href="/products" className="text-[hsl(215,100%,34%)] text-sm font-medium flex items-center gap-1 hover:underline">
            All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {catsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(categories && categories.length > 0 ? categories : [
              { id: 1, name: "CP Faucets", slug: "cp-faucets", imageUrl: null, productCount: 0 },
              { id: 2, name: "PTMT Faucets", slug: "ptmt-faucets", imageUrl: null, productCount: 0 },
              { id: 3, name: "Sanitaryware", slug: "sanitaryware", imageUrl: null, productCount: 0 },
              { id: 4, name: "Kitchen Sinks", slug: "kitchen-sinks", imageUrl: null, productCount: 0 },
              { id: 5, name: "Water Heaters", slug: "water-heaters", imageUrl: null, productCount: 0 },
              { id: 6, name: "Bathroom Accessories", slug: "bathroom-accessories", imageUrl: null, productCount: 0 },
              { id: 7, name: "Pipes & Fittings", slug: "pipes-fittings", imageUrl: null, productCount: 0 },
              { id: 8, name: "Flush Tanks", slug: "flush-tanks", imageUrl: null, productCount: 0 },
            ]).map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} data-testid={`card-category-${cat.id}`}>
                <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-[hsl(215,100%,34%)] transition-all duration-200 cursor-pointer">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={cat.imageUrl || categoryImages[cat.slug] || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop`}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm text-gray-900">{cat.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cat.productCount || "50"}+ Products</div>
                    <div className="mt-2 text-[hsl(215,100%,34%)] text-xs font-medium flex items-center gap-1">
                      Explore <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
              <p className="text-gray-500 text-sm mt-1">Our most loved products</p>
            </div>
            <Link href="/products" className="text-[hsl(215,100%,34%)] text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {featLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featured.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Products will appear here once added.</p>
              <Link href="/products"><button className="mt-3 text-[hsl(215,100%,34%)] text-sm font-medium">Browse All Products</button></Link>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <p className="text-gray-500 text-sm mt-1">Fresh additions to our collection</p>
          </div>
          <Link href="/products" className="text-[hsl(215,100%,34%)] text-sm font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {newLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : newArrivals && newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newArrivals.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>New arrivals coming soon!</p>
          </div>
        )}
      </section>

      {/* Dealer Banner */}
      <section className="bg-gradient-to-r from-[hsl(215,100%,34%)] to-[hsl(222,47%,20%)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black mb-2">Become a PRAYAG Dealer</h2>
            <p className="text-blue-100 text-lg">Join 10,000+ dealers across India. Get exclusive pricing, catalogues, and marketing support.</p>
          </div>
          <Link href="/dealer-registration">
            <button className="bg-white text-[hsl(215,100%,34%)] font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2 text-lg" data-testid="button-dealer-cta">
              Register as Dealer <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Why Choose Prayag */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Why Choose PRAYAG?</h2>
          <p className="text-gray-500 mt-2">Four decades of excellence in plumbing solutions</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Award, title: "4500+ Products", desc: "The most comprehensive range of plumbing and sanitaryware products in India." },
            { icon: Users, title: "Nationwide Distribution", desc: "10,000+ dealer network spanning every state and major city across India." },
            { icon: Shield, title: "Premium Manufacturing", desc: "ISO certified manufacturing with stringent quality checks at every stage." },
            { icon: Truck, title: "Fast Delivery", desc: "Reliable logistics with real-time tracking and on-time delivery guarantee." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6 rounded-xl bg-white border border-gray-100 hover:border-[hsl(215,100%,34%)] hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-[hsl(215,100%,34%)]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-[hsl(215,100%,34%)]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="text-gray-500 mt-1">Trusted by professionals across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
