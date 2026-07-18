import { useState } from "react";
import { Link } from "wouter";
import { Minus, Plus, Trash2, Tag, ShoppingCart, ArrowRight } from "lucide-react";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useApplyCoupon, getGetCartQueryKey } from "@workspace/api-client-react";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { setItemCount } = useCartStore();
  const [coupon, setCoupon] = useState("");

  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const applyCoupon = useApplyCoupon();

  function invalidate(c: any) {
    qc.setQueryData(getGetCartQueryKey(), c);
    setItemCount(c.itemCount);
  }

  function handleQtyChange(itemId: number, qty: number) {
    updateItem.mutate({ itemId, data: { quantity: qty } }, { onSuccess: invalidate });
  }

  function handleRemove(itemId: number) {
    removeItem.mutate({ itemId }, { onSuccess: invalidate });
  }

  function handleApplyCoupon() {
    if (!coupon.trim()) return;
    applyCoupon.mutate({ data: { code: coupon.trim().toUpperCase() } }, {
      onSuccess: (c) => { invalidate(c); toast({ title: "Coupon applied!", description: `Saved ₹${c.discount}` }); },
      onError: () => toast({ title: "Invalid coupon", variant: "destructive" }),
    });
  }

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );

  if (!cart || cart.items.length === 0) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started</p>
      <Link href="/products">
        <button className="bg-[hsl(24,10%,16%)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[hsl(24,9%,26%)] transition-colors" data-testid="button-shop-now">
          Shop Now
        </button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cart.itemCount} items)</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {cart.items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4" data-testid={`row-cart-${item.id}`}>
              <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&h=100&fit=crop"} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productSlug}`}>
                  <p className="font-medium text-gray-900 text-sm hover:text-[hsl(38,52%,40%)] line-clamp-2">{item.productName}</p>
                </Link>
                <p className="text-[hsl(38,52%,40%)] font-bold mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => handleQtyChange(item.id, item.quantity - 1)} className="px-2.5 py-1 hover:bg-gray-50" data-testid={`button-dec-${item.id}`}><Minus className="w-3 h-3" /></button>
                    <span className="px-3 py-1 text-sm border-x border-gray-200" data-testid={`text-qty-${item.id}`}>{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item.id, item.quantity + 1)} className="px-2.5 py-1 hover:bg-gray-50" data-testid={`button-inc-${item.id}`}><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors" data-testid={`button-remove-${item.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900" data-testid={`text-subtotal-${item.id}`}>₹{item.subtotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cart.subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span>₹{cart.gst.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={cart.shipping === 0 ? "text-green-600 font-medium" : ""}>{cart.shipping === 0 ? "FREE" : `₹${cart.shipping}`}</span></div>
              {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{cart.discount.toLocaleString("en-IN")}</span></div>}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-[hsl(38,52%,40%)]" data-testid="text-grand-total">₹{cart.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Tag className="w-4 h-4 text-[hsl(38,52%,40%)]" />
              <span className="font-medium text-sm">Apply Coupon</span>
            </div>
            {cart.couponCode ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 font-medium">
                Coupon <strong>{cart.couponCode}</strong> applied!
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[hsl(38,52%,40%)]" data-testid="input-coupon" />
                <button onClick={handleApplyCoupon} disabled={applyCoupon.isPending}
                  className="bg-[hsl(24,10%,16%)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[hsl(24,9%,26%)] transition-colors disabled:opacity-50" data-testid="button-apply-coupon">
                  Apply
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">Try: PRAYAG10 for 10% off</p>
          </div>

          <Link href="/checkout">
            <button className="w-full bg-[hsl(24,10%,16%)] text-white font-bold py-3.5 rounded-xl hover:bg-[hsl(24,9%,26%)] transition-colors flex items-center justify-center gap-2" data-testid="button-checkout">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/products">
            <button className="w-full text-center text-sm text-gray-500 hover:text-[hsl(38,52%,40%)] transition-colors py-2">Continue Shopping</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
