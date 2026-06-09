import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";
import { useAddToCart, useAddToWishlist } from "@workspace/api-client-react";
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
  const { setItemCount, itemCount } = useCartStore();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: (cart) => {
        setItemCount(cart.itemCount);
        toast({ title: "Added to cart", description: product.name });
      },
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    addToWishlist.mutate({ data: { productId: product.id } }, {
      onSuccess: () => toast({ title: "Added to wishlist" }),
    });
  }

  return (
    <Link href={`/products/${product.slug}`} data-testid={`card-product-${product.id}`}>
      <div className="group bg-white rounded-xl border border-gray-100 hover:border-[hsl(215,100%,34%)] hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-[hsl(215,100%,34%)]/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-[hsl(215,100%,34%)]/40" />
              </div>
            </div>
          )}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" data-testid={`text-discount-${product.id}`}>
              -{product.discount}%
            </div>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          <button onClick={handleWishlist} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" data-testid={`button-wishlist-${product.id}`}>
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="text-[10px] text-gray-400 font-mono mb-0.5" data-testid={`text-sku-${product.id}`}>SKU: {product.sku}</div>
          <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-[hsl(215,100%,34%)] transition-colors" data-testid={`text-name-${product.id}`}>
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
            <span className="text-base font-bold text-gray-900" data-testid={`text-price-${product.id}`}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through" data-testid={`text-mrp-${product.id}`}>
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={!product.inStock || addToCart.isPending}
            className="w-full bg-[hsl(215,100%,34%)] text-white text-xs font-medium py-2 rounded-lg hover:bg-[hsl(215,100%,28%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
            data-testid={`button-add-cart-${product.id}`}>
            <ShoppingCart className="w-3.5 h-3.5" />
            {addToCart.isPending ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
