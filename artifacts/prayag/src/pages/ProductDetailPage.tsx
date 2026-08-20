import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Heart, ShoppingCart, Star, Shield, Truck, RotateCcw, Share2, ChevronRight, Minus, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useGetProduct, useGetRelatedProducts, useListCategories, useAddToCart, useAddToWishlist, getGetProductQueryKey, getGetRelatedProductsQueryKey, getGetWishlistQueryKey, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { setItemCount } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const [, setLocation] = useLocation();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  const { data: product, isLoading, isError } = useGetProduct(slug!, {
    query: { enabled: !!slug, queryKey: getGetProductQueryKey(slug!) },
  });
  const { data: related } = useGetRelatedProducts(slug!, {
    query: { enabled: !!slug, queryKey: getGetRelatedProductsQueryKey(slug!) },
  });
  const { data: categories } = useListCategories();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  if (isLoading) return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-none bg-gray-100" />
        <div className="space-y-8 py-10">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="h-px bg-gray-100 my-8" />
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-16 w-full mt-10" />
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <h2 className="font-serif-lux text-3xl mb-4">Piece Unavailable</h2>
      <p className="text-gray-500 mb-8">The requested item is no longer available or could not be found.</p>
      <Link href="/products">
        <button className="bg-[hsl(24,10%,16%)] text-white text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[hsl(42,62%,68%)] hover:text-white transition-colors">
          Return to Collection
        </button>
      </Link>
    </div>
  );

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl || ""];
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const gstPercent = product.gstPercent ?? 18;
  const gstAmount = Math.round(product.price * (gstPercent / 100) * 100) / 100;

  function handleAddToCart() {
    addToCart.mutate({ data: { productId: product!.id, quantity: qty } }, {
      onSuccess: (cart) => {
        queryClient.setQueryData(getGetCartQueryKey(), cart);
        setItemCount(cart.itemCount);
        toast({ title: "Added to cart!", description: `${qty} × ${product!.name}` });
      },
    });
  }

  function handleWishlist() {
    if (!user) {
      toast({ title: "Sign in to save favorites", description: "Please sign in before adding items to your wishlist." });
      setLocation("/login");
      return;
    }
    addToWishlist.mutate({ data: { productId: product!.id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Added to wishlist" });
      },
    });
  }

  return (
    <div className="bg-[#FAF9F7] min-h-screen pt-4 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Elegant Breadcrumb */}
        <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
          <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-gray-900 hover:text-[hsl(42,62%,68%)] transition-colors pr-4 border-r border-gray-300" data-testid="button-back">
            <ArrowLeft className="w-3.5 h-3.5" /> Return
          </button>
          <Link href="/" className="hover:text-gray-900 transition-colors ml-1">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link href="/products" className="hover:text-gray-900 transition-colors">Collection</Link>
          {(() => {
            const cat = (categories || []).find(c => c.id === product.categoryId);
            return cat ? (
              <>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <Link href={`/products?category=${cat.slug}`} className="hover:text-gray-900 transition-colors">{cat.name}</Link>
              </>
            ) : null;
          })()}
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-[hsl(24,10%,16%)] truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid xl:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Majestic Gallery Stage */}
          <div className="xl:col-span-7 flex flex-col-reverse lg:flex-row gap-6">
            {/* Thumbnail Column */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 flex-shrink-0 scrollbar-hide pb-2 lg:pb-0">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`relative w-20 lg:w-full aspect-square flex-shrink-0 bg-white border transition-all duration-300 ${activeImg === i ? "border-[hsl(24,10%,16%)] ring-1 ring-[hsl(24,10%,16%)] ring-offset-2 ring-offset-[#FAF9F7]" : "border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100"}`}
                  data-testid={`button-img-thumb-${i}`}>
                  <img src={img || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop"} alt="" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                </button>
              ))}
            </div>

            {/* Main Stage */}
            <div className="flex-1 bg-white border border-gray-100 aspect-square lg:aspect-auto lg:h-[700px] flex items-center justify-center p-10 relative group overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0)_70%)]" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  src={images[activeImg] || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=1200&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply relative z-10"
                  data-testid="img-product-main"
                />
              </AnimatePresence>
              
              {product.discount && product.discount > 0 && (
                <div className="absolute top-6 right-6 bg-[hsl(24,10%,16%)] text-white text-xs font-bold tracking-widest uppercase px-4 py-2 z-20">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Info Console */}
          <div className="xl:col-span-5 flex flex-col py-4 lg:py-8">
            <div className="text-[11px] font-mono tracking-[0.2em] text-gray-400 uppercase mb-4" data-testid="text-sku">SKU: {product.sku}</div>
            
            <h1 className="text-3xl lg:text-[48px] font-bold tracking-tight text-gray-900 mb-6 leading-[1.15]" data-testid="text-product-name">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-[hsl(42,62%,68%)] text-[hsl(42,62%,68%)]" />
                <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                <span className="text-xs text-gray-400 font-medium ml-1">({product.reviewCount} reviews)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${product.inStock ? "text-green-600" : "text-red-600"}`} data-testid="text-stock-status">
                <CheckCircle2 className="w-4 h-4" />
                {product.inStock ? "Ready to Dispatch" : "Out of Stock"}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-gray-200 to-transparent mb-8" />

            {/* Price Block */}
            <div className="mb-10">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight" data-testid="text-price">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1.5" data-testid="text-mrp">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-3">
                <p className="text-sm text-gray-500 font-medium">+ GST ({gstPercent}%): ₹{gstAmount.toLocaleString("en-IN")}</p>
                <p className="text-sm text-[hsl(24,10%,16%)] font-bold">Total incl. GST: ₹{(product.price + gstAmount).toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Action Area */}
            <div className="bg-white border border-gray-200 p-6 md:p-8 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center border border-gray-300 h-14 md:w-32 flex-shrink-0">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" data-testid="button-qty-dec"><Minus className="w-4 h-4" /></button>
                  <span className="flex-1 text-center font-bold text-gray-900" data-testid="text-qty">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" data-testid="button-qty-inc"><Plus className="w-4 h-4" /></button>
                </div>
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart} 
                  disabled={!product.inStock || addToCart.isPending}
                  className="flex-1 h-14 bg-[hsl(24,10%,16%)] text-white font-bold uppercase tracking-widest text-xs hover:bg-[hsl(38,52%,42%)] disabled:opacity-50 transition-colors flex items-center justify-center gap-3 relative overflow-hidden group"
                  data-testid="button-add-to-cart">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <ShoppingCart className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{addToCart.isPending ? "Processing..." : "Add to Cart"}</span>
                </motion.button>
              </div>

              <div className="flex gap-4">
                <button onClick={handleWishlist}
                  className="flex-1 h-12 border border-gray-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  data-testid="button-wishlist">
                  <Heart className="w-4 h-4" /> Save
                </button>
                <button className="h-12 px-6 border border-gray-300 flex items-center justify-center text-gray-700 hover:border-[hsl(24,10%,16%)] hover:bg-[hsl(24,10%,16%)] hover:text-white transition-all" data-testid="button-share">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Premium Guarantees */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              {[
                { icon: Shield, title: "Authentic", desc: "100% Genuine" },
                { icon: Truck, title: "Delivery", desc: "Free over ₹5000" },
                { icon: RotateCcw, title: "Returns", desc: "7-day policy" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-1">
                    <Icon className="w-4 h-4 text-[hsl(42,62%,68%)]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mb-20 grid lg:grid-cols-[280px_1fr] border border-gray-200 shadow-sm overflow-hidden">
          {/* Dark tab rail */}
          <div className="bg-[hsl(24,10%,16%)] flex lg:flex-col">
            <div className="hidden lg:block px-8 pt-10 pb-6">
              <p className="text-[hsl(42,62%,68%)] text-[11px] font-bold uppercase tracking-[0.25em] mb-2">Know Your Piece</p>
              <div className="w-10 h-0.5 bg-[hsl(42,62%,68%)]" />
            </div>
            {[
              { id: "description", label: "Description", icon: Star },
              { id: "specifications", label: "Specifications", icon: CheckCircle2 },
              { id: "warranty", label: "Warranty", icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 lg:flex-none flex items-center gap-3 px-4 lg:px-8 py-4 lg:py-5 text-xs font-bold uppercase tracking-widest transition-all text-left relative ${activeTab === id ? "text-white bg-white/[0.06]" : "text-white/40 hover:text-white/80"}`}
                data-testid={`button-tab-${id}`}>
                {activeTab === id && (
                  <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 lg:w-1 bg-[hsl(42,62%,68%)]" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === id ? "text-[hsl(42,62%,68%)]" : ""}`} />
                <span className="text-[10px] sm:text-xs">{label}</span>
              </button>
            ))}
            <div className="hidden lg:block mt-auto px-8 py-8 border-t border-white/10">
              <p className="text-white/40 text-[11px] leading-relaxed">Strong. Beautiful. Prayag. — crafted for Indian homes since day one.</p>
            </div>
          </div>

          {/* Content area */}
          <div className="bg-white relative min-h-[320px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,hsl(42,62%,68%,0.12),transparent_70%)] pointer-events-none" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-8 md:p-12"
              >
                {activeTab === "description" && (
                  <div>
                    <h3 className="font-serif-lux font-bold text-2xl text-gray-900 mb-6">The Story of This Piece</h3>
                    <p className="text-gray-700 leading-relaxed text-base font-medium first-letter:text-6xl first-letter:font-serif-lux first-letter:font-bold first-letter:text-[hsl(38,52%,40%)] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85]">
                      {product.description || "The epitome of craftsmanship, designed to elevate your living spaces with enduring quality and timeless aesthetics."}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100">
                      {[
                        { title: "Premium Build", desc: "Engineered with rigorously tested materials" },
                        { title: "Made in India", desc: "Proudly manufactured for Indian conditions" },
                        { title: "Trusted Brand", desc: "Chosen by thousands of homes and dealers" },
                      ].map(f => (
                        <div key={f.title} className="border border-gray-100 bg-[#FAF9F7] p-5">
                          <CheckCircle2 className="w-4 h-4 text-[hsl(42,62%,68%)] mb-3" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">{f.title}</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "specifications" && (
                  <div>
                    <h3 className="font-serif-lux text-2xl text-gray-900 mb-6">Technical Specifications</h3>
                    {product.specifications ? (
                      <div className="divide-y divide-gray-100 border border-gray-100">
                        {product.specifications.split(/\r?\n/).filter(l => l.trim()).map((line, i) => {
                          const idx = line.indexOf(":");
                          const label = idx > 0 ? line.slice(0, idx).trim() : null;
                          const value = idx > 0 ? line.slice(idx + 1).trim() : line.trim();
                          return (
                            <div key={i} className={`grid sm:grid-cols-[220px_1fr] ${i % 2 === 0 ? "bg-[#FAF9F7]" : "bg-white"}`}>
                              <div className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label || `Detail ${i + 1}`}</div>
                              <div className="px-5 py-3.5 text-sm text-gray-800">{value}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600 leading-relaxed">Detailed specifications are included in the product manual. Contact your nearest showroom for precise technical dimensions.</p>
                    )}
                  </div>
                )}
                {activeTab === "warranty" && (
                  <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
                    <div className="w-24 h-24 rounded-full border-2 border-[hsl(42,62%,68%)] flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                      <Shield className="w-10 h-10 text-[hsl(42,62%,68%)]" />
                    </div>
                    <div>
                      <h3 className="font-serif-lux font-bold text-2xl text-gray-900 mb-4">Our Promise, In Writing</h3>
                      <p className="text-gray-700 leading-relaxed text-base font-medium mb-8">
                        {product.warranty || "Backed by our comprehensive manufacturer warranty. We stand behind the quality and durability of every piece that bears our name."}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {["Genuine Parts", "Pan-India Service", "Easy Claims"].map(b => (
                          <span key={b} className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(42,62%,68%)]" /> {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related Collection */}
        {related && related.length > 0 && (
          <div className="relative -mx-6 px-6 py-16 md:py-20 bg-[hsl(24,10%,16%)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,hsl(42,62%,68%,0.14),transparent_65%)]" />
              <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[radial-gradient(circle,hsl(42,62%,68%,0.08),transparent_65%)]" />
              <span className="absolute top-6 left-1/2 -translate-x-1/2 font-serif-lux text-[9rem] md:text-[13rem] leading-none text-white/[0.035] select-none whitespace-nowrap">PRAYAG</span>
            </div>
            <div className="relative max-w-[1400px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
                <div>
                  <p className="text-[hsl(42,62%,68%)] text-[11px] font-bold uppercase tracking-[0.3em] mb-3">Curated For You</p>
                  <h2 className="text-3xl md:text-4xl font-serif-lux text-white">Related Products</h2>
                </div>
                <Link href="/products">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-[hsl(42,62%,68%)] transition-colors cursor-pointer">
                    View Full Collection <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
              <div className="related-marquee-wrap relative overflow-hidden -mx-6 px-6" style={{ maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)" }}>
                <div className="related-marquee flex gap-4 md:gap-6 w-max">
                  {[0, 1].map(dup => (
                    <div key={dup} className="flex gap-4 md:gap-6" aria-hidden={dup === 1}>
                      {related.slice(0, 8).map((p, i) => (
                        <Link key={`${dup}-${p.id}`} href={`/products/${p.slug}`} data-testid={dup === 0 ? `card-related-${p.id}` : undefined} tabIndex={dup === 1 ? -1 : undefined}>
                          <div className="group relative bg-white/[0.05] border border-white/10 hover:border-[hsl(42,62%,68%)]/60 transition-colors duration-500 cursor-pointer h-full flex flex-col overflow-hidden w-[240px] md:w-[300px]">
                            <div className="relative aspect-square bg-white m-3 mb-0 flex items-center justify-center p-4 overflow-hidden">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} loading="lazy"
                                  className="relative w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                              ) : (
                                <Star className="w-10 h-10 text-gray-200" />
                              )}
                            </div>
                            <div className="p-4 md:p-5 flex flex-col flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">{p.sku}</p>
                              <h3 className="text-sm md:text-base text-white font-medium leading-snug mb-3 line-clamp-2 group-hover:text-[hsl(42,62%,68%)] transition-colors">{p.name}</h3>
                              <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[hsl(42,62%,68%)] font-bold">₹{p.price.toLocaleString("en-IN")}</span>
                                  {p.mrp > p.price && <span className="text-white/30 text-xs line-through">₹{p.mrp.toLocaleString("en-IN")}</span>}
                                </div>
                                <span className="w-7 h-7 rounded-full border border-white/20 group-hover:border-[hsl(42,62%,68%)] group-hover:bg-[hsl(42,62%,68%)] flex items-center justify-center transition-all">
                                  <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-[hsl(24,10%,16%)]" />
                                </span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(42,62%,68%)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
