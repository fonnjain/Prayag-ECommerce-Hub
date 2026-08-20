import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAddToCart, useAddToWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useCartStore } from "@/lib/store";
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
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { toast } = useToast();
  const { setItemCount } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const [, setLocation] = useLocation();
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

  return (
    <Link href={`/products/${product.slug}`} data-testid={`card-product-${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
        whileHover={{ y: -6 }}
        className="group relative bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 overflow-hidden cursor-pointer h-full flex flex-col hover:shadow-2xl"
      >
        <div className="relative aspect-square bg-[#Fcfcfc] overflow-hidden flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {product.imageUrl ? (
            <motion.img 
              initial={false}
              src={product.imageUrl} 
              alt={product.name} 
              loading="lazy" 
              className="relative w-full h-full object-contain mix-blend-multiply"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100/50">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
            </div>
          )}

          {product.discount && product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-[hsl(24,10%,16%)] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-none" data-testid={`text-discount-${product.id}`}>
              {product.discount}% OFF
            </div>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white/90 text-gray-900 border border-gray-200 uppercase tracking-widest text-[10px] font-bold px-4 py-2 shadow-sm">Out of Stock</span>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-8 group-hover:translate-x-0 group-focus-within:translate-x-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500 ease-[0.21,0.47,0.32,0.98]">
            <button onClick={handleWishlist} aria-label={`Add ${product.name} to wishlist`} className="w-10 h-10 bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:text-red-500 text-gray-400 transition-colors" data-testid={`button-wishlist-${product.id}`}>
              <Heart className="w-4 h-4" />
            </button>
            <span aria-hidden="true" className="w-10 h-10 bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-[hsl(24,10%,16%)] group-hover:text-white group-hover:border-transparent text-gray-400 transition-colors">
              <Eye className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1 relative z-10 bg-white">
          <div className="text-[10px] text-gray-400 font-mono tracking-wider mb-2 uppercase" data-testid={`text-sku-${product.id}`}>SKU: {product.sku}</div>
          <div className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-3 group-hover:text-[hsl(38,52%,40%)] transition-colors flex-1" data-testid={`text-name-${product.id}`}>
            {product.name}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-[10px] h-[10px] ${s <= Math.round(product.rating) ? "fill-[hsl(42,62%,68%)] text-[hsl(42,62%,68%)]" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount})</span>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-lg font-bold text-gray-900 tracking-tight" data-testid={`text-price-${product.id}`}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-gray-400 line-through mb-0.5" data-testid={`text-mrp-${product.id}`}>
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart} disabled={!product.inStock || addToCart.isPending}
              className="w-full relative overflow-hidden bg-transparent border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-wider py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group/btn hover:border-[hsl(24,10%,16%)]"
              data-testid={`button-add-cart-${product.id}`}>
              <div className="absolute inset-0 bg-[hsl(24,10%,16%)] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <ShoppingCart className="w-3.5 h-3.5 relative z-10 group-hover/btn:text-white transition-colors duration-300" />
              <span className="relative z-10 group-hover/btn:text-white transition-colors duration-300">
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
