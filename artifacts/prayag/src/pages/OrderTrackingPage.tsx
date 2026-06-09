import { useParams, Link } from "wouter";
import { useGetOrder, useGetOrderTracking, getGetOrderQueryKey, getGetOrderTrackingQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id, 10);

  const { data: order, isLoading: orderLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });
  const { data: tracking, isLoading: trackingLoading } = useGetOrderTracking(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderTrackingQueryKey(orderId) },
  });

  if (orderLoading || trackingLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-60 rounded-xl" />
    </div>
  );

  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Order not found.</p>
      <Link href="/account"><button className="mt-4 text-[hsl(215,100%,34%)] hover:underline">Back to Account</button></Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/account" className="hover:text-[hsl(215,100%,34%)]">Account</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">Order #{order.orderNumber}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`} data-testid="text-order-status">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-400 text-xs">Total Amount</span><div className="font-bold text-[hsl(215,100%,34%)] mt-0.5">₹{order.total.toLocaleString("en-IN")}</div></div>
            <div><span className="text-gray-400 text-xs">Payment</span><div className="font-medium mt-0.5 capitalize">{order.paymentMethod || "COD"}</div></div>
            <div><span className="text-gray-400 text-xs">Items</span><div className="font-medium mt-0.5">{order.items.length} items</div></div>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      {tracking && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-5">Order Tracking</h2>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
            <div className="space-y-6">
              {tracking.timeline.map((event, i) => (
                <div key={i} className="flex gap-4 relative" data-testid={`timeline-${event.status}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${event.completed ? "bg-[hsl(215,100%,34%)]" : "bg-gray-100"}`}>
                    {event.completed ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-gray-300" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className={`font-medium text-sm ${event.completed ? "text-gray-900" : "text-gray-400"}`}>{event.label}</div>
                    {event.timestamp && <div className="text-xs text-gray-400 mt-0.5">{new Date(event.timestamp).toLocaleString("en-IN")}</div>}
                    {event.note && <div className="text-xs text-gray-500 mt-0.5">{event.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Items in this Order</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-3 items-center" data-testid={`row-item-${item.id}`}>
              <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=60&h=60&fit=crop"} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
              </div>
              <span className="font-bold text-sm text-gray-900">₹{item.subtotal.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
