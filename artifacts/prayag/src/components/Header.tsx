import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, User, ChevronDown, Menu, X, Grid3X3, ImageIcon, Video } from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useGetCart, useGetWishlist, useGetSearchSuggestions, getGetSearchSuggestionsQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import logoDark from "@assets/logo_1783664087489.png";
import { useSiteContent } from "@/lib/siteContent";

const allCategories = [
  { label: "CP Faucets", slug: "cp-faucets" },
  { label: "PTMT Faucets", slug: "ptmt-faucets" },
  { label: "Sanitaryware", slug: "sanitaryware" },
  { label: "Kitchen Sinks", slug: "kitchen-sinks" },
  { label: "Water Heaters", slug: "water-heaters" },
  { label: "Pipes & Fittings", slug: "pipes-fittings" },
  { label: "Bathroom Accessories", slug: "bathroom-accessories" },
  { label: "Storage Tanks", slug: "storage-tanks" },
];

const navItems = [
  { label: "CP Faucets", slug: "cp-faucets" },
  { label: "PTMT Faucets", slug: "ptmt-faucets" },
  { label: "Sanitaryware", slug: "sanitaryware" },
  { label: "Kitchen Sinks", slug: "kitchen-sinks" },
  { label: "Water Heaters", slug: "water-heaters" },
  { label: "Pipes & Fittings", slug: "pipes-fittings" },
  { label: "Bathroom Accessories", slug: "bathroom-accessories" },
  { label: "Storage Tanks", slug: "storage-tanks" },
];

export default function Header() {
  const { section } = useSiteContent();
  const [searchQ, setSearchQ] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { itemCount, setItemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showNavCatMenu, setShowNavCatMenu] = useState(false);
  const [showGalleryMenu, setShowGalleryMenu] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const navCatRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist({ query: { enabled: !!user, queryKey: getGetWishlistQueryKey() } });
  const wishlistCount = wishlist?.length ?? 0;
  const { data: suggestions } = useGetSearchSuggestions(
    { q: searchQ },
    { query: { enabled: searchQ.length >= 2, queryKey: getGetSearchSuggestionsQueryKey({ q: searchQ }) } }
  );

  useEffect(() => { if (cart) setItemCount(cart.itemCount); }, [cart, setItemCount]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatMenu(false);
      if (navCatRef.current && !navCatRef.current.contains(e.target as Node)) setShowNavCatMenu(false);
      if (galleryRef.current && !galleryRef.current.contains(e.target as Node)) setShowGalleryMenu(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function handleGalleryEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && showGalleryMenu) {
        setShowGalleryMenu(false);
        galleryButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleGalleryEscape);
    return () => document.removeEventListener("keydown", handleGalleryEscape);
  }, [showGalleryMenu]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) { setLocation(`/products?search=${encodeURIComponent(searchQ)}`); setShowSuggestions(false); }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ── MAIN HEADER ── */}
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-3">
        {/* Logo */}
        <Link href="/" className="mr-0 flex-shrink-0 sm:mr-1">
          <div className="flex flex-col leading-none">
            <img src={logoDark} alt="Prayag" className="h-7 w-auto object-contain sm:h-8" />
            <span className="mt-1 hidden text-[7px] font-semibold uppercase tracking-[0.28em] text-[hsl(38,52%,45%)] sm:block">Strong · Beautiful · Prayag</span>
          </div>
        </Link>

        {/* All Categories dropdown */}
        <div ref={catRef} className="relative hidden md:block flex-shrink-0">
          <button onClick={() => setShowCatMenu(p => !p)}
            className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:border-[hsl(24,10%,16%)] transition-colors bg-white"
            data-testid="button-all-categories">
            <Grid3X3 className="w-4 h-4 text-[hsl(24,10%,16%)]" />
            All Categories
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showCatMenu && (
            <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
              {allCategories.map(c => (
                <Link key={c.slug} href={`/products?category=${c.slug}`}
                  onClick={() => setShowCatMenu(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-stone-100 hover:text-[hsl(24,10%,16%)] transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative min-w-0 flex-1" data-testid="search-bar">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="search" value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setShowSuggestions(e.target.value.length >= 2); }}
              onFocus={() => searchQ.length >= 2 && setShowSuggestions(true)}
              placeholder="Search for products, categories, sku..."
              className="w-full border border-gray-200 rounded-l-md px-2 py-2 text-xs outline-none transition-colors focus:border-[hsl(24,10%,16%)] sm:px-4 sm:text-sm"
              data-testid="input-search"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-r-md bg-[hsl(24,10%,16%)] px-3 text-sm font-medium text-white transition-colors hover:bg-[hsl(24,10%,12%)] sm:px-5">
              <Search className="w-4 h-4" />
            </button>
          </form>
          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50">
              {suggestions.map((s, i) => (
                <button key={i} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { setSearchQ(s); setLocation(`/products?search=${encodeURIComponent(s)}`); setShowSuggestions(false); }}>
                  <Search className="w-3 h-3 text-gray-400" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/account/wishlist" className="hidden flex-col items-center text-gray-600 transition-colors hover:text-[hsl(24,10%,16%)] sm:flex" data-testid="link-wishlist">
            <div className="relative">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[hsl(24,10%,16%)] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" data-testid="wishlist-count">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Wishlist</span>
          </Link>

          <div ref={userRef} className="relative">
            <button onClick={() => setShowUserMenu(p => !p)}
              className="flex flex-col items-center text-gray-600 transition-colors hover:text-[hsl(24,10%,16%)]" data-testid="button-user-menu">
              <User className="w-5 h-5" />
              <span className="mt-0.5 hidden items-center gap-0.5 text-[10px] sm:flex">{user ? user.name.split(" ")[0] : "Account"} <ChevronDown className="h-2.5 w-2.5" /></span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                {user ? (
                  <>
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                    {user.role === "admin" && <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Admin Panel</Link>}
                    {user.role === "dealer" && <Link href="/dealer" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Retailer Portal</Link>}
                    {user.role === "distributor" && <Link href="/distributor" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Distributor Portal</Link>}
                    <hr className="my-1" />
                    <button onClick={() => { logout(); queryClient.invalidateQueries(); setShowUserMenu(false); setLocation("/"); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50" data-testid="button-logout">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Sign In</Link>
                    <Link href="/register" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Register</Link>
                    <hr className="my-1" />
                    <Link href="/dealer-registration" className="block px-4 py-2 text-sm text-[hsl(24,10%,16%)] hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Become a Dealer</Link>
                    <Link href="/distributor-registration" className="block px-4 py-2 text-sm text-[hsl(24,10%,16%)] hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Become a Distributor</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/cart" className="relative flex flex-col items-center text-gray-600 transition-colors hover:text-[hsl(24,10%,16%)]" data-testid="link-cart">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[hsl(24,10%,16%)] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold" data-testid="cart-count">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="mt-0.5 hidden text-[10px] sm:block">Cart</span>
          </Link>
        </div>

        <button className="ml-0 flex-shrink-0 md:hidden" onClick={() => setMobileMenuOpen(p => !p)} data-testid="button-mobile-menu">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── NAV BAR ── */}
      <nav className="bg-[hsl(24,10%,16%)] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <div ref={navCatRef} className="relative flex-shrink-0">
            <button onClick={() => setShowNavCatMenu(p => !p)}
              className="flex items-center gap-1 text-white text-xs xl:text-sm font-semibold px-2 xl:px-4 py-2.5 bg-[hsl(24,10%,12%)] hover:bg-[hsl(24,10%,9%)] transition-colors border-r border-[hsl(24,10%,12%)]"
              data-testid="button-nav-all-categories">
              <Grid3X3 className="w-3.5 h-3.5" /> All Categories <ChevronDown className={`w-3 h-3 transition-transform ${showNavCatMenu ? "rotate-180" : ""}`} />
            </button>
            {showNavCatMenu && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
                {allCategories.map(c => (
                  <Link key={c.slug} href={`/products?category=${c.slug}`}
                    onClick={() => setShowNavCatMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-stone-100 hover:text-[hsl(24,10%,16%)] transition-colors"
                    data-testid={`nav-cat-${c.slug}`}>
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {navItems.map(item => (
            <Link key={item.slug} href={`/products?category=${item.slug}`}
              className="text-white text-[10px] lg:text-[11px] xl:text-sm font-medium px-1.5 lg:px-2 xl:px-3.5 py-2.5 hover:bg-[hsl(24,10%,12%)] transition-colors whitespace-nowrap"
              data-testid={`nav-${item.slug}`}>
              {item.label}
            </Link>
          ))}
          <div ref={galleryRef} className="relative ml-auto">
            <button
              ref={galleryButtonRef}
              type="button"
              onClick={() => setShowGalleryMenu((open) => !open)}
              className="text-white text-[10px] lg:text-[11px] xl:text-sm font-medium px-1.5 lg:px-2 xl:px-3.5 py-2.5 hover:bg-[hsl(24,10%,12%)] transition-colors whitespace-nowrap flex items-center gap-1"
              aria-expanded={showGalleryMenu}
              aria-controls="gallery-navigation"
              data-testid="button-nav-gallery"
            >
              Gallery <ChevronDown className={`w-3 h-3 transition-transform ${showGalleryMenu ? "rotate-180" : ""}`} />
            </button>
            {showGalleryMenu && (
              <nav
                id="gallery-navigation"
                aria-label="Gallery"
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 overflow-hidden"
              >
                <Link
                  href="/gallery/photos"
                  onClick={() => setShowGalleryMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-stone-100 hover:text-[hsl(24,10%,16%)] transition-colors"
                  data-testid="link-gallery-photos"
                >
                  <ImageIcon className="w-4 h-4 text-[hsl(38,52%,40%)]" /> Photos
                </Link>
                <Link
                  href="/gallery/videos"
                  onClick={() => setShowGalleryMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-stone-100 hover:text-[hsl(24,10%,16%)] transition-colors"
                  data-testid="link-gallery-videos"
                >
                  <Video className="w-4 h-4 text-[hsl(38,52%,40%)]" /> Videos
                </Link>
              </nav>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          {allCategories.map(item => (
            <Link key={item.slug} href={`/products?category=${item.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm border-b hover:bg-gray-50">
              {item.label}
            </Link>
          ))}
          <div className="border-t border-gray-100">
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Gallery</p>
            <Link href="/gallery/photos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm border-b hover:bg-gray-50">
              <ImageIcon className="w-4 h-4 text-[hsl(38,52%,40%)]" /> Photos
            </Link>
            <Link href="/gallery/videos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm border-b hover:bg-gray-50">
              <Video className="w-4 h-4 text-[hsl(38,52%,40%)]" /> Videos
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
