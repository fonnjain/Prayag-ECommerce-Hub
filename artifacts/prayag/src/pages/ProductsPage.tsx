import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useListProducts, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";

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
    page: 1,
  });

  useEffect(() => {
    const p = Object.fromEntries(new URLSearchParams(searchString).entries());
    setFilters(f => ({ ...f, category: p.category || "", search: p.search || "", page: 1 }));
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
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  }

  function clearFilters() {
    setFilters({ category: "", search: "", minPrice: "", maxPrice: "", inStock: false, sortBy: "newest", page: 1 });
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {filters.category ? filters.category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : filters.search ? `Search: "${filters.search}"` : "All Products"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{data?.total ?? "..."} products found</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`w-60 flex-shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-28">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-[hsl(215,100%,34%)] hover:underline">Clear all</button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!filters.category} onChange={() => updateFilter("category", "")} className="accent-[hsl(215,100%,34%)]" />
                  <span className="text-sm">All Categories</span>
                </label>
                {(categories || []).map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={filters.category === c.slug} onChange={() => updateFilter("category", c.slug)} className="accent-[hsl(215,100%,34%)]" />
                    <span className="text-sm text-gray-700">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter("minPrice", e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-[hsl(215,100%,34%)]" />
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter("maxPrice", e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-[hsl(215,100%,34%)]" />
              </div>
            </div>

            {/* In Stock */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.inStock} onChange={e => updateFilter("inStock", e.target.checked)} className="accent-[hsl(215,100%,34%)]" />
                <span className="text-sm font-medium text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <button className="md:hidden flex items-center gap-1.5 text-sm font-medium text-gray-700" onClick={() => setShowFilters(p => !p)} data-testid="button-filters">
              <SlidersHorizontal className="w-4 h-4" /> Filters {showFilters && <X className="w-3 h-3" />}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <select value={filters.sortBy} onChange={e => updateFilter("sortBy", e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[hsl(215,100%,34%)]" data-testid="select-sort">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-[hsl(215,100%,34%)] text-white" : "text-gray-400 hover:bg-gray-50"}`} data-testid="button-grid-view">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-[hsl(215,100%,34%)] text-white" : "text-gray-400 hover:bg-gray-50"}`} data-testid="button-list-view">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
              {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : data && data.products.length > 0 ? (
            <>
              <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                {data.products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={filters.page === 1} onClick={() => updateFilter("page", filters.page - 1)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:border-[hsl(215,100%,34%)]">
                    Previous
                  </button>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => updateFilter("page", p)}
                        className={`px-3 py-2 rounded-lg text-sm ${filters.page === p ? "bg-[hsl(215,100%,34%)] text-white" : "border border-gray-200 hover:border-[hsl(215,100%,34%)]"}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={filters.page === totalPages} onClick={() => updateFilter("page", filters.page + 1)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:border-[hsl(215,100%,34%)]">
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-medium text-gray-600">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="mt-4 text-[hsl(215,100%,34%)] text-sm font-medium hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
