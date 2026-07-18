import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Building, Smartphone, Banknote, MapPin, Lock } from "lucide-react";
import { useGetCart, useCreateOrder, useCreateAddress, getGetCartQueryKey } from "@workspace/api-client-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const addressSchema = z.object({
  name: z.string().min(2, "Required"),
  phone: z.string().min(10, "Valid phone required"),
  street: z.string().min(5, "Required"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  pincode: z.string().min(6, "Required"),
});

type AddressForm = z.infer<typeof addressSchema>;

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered" },
  { id: "upi", label: "UPI / QR Code", icon: Smartphone, desc: "PhonePe, GPay, Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Rupay" },
  { id: "net_banking", label: "Net Banking", icon: Building, desc: "All major banks" },
];

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { setItemCount } = useCartStore();
  const { user } = useAuthStore();
  const [payMethod, setPayMethod] = useState("cod");

  const { data: cart, isLoading } = useGetCart();
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: "", phone: "", street: "", city: "", state: "", pincode: "" },
  });

  async function onSubmit(data: AddressForm) {
    createAddress.mutate({ data: { ...data, isDefault: true } }, {
      onSuccess: (addr) => {
        createOrder.mutate({ data: { addressId: addr.id, paymentMethod: payMethod } }, {
          onSuccess: (order) => {
            qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
            setItemCount(0);
            toast({ title: "Order placed!", description: `Order #${order.orderNumber} confirmed` });
            setLocation(`/account/orders/${order.id}`);
          },
        });
      },
    });
  }

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-8"><Skeleton className="h-96 rounded-xl" /></div>;
  if (!user) { setLocation("/login"); return null; }
  if (!cart || cart.items.length === 0) { setLocation("/cart"); return null; }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[hsl(38,52%,40%)]" /> Shipping Address
            </h3>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
              {[
                { field: "name" as const, label: "Full Name", span: 2 },
                { field: "phone" as const, label: "Phone Number", span: 1 },
                { field: "street" as const, label: "Address / Street", span: 2 },
                { field: "city" as const, label: "City", span: 1 },
                { field: "state" as const, label: "State", span: 1 },
                { field: "pincode" as const, label: "Pincode", span: 1 },
              ].map(({ field, label, span }) => (
                <div key={field} className={span === 2 ? "col-span-2" : ""}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                  <input {...form.register(field)} placeholder={label}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[hsl(38,52%,40%)] transition-colors"
                    data-testid={`input-${field}`} />
                  {form.formState.errors[field] && (
                    <p className="text-xs text-red-500 mt-0.5">{form.formState.errors[field]?.message}</p>
                  )}
                </div>
              ))}
            </form>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[hsl(38,52%,40%)]" /> Payment Method
            </h3>
            <div className="space-y-2">
              {paymentMethods.map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${payMethod === m.id ? "border-[hsl(38,52%,40%)] bg-amber-50" : "border-gray-100 hover:border-gray-200"}`}
                  data-testid={`label-payment-${m.id}`}>
                  <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="hidden" />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${payMethod === m.id ? "bg-[hsl(24,10%,16%)] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{m.label}</div>
                    <div className="text-xs text-gray-400">{m.desc}</div>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${payMethod === m.id ? "border-[hsl(38,52%,40%)]" : "border-gray-300"}`}>
                    {payMethod === m.id && <div className="w-2 h-2 rounded-full bg-[hsl(24,10%,16%)]" />}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-28">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2.5 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-2.5 text-sm">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=50&h=50&fit=crop"} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-xs line-clamp-1">{item.productName}</p>
                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-xs whitespace-nowrap">₹{item.subtotal.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cart.subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GST</span><span>₹{cart.gst.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={cart.shipping === 0 ? "text-green-600" : ""}>{cart.shipping === 0 ? "FREE" : `₹${cart.shipping}`}</span></div>
              {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{cart.discount.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[hsl(38,52%,40%)]" data-testid="text-order-total">₹{cart.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button type="submit" form="checkout-form" disabled={createOrder.isPending || createAddress.isPending}
              className="mt-4 w-full bg-[hsl(24,10%,16%)] text-white font-bold py-3.5 rounded-xl hover:bg-[hsl(24,9%,26%)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="button-place-order">
              <Lock className="w-4 h-4" />
              {createOrder.isPending || createAddress.isPending ? "Placing Order..." : "Place Order"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Secured by 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
