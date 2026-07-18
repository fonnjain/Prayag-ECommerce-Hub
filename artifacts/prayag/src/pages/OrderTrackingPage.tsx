import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetOrder, useGetOrderTracking, getGetOrderQueryKey, getGetOrderTrackingQueryKey,
  useListOrderRequests, getListOrderRequestsQueryKey, useCancelOrder, useCreateOrderRequest,
} from "@workspace/api-client-react";
import { CheckCircle2, Circle, ChevronRight, FileDown, XCircle, RotateCcw, Repeat, IndianRupee } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadInvoice } from "@/lib/invoice";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-amber-100 text-[hsl(30,50%,35%)]",
  packed: "bg-stone-200 text-stone-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  returned: "bg-orange-100 text-orange-700",
  refunded: "bg-teal-100 text-teal-700",
};

const requestTypeLabels: Record<string, string> = {
  cancel: "Cancellation",
  return: "Return",
  replace: "Replacement",
  refund: "Refund",
};

const requestStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  completed: "bg-[hsl(42,62%,90%)] text-[hsl(38,52%,35%)]",
};

const CANCELLABLE = ["pending", "confirmed", "packed"];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id, 10);

  const { data: order, isLoading: orderLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });
  const { data: tracking, isLoading: trackingLoading } = useGetOrderTracking(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderTrackingQueryKey(orderId) },
  });
  const { data: requests } = useListOrderRequests(orderId, {
    query: { enabled: !!orderId, queryKey: getListOrderRequestsQueryKey(orderId) },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<null | "cancel" | "return" | "replace" | "refund">(null);
  const [reason, setReason] = useState("");

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
    queryClient.invalidateQueries({ queryKey: getGetOrderTrackingQueryKey(orderId) });
    queryClient.invalidateQueries({ queryKey: getListOrderRequestsQueryKey(orderId) });
  };

  const cancelMutation = useCancelOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order cancelled", description: "Your order has been cancelled successfully." });
        setModal(null); setReason(""); refreshAll();
      },
      onError: (err: any) => toast({ title: "Could not cancel", description: err?.response?.data?.error || "Something went wrong", variant: "destructive" }),
    },
  });
  const requestMutation = useCreateOrderRequest({
    mutation: {
      onSuccess: () => {
        toast({ title: "Request submitted", description: "Our team will review your request shortly." });
        setModal(null); setReason(""); refreshAll();
      },
      onError: (err: any) => toast({ title: "Request failed", description: err?.response?.data?.error || "Something went wrong", variant: "destructive" }),
    },
  });

  const submitting = cancelMutation.isPending || requestMutation.isPending;
  const submitModal = () => {
    if (!reason.trim() || !modal) return;
    if (modal === "cancel") cancelMutation.mutate({ id: orderId, data: { type: "cancel", reason: reason.trim() } });
    else requestMutation.mutate({ id: orderId, data: { type: modal, reason: reason.trim() } });
  };

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
      <Link href="/account"><button className="mt-4 text-[hsl(38,52%,40%)] hover:underline">Back to Account</button></Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/account" className="hover:text-[hsl(38,52%,40%)]">Account</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">Order #{order.orderNumber}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadInvoice(order.id, order.orderNumber)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[hsl(42,62%,68%)] text-[hsl(38,52%,40%)] hover:bg-[hsl(42,62%,68%)]/10 transition-colors"
              data-testid="button-download-invoice"
            >
              <FileDown className="w-3.5 h-3.5" /> Invoice
            </button>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`} data-testid="text-order-status">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-400 text-xs">Total Amount</span><div className="font-bold text-[hsl(38,52%,40%)] mt-0.5">₹{order.total.toLocaleString("en-IN")}</div></div>
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${event.completed ? "bg-[hsl(24,10%,16%)]" : "bg-gray-100"}`}>
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

      {/* Order Actions */}
      {(() => {
        const hasActiveRequest = (requests || []).some(r => r.status === "pending" || r.status === "approved");
        const withinWindow = order.status === "delivered" && order.updatedAt
          ? Date.now() - new Date(order.updatedAt).getTime() <= 7 * 86400000
          : order.status === "delivered";
        const canRequestPostDelivery = order.status === "delivered" && !hasActiveRequest && withinWindow;
        const canCancel = CANCELLABLE.includes(order.status);
        if (!canCancel && !canRequestPostDelivery) return null;
        return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Need Help with this Order?</h2>
          <div className="flex flex-wrap gap-2">
            {canCancel && (
              <button onClick={() => setModal("cancel")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                data-testid="button-cancel-order">
                <XCircle className="w-3.5 h-3.5" /> Cancel Order
              </button>
            )}
            {canRequestPostDelivery && (
              <>
                <button onClick={() => setModal("return")}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-[hsl(42,62%,68%)] text-[hsl(38,52%,40%)] hover:bg-[hsl(42,62%,68%)]/10 transition-colors"
                  data-testid="button-return-order">
                  <RotateCcw className="w-3.5 h-3.5" /> Return
                </button>
                <button onClick={() => setModal("replace")}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-[hsl(42,62%,68%)] text-[hsl(38,52%,40%)] hover:bg-[hsl(42,62%,68%)]/10 transition-colors"
                  data-testid="button-replace-order">
                  <Repeat className="w-3.5 h-3.5" /> Replace
                </button>
                <button onClick={() => setModal("refund")}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border border-[hsl(42,62%,68%)] text-[hsl(38,52%,40%)] hover:bg-[hsl(42,62%,68%)]/10 transition-colors"
                  data-testid="button-refund-order">
                  <IndianRupee className="w-3.5 h-3.5" /> Refund
                </button>
              </>
            )}
          </div>
          {canRequestPostDelivery && (
            <p className="text-[11px] text-gray-400 mt-2">Return, replacement and refund requests are accepted within 7 days of delivery.</p>
          )}
        </div>
        );
      })()}
      {/* Existing Requests */}
      {requests && requests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Your Requests</h2>
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="border border-gray-100 rounded-lg p-3" data-testid={`row-request-${r.id}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{requestTypeLabels[r.type] || r.type} Request</span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize ${requestStatusColors[r.status] || "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Reason: {r.reason}</p>
                {r.adminNote && <p className="text-xs text-gray-500 mt-0.5">Note from PRAYAG: {r.adminNote}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Requested on {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => !submitting && setModal(null)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">
              {modal === "cancel" ? "Cancel Order" : `Request ${requestTypeLabels[modal]}`}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {modal === "cancel"
                ? "Are you sure you want to cancel this order? Please tell us why."
                : "Please tell us the reason for your request. Our team will review it."}
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Write your reason here..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(42,62%,68%)]"
              data-testid="input-request-reason"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setModal(null)} disabled={submitting}
                className="text-xs font-medium px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                data-testid="button-modal-close">
                Close
              </button>
              <button onClick={submitModal} disabled={submitting || !reason.trim()}
                className="text-xs font-medium px-4 py-2 rounded-full bg-[hsl(24,10%,16%)] text-white hover:bg-[hsl(24,10%,24%)] disabled:opacity-50"
                data-testid="button-modal-submit">
                {submitting ? "Submitting..." : modal === "cancel" ? "Confirm Cancellation" : "Submit Request"}
              </button>
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
