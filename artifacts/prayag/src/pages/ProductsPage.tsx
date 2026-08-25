import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown, Check, ArrowUpRight } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { useSiteContent } from "@/lib/siteContent";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const waterHeaterRange = [
  {
    name: "Bromo Vertical",
    image: "bromo.webp",
    description: "BEE 5 Star vertical water heater",
    orientation: "Vertical",
    sizes: "6L–50L",
    application: "Glass Line & Metal Tank",
    features: ["Heat retention", "MG anode rod", "Glass-lined tank"],
    sourceUrl: "https://prayagindia.com/bromo-vertical",
  },
  {
    name: "Therma Horizontal",
    image: "therma.webp",
    description: "BEE 5 Star horizontal water heater",
    orientation: "Horizontal",
    sizes: "6L–50L",
    application: "Glass Line Tank",
    features: ["Metal tank", "Blue Diamond coating", "2–3 mm thickness"],
    sourceUrl: "https://prayagindia.com/therma-horizontal",
  },
  {
    name: "Nile Vertical",
    image: "nile.webp",
    description: "BEE 5 Star vertical water heater",
    orientation: "Vertical",
    sizes: "6L–50L",
    application: "Steel Tank",
    features: ["Corrosion protection", "Shock proof", "Copper heating element"],
    sourceUrl: "https://prayagindia.com/nile-vertical",
  },
  {
    name: "Pico Vertical",
    image: "pico.webp",
    description: "BEE 5 Star vertical water heater",
    orientation: "Vertical",
    sizes: "6L–50L",
    application: "Steel Tank",
    features: ["Corrosion protection", "Shock proof", "Copper heating element"],
    sourceUrl: "https://prayagindia.com/pico-vertical",
  },
];

const kitchenSinkRange = [
  {
    sku: "Q748 MB",
    name: "Double Bowl with Drain Board",
    collection: "Ivory Lucid",
    image: "ivory-lucid-double-bowl-with-drain-board.webp",
    colors: "Bianco · Pluto",
    size: "45 × 20 × 8.5",
    thickness: "10 mm",
    weight: "21.5 kg approx.",
    sourceUrl: "https://prayagindia.com/q748-mb-double-bowl-drain-board",
  },
  {
    sku: "Q752 MB",
    name: "Double Bowl",
    collection: "Sand Soul",
    image: "sand-soul-double-bowl.webp",
    colors: "Black · White · Grey",
    size: "45 × 20 × 8.5",
    thickness: "10 mm",
    weight: "30.5 kg approx.",
    sourceUrl: "https://prayagindia.com/q752-mb-double-bowl",
  },
  {
    sku: "Q752 GB",
    name: "Double Bowl",
    collection: "Sand Soul",
    image: "sand-soul-double-bowl.webp",
    colors: "Bianco · Pluto",
    size: "45 × 20 × 8.5",
    thickness: "10 mm",
    weight: "30.5 kg approx.",
    sourceUrl: "https://prayagindia.com/q752-gb-double-bowl",
  },
  {
    sku: "Q732 MB",
    name: "Double Bowl",
    collection: "Sand Azaro",
    image: "sand-azaro-double-bowl.webp",
    colors: "Bianco · Pluto",
    size: "34 × 19.5 × 8.5",
    thickness: "10 mm",
    weight: "9 kg approx.",
    sourceUrl: "https://prayagindia.com/q732-mb-double-bowl",
  },
  {
    sku: "Q740 MB",
    name: "Double Bowl",
    collection: "Sand Unico-Twin",
    image: "sand-unico-twin-double-bowl.webp",
    colors: "Black · White · Grey",
    size: "37 × 18 × 8.5",
    thickness: "14 mm",
    weight: "22 kg approx.",
    sourceUrl: "https://prayagindia.com/q740-mb-double-bowl",
  },
  {
    sku: "Q736 MB",
    name: "Single Bowl with Drain Board",
    collection: "Crystal Vanilla",
    image: "crystal-vanilla-singe-bowl-with-drain-board-0.webp",
    colors: "Official finish",
    size: "34 × 19.5 × 8.5",
    thickness: "10 mm",
    weight: "9 kg approx.",
    sourceUrl: "https://prayagindia.com/q736-mb-single-bowl-drain-board",
  },
  {
    sku: "Q740 GB",
    name: "Double Bowl",
    collection: "Sand Unico-Twin",
    image: "sand-unico-twin-double-bowl.webp",
    colors: "Bianco · Pluto",
    size: "37 × 18 × 8.5",
    thickness: "14 mm",
    weight: "22 kg approx.",
    sourceUrl: "https://prayagindia.com/q740-gb-double-bowl",
  },
  {
    sku: "Q744 MB",
    name: "Double Bowl",
    collection: "Coke Smudge",
    image: "coke-smudge-double-bowl.webp",
    colors: "Black · White · Grey",
    size: "40 × 18 × 8.5",
    thickness: "10 mm",
    weight: "21 kg approx.",
    sourceUrl: "https://prayagindia.com/q744-mb-double-bowl",
  },
  {
    sku: "Q744 GB",
    name: "Double Bowl",
    collection: "Coke Smudge",
    image: "coke-smudge-double-bowl.webp",
    colors: "Bianco · Pluto",
    size: "40 × 18 × 8.5",
    thickness: "10 mm",
    weight: "21 kg approx.",
    sourceUrl: "https://prayagindia.com/q744-gb-double-bowl",
  },
];

function useQueryParams() {
  const search = typeof window !== "undefined" ? window.location.search : "";
  return Object.fromEntries(new URLSearchParams(search).entries());
}

export default function ProductsPage() {
  const params = useQueryParams();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"grid" | "list">("grid");
  const { section } = useSiteContent();
  const productsPage = section("productsPage");
  const categoryPages = section("categoryPages");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: params.category || "",
    search: params.search || "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sortBy: "photo_ready",
    page: Math.max(1, parseInt(params.page || "1", 10) || 1),
  });

  useEffect(() => {
    const p = Object.fromEntries(new URLSearchParams(searchString).entries());
    const page = Math.max(1, parseInt(p.page || "1", 10) || 1);
    setFilters(f => ({ ...f, category: p.category || "", search: p.search || "", page }));
  }, [searchString]);

  const queryParams = {
    ...(filters.category && { category: filters.category }),
    ...(filters.search && { search: filters.search }),
    ...(filters.minPrice && { minPrice: parseFloat(filters.minPrice) }),
    ...(filters.maxPrice && { maxPrice: parseFloat(filters.maxPrice) }),
    ...(filters.inStock && { inStock: true }),
    sortBy: filters.sortBy,
    page: filters.page,
    limit: 20,
  };

  const { data, isLoading } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams) },
  });
  const { data: categories } = useListCategories();

  function updateFilter(key: string, value: any) {
    setFilters(f => ({ ...f, [key]: value, ...(key !== "page" && { page: 1 }) }));
    if (key === "page" || key === "category") {
      const sp = new URLSearchParams(searchString);
      const newPage = key === "page" ? value : 1;
      const newCategory = key === "category" ? value : sp.get("category") || "";
      if (newPage > 1) sp.set("page", String(newPage)); else sp.delete("page");
      if (newCategory) sp.set("category", newCategory); else sp.delete("category");
      const qs = sp.toString();
      setLocation(`/products${qs ? `?${qs}` : ""}`);
    }
    if (key === "page") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setFilters({ category: "", search: "", minPrice: "", maxPrice: "", inStock: false, sortBy: "photo_ready", page: 1 });
    setLocation("/products");
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div className="bg-[#FAF9F7] min-h-screen pb-20">
      {/* Premium Header Area */}
      {(() => {
        const bannerSlugs = ["cp-faucets", "ptmt-faucets", "sanitaryware", "kitchen-sinks", "water-heaters", "bathroom-accessories", "pipes-fittings", "storage-tanks"];
        const catEntry = filters.category ? categoryPages.entries.find(e => e.slug === filters.category) : undefined;
        const bannerUrl = filters.category
          ? (catEntry?.bannerImage || (bannerSlugs.includes(filters.category) ? `${import.meta.env.BASE_URL}images/category-banners/${filters.category}.png` : null))
          : filters.search
            ? null
            : (productsPage.bannerImage || `${import.meta.env.BASE_URL}images/category-banners/the-collection.png`);
        return (
          <div
            className={`relative border-b border-gray-100 overflow-hidden ${bannerUrl ? "bg-[hsl(24,10%,16%)]" : "bg-white"}`}
            style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {bannerUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/60" />}
            <div className="relative max-w-[1400px] mx-auto px-6 py-12 md:py-16 lg:py-20 text-center">
              <motion.h1
                key={filters.category || "all"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-4xl md:text-5xl lg:text-6xl font-serif-lux font-bold uppercase mb-4 ${bannerUrl ? "text-white drop-shadow-md" : "text-gray-900"}`}
              >
                {filters.category ? (catEntry?.title || (filters.category === "pipes-fittings" ? "Pipes & Fittings" : filters.category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()))) : filters.search ? `Search: "${filters.search}"` : productsPage.allTitle}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-0.5 bg-[hsl(42,62%,68%)] mx-auto mb-6"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`font-bold tracking-wide uppercase text-xs ${bannerUrl ? "text-[hsl(42,62%,68%)]" : "text-gray-500"}`}
              >
                 {filters.category === "water-heaters"
                   ? `${waterHeaterRange.length} official models`
                   : filters.category === "kitchen-sinks"
                     ? `${kitchenSinkRange.length} official variants`
                     : `${data?.total ?? "..."} ${productsPage.countText}`}
              </motion.p>
            </div>
          </div>
        );
      })()}

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Elegant Sidebar */}
          <aside className={`w-full flex-shrink-0 lg:w-64 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-28 overflow-hidden rounded-[1.5rem] border border-[hsl(38,52%,52%)]/30 bg-[linear-gradient(165deg,#3a2a1d_0%,#261d17_58%,#1d1814_100%)] p-5 text-white shadow-[0_20px_45px_-28px_rgba(42,28,18,0.95)]">
              <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[radial-gradient(circle,hsl(42,62%,68%,0.2),transparent_68%)]" />
              <div className="relative space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-serif-lux text-xl text-[hsl(42,62%,78%)]">Refine By</h3>
                <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wider text-[hsl(42,62%,68%)] transition-colors hover:text-white">Clear</button>
              </div>

              {/* Category */}
              <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[hsl(42,62%,68%)]">Category</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`flex h-4 w-4 items-center justify-center border transition-colors ${!filters.category ? 'border-[hsl(42,62%,68%)] bg-[hsl(42,62%,68%)]' : 'border-white/30 group-hover:border-[hsl(42,62%,68%)]'}`}>
                      {!filters.category && <Check className="h-3 w-3 text-[hsl(24,10%,16%)]" />}
                    </div>
                    <span className={`text-sm transition-colors ${!filters.category ? 'font-semibold text-white' : 'text-white/60 group-hover:text-white'}`}>All Collections</span>
                    <input type="radio" name="cat" checked={!filters.category} onChange={() => updateFilter("category", "")} className="hidden" />
                  </label>
                  {(categories || []).map(c => (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`flex h-4 w-4 items-center justify-center border transition-colors ${filters.category === c.slug ? 'border-[hsl(42,62%,68%)] bg-[hsl(42,62%,68%)]' : 'border-white/30 group-hover:border-[hsl(42,62%,68%)]'}`}>
                        {filters.category === c.slug && <Check className="h-3 w-3 text-[hsl(24,10%,16%)]" />}
                      </div>
                      <span className={`text-sm transition-colors ${filters.category === c.slug ? 'font-semibold text-white' : 'text-white/60 group-hover:text-white'}`}>{c.name}</span>
                      <input type="radio" name="cat" checked={filters.category === c.slug} onChange={() => updateFilter("category", c.slug)} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[hsl(42,62%,68%)]">Price Scope</h4>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[hsl(42,62%,68%)]">₹</span>
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter("minPrice", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.08] py-2 pl-7 pr-2 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[hsl(42,62%,68%)] focus:bg-white/[0.12]" />
                  </div>
                  <span className="text-[hsl(42,62%,68%)]/60">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[hsl(42,62%,68%)]">₹</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter("maxPrice", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.08] py-2 pl-7 pr-2 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[hsl(42,62%,68%)] focus:bg-white/[0.12]" />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="border-t border-white/10 pt-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`flex h-4 w-4 items-center justify-center border transition-colors ${filters.inStock ? 'border-[hsl(42,62%,68%)] bg-[hsl(42,62%,68%)]' : 'border-white/30 group-hover:border-[hsl(42,62%,68%)]'}`}>
                    {filters.inStock && <Check className="h-3 w-3 text-[hsl(24,10%,16%)]" />}
                  </div>
                  <span className={`text-sm transition-colors ${filters.inStock ? 'font-semibold text-white' : 'text-white/60 group-hover:text-white'}`}>In Stock Only</span>
                  <input type="checkbox" checked={filters.inStock} onChange={e => updateFilter("inStock", e.target.checked)} className="hidden" />
                </label>
              </div>
              </div>
            </div>
          </aside>

          {/* Main Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Minimal Toolbar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-y-3 border-b border-gray-200 pb-4">
              <button className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900" onClick={() => setShowFilters(p => !p)} data-testid="button-filters">
                <SlidersHorizontal className="w-4 h-4" /> Filters {showFilters && <X className="w-4 h-4 ml-2" />}
              </button>
              
              <div className="hidden lg:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(42,62%,68%)] inline-block"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Exquisite Selection</span>
              </div>

              <div className="ml-auto flex max-w-full items-center gap-2 sm:gap-4">
                <div className="relative">
                  <select value={filters.sortBy} onChange={e => updateFilter("sortBy", e.target.value)}
                    className="max-w-[168px] cursor-pointer appearance-none truncate border-b border-transparent bg-transparent py-1 pr-7 text-xs font-medium text-gray-900 outline-none transition-colors focus:border-[hsl(24,10%,16%)] sm:max-w-none sm:pr-8 sm:text-sm" data-testid="select-sort">
                    <option value="photo_ready">Products with Photos</option>
                    <option value="newest">Latest Arrivals</option>
                    <option value="price_asc">Price: Ascending</option>
                    <option value="price_desc">Price: Descending</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="ml-0 flex gap-1 border-l border-gray-200 pl-2 sm:ml-2 sm:pl-4">
                  <button onClick={() => setView("grid")} className={`p-1.5 transition-colors ${view === "grid" ? "text-[hsl(24,10%,16%)]" : "text-gray-300 hover:text-gray-600"}`} data-testid="button-grid-view">
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setView("list")} className={`p-1.5 transition-colors ${view === "list" ? "text-[hsl(24,10%,16%)]" : "text-gray-300 hover:text-gray-600"}`} data-testid="button-list-view">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {filters.category === "water-heaters" && (
              <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-[hsl(42,62%,68%)]/20 bg-[hsl(24,10%,11%)] text-white shadow-[0_24px_60px_-32px_rgba(42,28,18,0.95)]" data-testid="water-heater-range">
                <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[radial-gradient(circle,hsl(42,62%,68%,0.18),transparent_68%)]" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,hsl(30,35%,30%,0.28),transparent_68%)]" />
                <div className="relative flex flex-col gap-4 border-b border-white/10 px-6 py-8 md:flex-row md:items-end md:justify-between md:px-10 md:py-10">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(42,62%,68%)]">
                      <span className="h-px w-8 bg-[hsl(42,62%,68%)]" /> Official Prayag Range
                    </p>
                    <h2 className="font-serif-lux text-3xl md:text-4xl">Heat, engineered beautifully</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                      Explore Prayag’s BEE 5 Star water-heater range, designed with durable tanks, heat retention and dependable everyday performance.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(42,62%,68%)]" /> 6L–50L capacity
                  </span>
                </div>
                <div className="relative grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
                  {waterHeaterRange.map((item, index) => (
                    <a
                      key={item.name}
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative flex min-h-[29rem] flex-col bg-white/[0.045] p-4 transition-colors hover:bg-[hsl(38,52%,52%)]/[0.12] md:p-5"
                      data-testid={`card-water-heater-${index}`}
                    >
                      <div className="relative mb-5 flex aspect-[1.05] items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-white via-stone-100 to-stone-300 p-8">
                        <img
                          src={`${import.meta.env.BASE_URL}images/drive/geyser/${item.image}`}
                          alt={item.name}
                          className="relative z-[1] h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.92),transparent_58%)]" />
                        <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(42,62%,68%)]/70 bg-[hsl(24,10%,16%)] text-[10px] font-black text-[hsl(42,62%,78%)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="absolute right-3 top-3 rounded-full border border-[hsl(24,10%,16%)]/15 bg-white/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[hsl(24,10%,16%)]">
                          {item.orientation}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center bg-[hsl(24,10%,10%)]/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(42,62%,68%)] bg-black/30 text-[hsl(42,62%,68%)] backdrop-blur-sm">
                            <ArrowUpRight className="h-5 w-5" />
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-serif-lux text-2xl text-white transition-colors group-hover:text-[hsl(42,62%,78%)]">{item.name}</h3>
                        <p className="mt-1 text-xs text-white/55">{item.description}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {item.features.map((feature) => (
                            <span key={feature} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[9px] font-medium text-white/75">{feature}</span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[hsl(42,62%,68%)]">{item.sizes}</p>
                            <p className="mt-1 text-[10px] text-white/45">{item.application}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 transition-colors group-hover:text-[hsl(42,62%,68%)]">
                            Details <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {filters.category === "kitchen-sinks" && (
              <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-[hsl(42,62%,68%)]/20 bg-[hsl(24,10%,11%)] text-white shadow-[0_24px_60px_-32px_rgba(42,28,18,0.95)]" data-testid="kitchen-sink-range">
                <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[radial-gradient(circle,hsl(42,62%,68%,0.18),transparent_68%)]" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,hsl(30,35%,30%,0.28),transparent_68%)]" />
                <div className="relative flex flex-col gap-4 border-b border-white/10 px-6 py-8 md:flex-row md:items-end md:justify-between md:px-10 md:py-10">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(42,62%,68%)]">
                      <span className="h-px w-8 bg-[hsl(42,62%,68%)]" /> Official Prayag Range
                    </p>
                    <h2 className="font-serif-lux text-3xl md:text-4xl">Built for the heart of home</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                      Explore Prayag’s durable kitchen-sink collections, with smooth non-porous surfaces, heat and scratch resistance, and hygienic everyday performance.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(42,62%,68%)]" /> Official size & material details
                  </span>
                </div>
                <div className="relative grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
                  {kitchenSinkRange.map((item, index) => (
                    <a
                      key={item.sku}
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative flex min-h-[28rem] flex-col bg-white/[0.045] p-4 transition-colors hover:bg-[hsl(38,52%,52%)]/[0.12] md:p-5"
                      data-testid={`card-kitchen-sink-${item.sku.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="relative mb-5 flex aspect-[1.25] items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-white via-stone-100 to-stone-300 p-5">
                        <img
                          src={`${import.meta.env.BASE_URL}images/drive/kitchen-sinks-web/${item.image}`}
                          alt={`${item.collection} ${item.name}`}
                          className="relative z-[1] h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.92),transparent_58%)]" />
                        <span className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full border border-[hsl(42,62%,68%)]/70 bg-[hsl(24,10%,16%)] px-2 text-[9px] font-black text-[hsl(42,62%,78%)]">
                          {item.sku}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center bg-[hsl(24,10%,10%)]/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(42,62%,68%)] bg-black/30 text-[hsl(42,62%,68%)] backdrop-blur-sm">
                            <ArrowUpRight className="h-5 w-5" />
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[hsl(42,62%,68%)]">{item.collection}</p>
                        <h3 className="mt-1 font-serif-lux text-2xl text-white transition-colors group-hover:text-[hsl(42,62%,78%)]">{item.name}</h3>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {["Smooth & non-porous", "Heat & scratch resistant", "Hygienic"].map((feature) => (
                            <span key={feature} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[9px] font-medium text-white/75">{feature}</span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[hsl(42,62%,68%)]">{item.size}</p>
                            <p className="mt-1 text-[10px] text-white/45">{item.thickness} · {item.weight}</p>
                            <p className="mt-1 text-[10px] text-white/45">{item.colors}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 transition-colors group-hover:text-[hsl(42,62%,68%)]">
                            Details <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {isLoading ? (
              <div className={`grid gap-6 ${view === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}>
                {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-96 rounded-none bg-white border border-gray-100" />)}
              </div>
            ) : data && data.products.length > 0 ? (
              <>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                  className={`grid gap-x-6 gap-y-10 ${view === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
                >
                  {data.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </motion.div>
                
                {/* Elegant Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-16 pt-8 border-t border-gray-200">
                    <button disabled={filters.page === 1} onClick={() => updateFilter("page", filters.page - 1)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-30 text-gray-500 hover:text-[hsl(24,10%,16%)] transition-colors" data-testid="button-prev-page">
                      Prev
                    </button>
                    <div className="flex items-center gap-1 px-4">
                      {(() => {
                        const cur = filters.page;
                        const pages: (number | "...")[] = [];
                        if (totalPages <= 7) {
                          for (let p = 1; p <= totalPages; p++) pages.push(p);
                        } else {
                          const start = Math.max(2, cur - 1);
                          const end = Math.min(totalPages - 1, cur + 1);
                          pages.push(1);
                          if (start > 2) pages.push("...");
                          for (let p = start; p <= end; p++) pages.push(p);
                          if (end < totalPages - 1) pages.push("...");
                          pages.push(totalPages);
                        }
                        return pages.map((p, i) =>
                          p === "..." ? (
                            <span key={`e${i}`} className="w-8 text-center text-sm text-gray-300">…</span>
                          ) : (
                            <button key={p} onClick={() => updateFilter("page", p)}
                              className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-all ${cur === p ? "bg-[hsl(24,10%,16%)] text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
                              data-testid={`button-page-${p}`}>
                              {p}
                            </button>
                          )
                        );
                      })()}
                    </div>
                    <button disabled={filters.page === totalPages} onClick={() => updateFilter("page", filters.page + 1)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-30 text-gray-500 hover:text-[hsl(24,10%,16%)] transition-colors" data-testid="button-next-page">
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : filters.category === "water-heaters" || filters.category === "kitchen-sinks" ? null : (
              <div className="text-center py-32 bg-white border border-gray-100 mt-4">
                <div className="w-20 h-20 mx-auto border-2 border-gray-100 flex items-center justify-center rounded-full mb-6">
                  <SlidersHorizontal className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-serif-lux text-2xl text-gray-900 mb-2">No masterworks found</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find any pieces matching your refined criteria. Try broadening your selection.</p>
                <button onClick={clearFilters} className="bg-[hsl(24,10%,16%)] text-white text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[hsl(24,9%,26%)] transition-colors">
                  Reset Collection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
