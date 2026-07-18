import { useState } from "react";
import { useParams, Link } from "wouter";
import { Heart, ShoppingCart, Star, Shield, Truck, RotateCcw, Share2, ChevronRight, Minus, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useGetProduct, useGetRelatedProducts, useListCategories, useAddToCart, useAddToWishlist, getGetProductQueryKey, getGetRelatedProductsQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { setItemCount } = useCartStore();
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
        setItemCount(cart.itemCount);
        toast({ title: "Added to cart!", description: `${qty} × ${product!.name}` });
      },
    });
  }

  function handleWishlist() {
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
            
            <h1 className="text-3xl lg:text-4xl font-serif-lux font-semibold text-gray-900 mb-6 leading-[1.1]" data-testid="text-product-name">
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
                  className="flex-1 h-14 bg-[hsl(24,10%,16%)] text-white font-bold uppercase tracking-widest text-xs hover:bg-[hsl(42,62%,68%)] disabled:opacity-50 transition-colors flex items-center justify-center gap-3 relative overflow-hidden group"
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
        <div className="bg-white border border-gray-200 mb-20 max-w-5xl mx-auto shadow-sm">
          <div className="flex flex-wrap border-b border-gray-200">
            {["description", "specifications", "warranty"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[150px] px-8 py-5 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? "text-[hsl(24,10%,16%)]" : "text-gray-400 hover:text-gray-900 bg-gray-50/50"}`}
                data-testid={`button-tab-${tab}`}>
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(24,10%,16%)]" />
                )}
              </button>
            ))}
          </div>
          <div className="p-8 md:p-12 prose prose-gray max-w-none text-gray-600 leading-relaxed font-serif-lux text-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "description" && <p>{product.description || "The epitome of craftsmanship, designed to elevate your living spaces with enduring quality and timeless aesthetics."}</p>}
                {activeTab === "specifications" && (
                  product.specifications ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-6 border border-gray-100 rounded-none text-gray-700">{product.specifications}</pre>
                  ) : <p>Detailed specifications are included in the product manual. Contact your nearest showroom for precise technical dimensions.</p>
                )}
                {activeTab === "warranty" && (
                  <p>{product.warranty || "Backed by our comprehensive manufacturer warranty. We stand behind the quality and durability of every piece that bears our name."}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related Collection */}
        {related && related.length > 0 && (
          <div className="border-t border-gray-200 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif-lux text-gray-900 mb-4">Complementary Pieces</h2>
              <div className="w-12 h-0.5 bg-[hsl(42,62%,68%)] mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
