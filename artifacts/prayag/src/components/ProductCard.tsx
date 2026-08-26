import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAddToCart, useAddToWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import SkuBadge from "./SkuBadge";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrp: number;
  discount?: number | null;
  imageUrl?: string | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  categoryName?: string | null;
}

interface Props {
  product: Product;
  index?: number;
  view?: "grid" | "list";
}

export default function ProductCard({ product, index = 0, view = "grid" }: Props) {
  const isListView = view === "list";
  const hasPublishedPrice = product.price > 0;
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { setItemCount } = useCartStore();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const [isCardHovered, setIsCardHovered] = useState(false);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in to save favorites", description: "Please sign in before adding items to your wishlist." });
      setLocation("/login");
      return;
    }
    addToWishlist.mutate({ data: { productId: product.id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Added to wishlist" });
      },
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: (cart) => {
        queryClient.setQueryData(getGetCartQueryKey(), cart);
        setItemCount(cart.itemCount);
        toast({ title: "Added to cart", description: product.name });
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Please try again.";
        toast({ title: "Couldn't add to cart", description: message, variant: "destructive" });
      },
    });
  }

  return (
    <Link href={`/products/${product.slug}`} className="block w-full" data-testid={`card-product-${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
        whileHover={{ y: -6 }}
        onHoverStart={() => setIsCardHovered(true)}
        onHoverEnd={() => setIsCardHovered(false)}
        className={`group relative flex w-full min-w-0 cursor-pointer overflow-hidden rounded-[1.35rem] border bg-white transition-all duration-500 ${
          isListView ? "flex-row" : "h-full flex-col"
        } ${
          isCardHovered
            ? "border-[hsl(38,52%,45%)]/55 shadow-[0_24px_50px_-24px_rgba(42,28,18,0.75)]"
            : "border-[hsl(24,10%,16%)]/10 shadow-[0_12px_35px_-24px_rgba(42,28,18,0.75)]"
        }`}
      >
        <div className={`relative flex-shrink-0 overflow-hidden bg-[#f4f0ea] p-4 ${
          isListView
            ? "h-32 w-32 border-r border-[hsl(24,10%,16%)]/8 sm:h-40 sm:w-40"
            : "aspect-[1.05] w-full border-b border-[hsl(24,10%,16%)]/8"
        }`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.95),transparent_48%),linear-gradient(145deg,rgba(202,164,104,0.12),transparent_52%)]" />
          <div className="pointer-events-none absolute inset-3 rounded-[1rem] border border-white/70" />
          <div className="absolute left-4 top-4 z-10 rounded-full border border-[hsl(38,52%,45%)]/25 bg-white/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[hsl(24,10%,16%)] backdrop-blur-sm">
            Prayag
          </div>
          {product.imageUrl ? (
            <motion.img 
              initial={false}
              src={product.imageUrl} 
              alt={product.name} 
              loading="lazy" 
              className="relative z-[1] h-full w-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(38,52%,45%)]/20 bg-white/60">
                <ShoppingCart className="h-7 w-7 text-[hsl(38,52%,45%)]/45" />
              </div>
            </div>
          )}

          {product.discount && product.discount > 0 && (
            <div className="absolute right-4 top-4 z-10 rounded-full bg-[hsl(24,10%,16%)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-lg" data-testid={`text-discount-${product.id}`}>
              {product.discount}% OFF
            </div>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[hsl(24,10%,16%)]/45 backdrop-blur-sm">
              <span className="rounded-full border border-white/40 bg-[hsl(24,10%,16%)]/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">Out of Stock</span>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute bottom-4 right-4 z-10 flex translate-y-3 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <button onClick={handleWishlist} aria-label={`Add ${product.name} to wishlist`} className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(24,10%,16%)]/10 bg-white/90 text-[hsl(24,10%,16%)] shadow-lg backdrop-blur-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500" data-testid={`button-wishlist-${product.id}`}>
              <Heart className="h-3.5 w-3.5" />
            </button>
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(24,10%,16%)] text-white shadow-lg transition-colors">
              <Eye className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className={`relative z-10 flex min-w-0 flex-1 flex-col bg-white ${isListView ? "p-3 sm:p-5" : "p-4 sm:p-5"}`}>
          <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-2">
            <SkuBadge sku={product.sku} className="max-w-full whitespace-normal px-2.5 py-0.5 text-[10px] tracking-[0.12em]" data-testid={`text-sku-${product.id}`} />
            {product.categoryName && (
              <span className="max-w-[45%] truncate pt-1 text-right text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(38,52%,45%)]">
                {product.categoryName}
              </span>
            )}
          </div>
          <div className="mb-3 line-clamp-2 flex-1 text-sm font-bold leading-snug text-[hsl(24,10%,16%)] transition-colors group-hover:text-[hsl(38,52%,40%)] sm:text-[15px]" data-testid={`text-name-${product.id}`}>
            {product.name}
          </div>
          
          <div className="mt-auto">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-3 w-3 ${s <= Math.round(product.rating) ? "fill-[hsl(42,62%,68%)] text-[hsl(42,62%,68%)]" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-[10px] font-medium text-gray-400">({product.reviewCount})</span>
            </div>
            <div className="mb-4 flex items-end justify-between gap-2">
              {hasPublishedPrice ? (
                <>
                  <div>
                    <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">MRP</span>
                    <span className="text-xl font-black tracking-tight text-[hsl(24,10%,16%)]" data-testid={`text-price-${product.id}`}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {product.mrp > product.price && (
                    <span className="mb-1 text-xs text-gray-400 line-through" data-testid={`text-mrp-${product.id}`}>
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </>
              ) : (
                <div>
                  <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">Official catalogue</span>
                  <span className="text-sm font-bold text-[hsl(38,52%,40%)]" data-testid={`text-price-${product.id}`}>Price on request</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[hsl(24,10%,16%)] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[hsl(38,52%,40%)] disabled:cursor-wait disabled:opacity-70"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 bg-[hsl(42,62%,68%)] transition-transform duration-500 group-hover:scale-x-100" />
      </motion.div>
    </Link>
  );
}
