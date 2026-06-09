import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, User, ChevronDown, Menu, X, Phone, MapPin, Package, BookOpen, Building2, Truck } from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useGetCart, useGetSearchSuggestions, getGetSearchSuggestionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "CP Faucets", slug: "cp-faucets" },
  { label: "PTMT Faucets", slug: "ptmt-faucets" },
  { label: "Sanitaryware", slug: "sanitaryware" },
  { label: "Kitchen Sinks", slug: "kitchen-sinks" },
  { label: "Water Heaters", slug: "water-heaters" },
  { label: "Pipes & Fittings", slug: "pipes-fittings" },
  { label: "Bathroom Accessories", slug: "bathroom-accessories" },
  { label: "More Categories", slug: "" },
];

export default function Header() {
  const [searchQ, setSearchQ] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { itemCount, setItemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: cart } = useGetCart();
  const { data: suggestions } = useGetSearchSuggestions(
    { q: searchQ },
    { query: { enabled: searchQ.length >= 2, queryKey: getGetSearchSuggestionsQueryKey({ q: searchQ }) } }
  );

  useEffect(() => {
    if (cart) setItemCount(cart.itemCount);
  }, [cart, setItemCount]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) { setLocation(`/products?search=${encodeURIComponent(searchQ)}`); setShowSuggestions(false); }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[hsl(215,100%,34%)] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <Link href="/dealer-registration" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <Building2 className="w-3 h-3" /> Become a Dealer
            </Link>
            <Link href="/distributor-registration" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <Truck className="w-3 h-3" /> Become a Distributor
            </Link>
            <Link href="/account/orders" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <Package className="w-3 h-3" /> Track Order
            </Link>
            <a href="#" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <BookOpen className="w-3 h-3" /> Download Catalogue
            </a>
            <Link href="/dealer" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <Building2 className="w-3 h-3" /> Bulk Order
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>Customer Care: <strong>1800-123-7729</strong></span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black text-[hsl(215,100%,34%)] tracking-tight">PRAYAG</span>
            <span className="text-[9px] font-medium text-gray-500 tracking-widest uppercase">Plumbing & Sanitaryware</span>
          </div>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-xl relative" data-testid="search-bar">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="search"
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setShowSuggestions(e.target.value.length >= 2); }}
              onFocus={() => searchQ.length >= 2 && setShowSuggestions(true)}
              placeholder="Search for faucets, sanitaryware, pipes..."
              className="w-full border-2 border-[hsl(215,100%,34%)] rounded-l-md px-4 py-2 text-sm outline-none"
              data-testid="input-search"
            />
            <button type="submit" className="bg-[hsl(215,100%,34%)] text-white px-4 rounded-r-md hover:bg-[hsl(215,100%,28%)] transition-colors">
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
        <div className="flex items-center gap-3">
          <Link href="/account/wishlist" className="flex flex-col items-center text-gray-600 hover:text-[hsl(215,100%,34%)] transition-colors" data-testid="link-wishlist">
            <Heart className="w-5 h-5" />
            <span className="text-[10px]">Wishlist</span>
          </Link>

          <div className="relative">
            <button onClick={() => setShowUserMenu(p => !p)} className="flex flex-col items-center text-gray-600 hover:text-[hsl(215,100%,34%)] transition-colors" data-testid="button-user-menu">
              <User className="w-5 h-5" />
              <span className="text-[10px]">{user ? user.name.split(" ")[0] : "Account"}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                {user ? (
                  <>
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                    {user.role === "admin" && <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Admin Panel</Link>}
                    {user.role === "dealer" && <Link href="/dealer" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Dealer Portal</Link>}
                    {user.role === "distributor" && <Link href="/distributor" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Distributor Portal</Link>}
                    <hr className="my-1" />
                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Sign In</Link>
                    <Link href="/register" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Register</Link>
                    <Link href="/dealer-registration" className="block px-4 py-2 text-sm text-[hsl(215,100%,34%)] hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Become a Dealer</Link>
                    <Link href="/distributor-registration" className="block px-4 py-2 text-sm text-[hsl(215,100%,34%)] hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>Become a Distributor</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/cart" className="flex flex-col items-center relative text-gray-600 hover:text-[hsl(215,100%,34%)] transition-colors" data-testid="link-cart">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold" data-testid="cart-count">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Cart</span>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(p => !p)} data-testid="button-mobile-menu">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Bar */}
      <nav className="bg-[hsl(215,100%,34%)] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex">
          {navItems.map(item => (
            <Link key={item.slug} href={item.slug ? `/products?category=${item.slug}` : "/products"}
              className="text-white text-sm font-medium px-4 py-2.5 hover:bg-[hsl(215,100%,28%)] transition-colors whitespace-nowrap flex items-center gap-1"
              data-testid={`nav-${item.slug || "more"}`}>
              {item.label}
              {item.label === "More Categories" && <ChevronDown className="w-3 h-3" />}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          {navItems.map(item => (
            <Link key={item.slug} href={item.slug ? `/products?category=${item.slug}` : "/products"}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm border-b hover:bg-gray-50">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
