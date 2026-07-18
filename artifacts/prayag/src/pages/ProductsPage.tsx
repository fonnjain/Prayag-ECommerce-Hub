import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

function useQueryParams() {
  const search = typeof window !== "undefined" ? window.location.search : "";
  return Object.fromEntries(new URLSearchParams(search).entries());
}

export default function ProductsPage() {
  const params = useQueryParams();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: params.category || "",
    search: params.search || "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sortBy: "newest",
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
    setFilters({ category: "", search: "", minPrice: "", maxPrice: "", inStock: false, sortBy: "newest", page: 1 });
    setLocation("/products");
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div className="bg-[#FAF9F7] min-h-screen pb-20">
      {/* Premium Header Area */}
      {(() => {
        const bannerSlugs = ["cp-faucets", "ptmt-faucets", "sanitaryware", "kitchen-sinks", "water-heaters", "bathroom-accessories", "pipes-fittings", "storage-tanks"];
        const bannerUrl = filters.category && bannerSlugs.includes(filters.category)
          ? `${import.meta.env.BASE_URL}images/category-banners/${filters.category}.png`
          : filters.search
            ? null
            : `${import.meta.env.BASE_URL}images/category-banners/the-collection.png`;
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
                {filters.category ? filters.category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : filters.search ? `Search: "${filters.search}"` : "The Collection"}
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
                {data?.total ?? "..."} exceptional pieces discovered
              </motion.p>
            </div>
          </div>
        );
      })()}

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Elegant Sidebar */}
          <aside className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-28 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="font-serif-lux text-xl text-gray-900">Refine By</h3>
                <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors">Clear</button>
              </div>

              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Category</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${!filters.category ? 'border-[hsl(24,10%,16%)] bg-[hsl(24,10%,16%)]' : 'border-gray-300 group-hover:border-[hsl(24,10%,16%)]'}`}>
                      {!filters.category && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${!filters.category ? 'text-[hsl(24,10%,16%)] font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>All Collections</span>
                    <input type="radio" name="cat" checked={!filters.category} onChange={() => updateFilter("category", "")} className="hidden" />
                  </label>
                  {(categories || []).map(c => (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${filters.category === c.slug ? 'border-[hsl(24,10%,16%)] bg-[hsl(24,10%,16%)]' : 'border-gray-300 group-hover:border-[hsl(24,10%,16%)]'}`}>
                        {filters.category === c.slug && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${filters.category === c.slug ? 'text-[hsl(24,10%,16%)] font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>{c.name}</span>
                      <input type="radio" name="cat" checked={filters.category === c.slug} onChange={() => updateFilter("category", c.slug)} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Price Scope</h4>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter("minPrice", e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-none pl-7 pr-2 py-2 text-sm outline-none focus:border-[hsl(24,10%,16%)] transition-colors" />
                  </div>
                  <span className="text-gray-300">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter("maxPrice", e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-none pl-7 pr-2 py-2 text-sm outline-none focus:border-[hsl(24,10%,16%)] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="pt-6 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${filters.inStock ? 'border-[hsl(24,10%,16%)] bg-[hsl(24,10%,16%)]' : 'border-gray-300 group-hover:border-[hsl(24,10%,16%)]'}`}>
                    {filters.inStock && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm transition-colors ${filters.inStock ? 'text-[hsl(24,10%,16%)] font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>In Stock Only</span>
                  <input type="checkbox" checked={filters.inStock} onChange={e => updateFilter("inStock", e.target.checked)} className="hidden" />
                </label>
              </div>
            </div>
          </aside>

          {/* Main Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Minimal Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <button className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900" onClick={() => setShowFilters(p => !p)} data-testid="button-filters">
                <SlidersHorizontal className="w-4 h-4" /> Filters {showFilters && <X className="w-4 h-4 ml-2" />}
              </button>
              
              <div className="hidden lg:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(42,62%,68%)] inline-block"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Exquisite Selection</span>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <div className="relative">
                  <select value={filters.sortBy} onChange={e => updateFilter("sortBy", e.target.value)}
                    className="appearance-none bg-transparent pr-8 py-1 text-sm font-medium text-gray-900 outline-none cursor-pointer border-b border-transparent focus:border-[hsl(24,10%,16%)] transition-colors" data-testid="select-sort">
                    <option value="newest">Latest Arrivals</option>
                    <option value="price_asc">Price: Ascending</option>
                    <option value="price_desc">Price: Descending</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="flex gap-1 ml-2 border-l border-gray-200 pl-4">
                  <button onClick={() => setView("grid")} className={`p-1.5 transition-colors ${view === "grid" ? "text-[hsl(24,10%,16%)]" : "text-gray-300 hover:text-gray-600"}`} data-testid="button-grid-view">
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setView("list")} className={`p-1.5 transition-colors ${view === "list" ? "text-[hsl(24,10%,16%)]" : "text-gray-300 hover:text-gray-600"}`} data-testid="button-list-view">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

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
            ) : (
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
