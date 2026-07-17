import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAddToCart, useAddToWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

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
}

export default function ProductCard({ product }: Props) {
  const { toast } = useToast();
  const { setItemCount } = useCartStore();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: (cart) => {
        setItemCount(cart.itemCount);
        queryClient.setQueryData(getGetCartQueryKey(), cart);
        toast({ title: "Added to cart", description: product.name });
      },
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist.mutate({ data: { productId: product.id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Added to wishlist" });
      },
    });
  }

  return (
    <Link href={`/products/${product.slug}`} data-testid={`card-product-${product.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[hsl(24,10%,16%)]/40 hover:shadow-[0_20px_40px_-12px_rgba(28,22,16,0.25)] transition-shadow duration-300 overflow-hidden cursor-pointer h-full"
      >
        <div className="relative aspect-square bg-gradient-to-br from-stone-100/60 to-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-[hsl(24,10%,16%)]/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-[hsl(24,10%,16%)]/40" />
              </div>
            </div>
          )}

          {product.discount && product.discount > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,24%)] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md" data-testid={`text-discount-${product.id}`}>
              -{product.discount}%
            </div>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Floating quick actions */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 group-focus-within:translate-x-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300">
            <button onClick={handleWishlist} aria-label={`Add ${product.name} to wishlist`} className="w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow-md flex items-center justify-center hover:bg-red-500 hover:text-white text-gray-600 transition-colors" data-testid={`button-wishlist-${product.id}`}>
              <Heart className="w-4 h-4" />
            </button>
            <span aria-hidden="true" className="w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow-md flex items-center justify-center group-hover:bg-[hsl(24,10%,16%)] group-hover:text-white text-gray-600 transition-colors">
              <Eye className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] text-gray-400 font-mono mb-0.5" data-testid={`text-sku-${product.id}`}>SKU: {product.sku}</div>
          <div className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-[hsl(24,10%,16%)] transition-colors" data-testid={`text-name-${product.id}`}>
            {product.name}
          </div>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-black text-gray-900" data-testid={`text-price-${product.id}`}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through" data-testid={`text-mrp-${product.id}`}>
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAddToCart} disabled={!product.inStock || addToCart.isPending}
            className="shimmer-hover w-full bg-gradient-to-r from-[hsl(24,10%,16%)] to-[hsl(24,9%,26%)] text-white text-xs font-bold py-2.5 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-1.5"
            data-testid={`button-add-cart-${product.id}`}>
            <ShoppingCart className="w-3.5 h-3.5" />
            {addToCart.isPending ? "Adding..." : "Add to Cart"}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
