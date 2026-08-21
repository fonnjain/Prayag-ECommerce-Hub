import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Manifest = Record<string, string[]>;

const formatCategoryName = (str: string) => {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function PhotosGalleryPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const closeLightboxRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetch(`${BASE}/images/drive/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error("manifest fetch failed");
        return r.json();
      })
      .then((m: Manifest) => setManifest(m))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeLightboxRef.current?.focus();

    return () => previousFocusRef.current?.focus();
  }, [selectedImage]);

  const categories = useMemo(() => (manifest ? Object.keys(manifest) : []), [manifest]);

  const images = useMemo(() => {
    if (!manifest) return [];
    const q = search.trim().toLowerCase();
    const entries: { dir: string; file: string; id: string }[] = [];
    const dirs = activeCategory ? [activeCategory] : categories;
    for (const d of dirs) {
      for (const f of manifest[d] || []) {
        if (q && !(d + " " + f).toLowerCase().includes(q)) continue;
        entries.push({ dir: d, file: f, id: `${d}/${f}` });
        if (entries.length >= 500) return entries;
      }
    }
    return entries;
  }, [manifest, activeCategory, search, categories]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-background">
        <h2 className="text-2xl font-display text-foreground mb-4">Gallery Unavailable</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          We encountered an issue loading our product collections. Please refresh the page to try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#0047AB] text-white px-6 py-3 rounded-md font-medium hover:bg-[#003580] hover-elevate transition-all"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#0047AB] text-white pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,hsl(var(--gold))_0%,transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-8 h-[1px] bg-gold"></div>
            <span className="text-gold uppercase tracking-widest text-xs font-bold">Showroom</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display mb-6">
            Product Gallery
          </h1>
          <p className="text-white/80 max-w-2xl text-lg mb-12 font-light leading-relaxed">
            Explore our curated collections of premium plumbing and bathroom fittings. Precision engineering meets timeless design.
          </p>
          
          <div className="flex items-center gap-8 border-b border-white/20 pb-0">
            <span className="text-gold border-b-2 border-gold pb-3 font-medium text-sm tracking-wide uppercase">Photography</span>
            <Link href="/gallery/videos" className="text-white/60 hover:text-white pb-3 transition-colors text-sm tracking-wide uppercase font-medium">
              Videography
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 w-full flex-1">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-start md:items-center justify-between">
          <div className="w-full md:w-80 relative shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-card border border-border rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#0047AB] focus:ring-1 focus:ring-[#0047AB] transition-all shadow-sm"
            />
            <svg className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="w-full flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide snap-x relative">
            <button
              onClick={() => setActiveCategory("")}
              aria-pressed={activeCategory === ""}
              className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === "" 
                  ? "bg-[#0047AB] text-white shadow-md" 
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
              }`}
            >
              All Collections
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                aria-pressed={activeCategory === c}
                className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === c 
                    ? "bg-[#0047AB] text-white shadow-md" 
                    : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                }`}
              >
                {formatCategoryName(c)}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {!manifest ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-secondary animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {images.map(({ dir, file, id }) => {
                const path = `/images/drive/${dir}/${file}`;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedImage(`${BASE}${path}`)}
                    className="group relative text-left bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 border border-border hover:border-gold/40 aspect-[4/5] flex flex-col"
                  >
                    <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center bg-white p-6">
                       {/* Subtle overlay for depth */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                       <img
                        src={`${BASE}${path}`}
                        alt={file.replace('.webp', '')}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="p-4 bg-white border-t border-border/50 z-20 relative">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold truncate">
                        {formatCategoryName(dir)}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">
                        {file.replace('.webp', '').toUpperCase()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {images.length >= 500 && (
              <div className="mt-12 text-center">
                <div className="inline-block bg-secondary text-muted-foreground px-6 py-3 rounded-full text-sm">
                  Showing first 500 products. Select a specific collection to view more.
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-display text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any products matching your search criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={() => { setSearch(""); setActiveCategory(""); }}
              className="mt-6 text-[#0047AB] font-medium hover:text-[#003580] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setSelectedImage(null);
            }
            if (event.key === "Tab") {
              event.preventDefault();
              closeLightboxRef.current?.focus();
            }
          }}
        >
          <button 
            ref={closeLightboxRef}
            type="button"
            aria-label="Close image preview"
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative max-w-4xl w-full max-h-full flex items-center justify-center bg-white rounded-lg shadow-2xl p-8 animate-in zoom-in-95 duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
             <img 
              src={selectedImage} 
              alt="Product zoomed view" 
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
