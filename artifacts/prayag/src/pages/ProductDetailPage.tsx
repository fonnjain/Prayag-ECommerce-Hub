import { useState } from "react";
import { useParams, Link } from "wouter";
import { Heart, ShoppingCart, Star, Shield, Truck, RotateCcw, Share2, ChevronRight, Minus, Plus } from "lucide-react";
import { useGetProduct, useGetRelatedProducts, useAddToCart, useAddToWishlist, getGetProductQueryKey, getGetRelatedProductsQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

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
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Product not found.</p>
      <Link href="/products"><button className="mt-4 text-[hsl(215,100%,34%)] hover:underline">Browse products</button></Link>
    </div>
  );

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl || ""];
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const gstAmount = Math.round(product.price * (product.gstPercent / 100) * 100) / 100;

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[hsl(215,100%,34%)]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-[hsl(215,100%,34%)]">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(28,22,16,0.03)_0%,rgba(28,22,16,0.08)_100%)]">
            <img
              src={images[activeImg] || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop"}
              alt={product.name}
              className="max-w-[75%] max-h-[75%] object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_16px_28px_rgba(28,22,16,0.16)]"
              data-testid="img-product-main"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 ${activeImg === i ? "border-[hsl(215,100%,34%)]" : "border-gray-100"}`}
                data-testid={`button-img-thumb-${i}`}>
                <img src={img || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&h=100&fit=crop"} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs text-gray-400 font-mono mb-1" data-testid="text-sku">SKU: {product.sku}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug" data-testid="text-product-name">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
            </div>
            <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-black text-gray-900" data-testid="text-price">₹{product.price.toLocaleString("en-IN")}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through" data-testid="text-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>
                <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">+ GST ({product.gstPercent}%): ₹{gstAmount.toLocaleString("en-IN")} | Total incl. GST: ₹{(product.price + gstAmount).toLocaleString("en-IN")}</p>

          <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full mb-5 ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`} data-testid="text-stock-status">
            <div className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
            {product.inStock ? "In Stock" : "Out of Stock"}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors" data-testid="button-qty-dec"><Minus className="w-4 h-4" /></button>
              <span className="px-4 py-2 font-medium border-x border-gray-200 text-sm" data-testid="text-qty">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-gray-50 transition-colors" data-testid="button-qty-inc"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={!product.inStock || addToCart.isPending}
              className="flex-1 bg-[hsl(215,100%,34%)] text-white font-bold py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              data-testid="button-add-to-cart">
              <ShoppingCart className="w-5 h-5" />
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </button>
            <button onClick={handleWishlist}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:text-red-500 transition-colors"
              data-testid="button-wishlist">
              <Heart className="w-5 h-5" />
            </button>
            <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[hsl(215,100%,34%)] transition-colors" data-testid="button-share">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            {[
              { icon: Shield, label: "Genuine Product" },
              { icon: Truck, label: "Free Delivery ₹5000+" },
              { icon: RotateCcw, label: "Easy Returns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon className="w-5 h-5 text-[hsl(215,100%,34%)]" />
                <span className="text-xs text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-10">
        <div className="flex border-b border-gray-100">
          {["description", "specifications", "warranty"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3.5 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "border-b-2 border-[hsl(215,100%,34%)] text-[hsl(215,100%,34%)]" : "text-gray-500 hover:text-gray-800"}`}
              data-testid={`button-tab-${tab}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6 prose prose-sm max-w-none text-gray-600">
          {activeTab === "description" && <p>{product.description || "No description available."}</p>}
          {activeTab === "specifications" && (
            product.specifications ? (
              <pre className="whitespace-pre-wrap text-sm font-sans">{product.specifications}</pre>
            ) : <p>No specifications available.</p>
          )}
          {activeTab === "warranty" && (
            <p>{product.warranty || "Standard 1-year manufacturer warranty. Contact customer care for claims."}</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related && related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
