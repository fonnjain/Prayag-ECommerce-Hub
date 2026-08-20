import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package, Users, Building2, ShoppingBag, IndianRupee, LayoutDashboard, Truck, RotateCcw, Palette, FolderTree, Pencil } from "lucide-react";
import SiteContentManager from "@/components/admin/SiteContentManager";
import CategoryManager from "@/components/admin/CategoryManager";
import ProductEditModal from "@/components/admin/ProductEditModal";
import type { Product } from "@workspace/api-client-react";
import { useGetAdminDashboard, useGetRevenueStats, useListAdminOrders, useListAdminProducts, useListAdminCustomers, useListAdminDealers, useUpdateOrderStatus, getListAdminOrdersQueryKey, useListAdminOrderRequests, getListAdminOrderRequestsQueryKey, useUpdateOrderRequest } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "site-content", label: "Site Content", icon: Palette },
  { id: "orders", label: "Orders", icon: Package },
  { id: "requests", label: "Requests", icon: RotateCcw },
  { id: "customers", label: "Customers", icon: Users },
  { id: "dealers", label: "Dealers", icon: Building2 },
  { id: "distributors", label: "Distributors", icon: Truck },
];

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

const requestStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  completed: "bg-[hsl(42,62%,90%)] text-[hsl(38,52%,35%)]",
};

export default function AdminPage() {
  const [active, setActive] = useState("dashboard");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, token } = useAuthStore();

  const { data: dashboard, isLoading: dashLoading, error: dashError } = useGetAdminDashboard();
  const { data: revenueStats } = useGetRevenueStats();
  const { data: orders } = useListAdminOrders({});
  const { data: productsData } = useListAdminProducts({});
  const { data: customers } = useListAdminCustomers({});
  const { data: dealers } = useListAdminDealers({});
  const { data: distributorsData } = useQuery({ queryKey: ["admin-distributors"], enabled: !!user, queryFn: async () => { const r = await authenticatedFetch("/api/admin/distributors"); if (!r.ok) throw new Error(`Failed to load distributors (${r.status})`); return r.json(); } });
  const distributors = Array.isArray(distributorsData) ? distributorsData : [];
  const updateStatus = useUpdateOrderStatus();
  const { data: orderRequests } = useListAdminOrderRequests();
  const updateRequest = useUpdateOrderRequest();

  function handleStatusChange(orderId: number, status: string) {
    updateStatus.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminOrdersQueryKey({}) });
        toast({ title: "Order status updated" });
      },
    });
  }

  function handleRequestAction(requestId: number, status: "approved" | "rejected" | "completed") {
    updateRequest.mutate({ id: requestId, data: { status } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminOrderRequestsQueryKey() });
        qc.invalidateQueries({ queryKey: getListAdminOrdersQueryKey({}) });
        toast({ title: `Request ${status}` });
      },
      onError: () => toast({ title: "Failed to update request", variant: "destructive" }),
    });
  }

  const isAdmin = !!token && user?.role === "admin";
  const sessionExpired = isAdmin && !!dashError;

  if (!isAdmin || sessionExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center" data-testid="card-admin-auth-required">
          <div className="text-xl font-black text-gray-900 mb-1">PRAYAG Admin</div>
          <p className="text-sm text-gray-500 mb-6">
            {sessionExpired
              ? "Your session has expired. Please log in again."
              : user
                ? `You are logged in as ${user.email} (${user.role}). This panel needs an admin account — please log out and sign in as admin.`
                : "Please log in with an admin account to access this panel."}
          </p>
          <a href="/login" onClick={() => { if (sessionExpired || user) useAuthStore.getState().logout(); }}
            className="inline-block w-full bg-[hsl(24,10%,16%)] text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            data-testid="link-admin-login">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[hsl(24,10%,16%)] text-white flex-shrink-0 min-h-screen">
        <div className="p-5 border-b border-[hsl(24,9%,26%)]">
          <div className="text-xl font-black">PRAYAG</div>
          <div className="text-[hsl(42,62%,68%)] text-xs mt-0.5">Admin Panel</div>
        </div>
        <nav className="py-2 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${active === id ? "bg-[hsl(24,9%,26%)] font-medium" : "text-[hsl(42,40%,80%)] hover:bg-[hsl(24,9%,26%)]"}`}
              data-testid={`nav-admin-${id}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {active === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            {dashLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                  { label: "Revenue", value: `₹${((dashboard?.revenue || 0) / 100000).toFixed(1)}L`, icon: IndianRupee, color: "bg-[hsl(24,10%,16%)]" },
                  { label: "Orders", value: dashboard?.orders || 0, icon: Package, color: "bg-purple-500" },
                  { label: "Customers", value: dashboard?.customers || 0, icon: Users, color: "bg-green-500" },
                  { label: "Dealers", value: dashboard?.dealers || 0, icon: Building2, color: "bg-orange-500" },
                  { label: "Products", value: dashboard?.products || 0, icon: ShoppingBag, color: "bg-red-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4" data-testid={`stat-admin-${label.toLowerCase()}`}>
                    <div className={`${color} w-9 h-9 rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-black text-gray-900">{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Revenue Chart */}
            {revenueStats && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h2 className="font-bold text-gray-900 mb-4">Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueStats} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="hsl(38,52%,40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Orders */}
            {dashboard?.recentOrders && dashboard.recentOrders.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100"><h2 className="font-bold text-gray-900">Recent Orders</h2></div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{["Order #", "Total", "Status", "Date"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {dashboard.recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50" data-testid={`row-recent-order-${order.id}`}>
                        <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-3 font-bold text-[hsl(38,52%,40%)]">₹{order.total?.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</span></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {active === "products" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">All Products ({productsData?.total || 0})</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{["SKU", "Name", "Category", "Price", "Stock", "Featured", "Edit"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {productsData?.products?.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50" data-testid={`row-admin-product-${p.id}`}>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.categoryName || "-"}</td>
                      <td className="px-4 py-3 font-bold text-[hsl(38,52%,40%)]">₹{p.price.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{p.inStock ? "In Stock" : "Out"}</span></td>
                      <td className="px-4 py-3">{p.isFeatured ? <span className="text-xs bg-amber-100 text-[hsl(38,52%,40%)] px-2 py-0.5 rounded-full">Yes</span> : "-"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditingProduct(p)} className="text-gray-400 hover:text-[hsl(38,52%,40%)]" data-testid={`button-edit-product-${p.id}`}><Pencil className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "categories" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Category Management</h1>
            <CategoryManager />
          </div>
        )}

        {active === "site-content" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Content</h1>
            <SiteContentManager />
          </div>
        )}

        {active === "orders" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{["Order #", "Total", "Payment", "Status", "Date", "Action"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(orders || []).map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50" data-testid={`row-admin-order-${order.id}`}>
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 font-bold text-[hsl(38,52%,40%)]">₹{order.total?.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{order.paymentMethod || "cod"}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 outline-none" data-testid={`select-order-status-${order.id}`}>
                          {["pending","confirmed","packed","dispatched","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "requests" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Requests</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{["Order", "Type", "Reason", "Status", "Date", "Actions"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(orderRequests || []).map(r => (
                    <tr key={r.id} className="hover:bg-gray-50" data-testid={`row-request-${r.id}`}>
                      <td className="px-4 py-3 font-medium">#{r.orderNumber || r.orderId}</td>
                      <td className="px-4 py-3 capitalize">{r.type}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate" title={r.reason}>{r.reason}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${requestStatusColors[r.status] || "bg-gray-100 text-gray-600"}`}>{r.status}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        {r.status === "pending" && (
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRequestAction(r.id, "approved")}
                              className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                              data-testid={`button-approve-request-${r.id}`}>Approve</button>
                            <button onClick={() => handleRequestAction(r.id, "rejected")}
                              className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              data-testid={`button-reject-request-${r.id}`}>Reject</button>
                          </div>
                        )}
                        {r.status === "approved" && (
                          <button onClick={() => handleRequestAction(r.id, "completed")}
                            className="text-xs font-medium px-2.5 py-1 rounded-full bg-[hsl(42,62%,90%)] text-[hsl(38,52%,35%)] hover:bg-[hsl(42,62%,80%)]"
                            data-testid={`button-complete-request-${r.id}`}>Mark Completed</button>
                        )}
                        {(r.status === "rejected" || r.status === "completed") && <span className="text-xs text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                  {(orderRequests || []).length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No order requests yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "customers" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{["Name", "Email", "Phone", "Total Orders", "Joined"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(customers || []).map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50" data-testid={`row-customer-${c.id}`}>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.email}</td>
                      <td className="px-4 py-3 text-gray-500">{c.phone || "-"}</td>
                      <td className="px-4 py-3">{c.totalOrders}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "dealers" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dealer Management</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{["Business", "Contact", "City", "Status", "Joined"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(dealers || []).map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50" data-testid={`row-dealer-${d.id}`}>
                      <td className="px-4 py-3 font-medium">{d.businessName}</td>
                      <td className="px-4 py-3 text-gray-500">{d.contactName}</td>
                      <td className="px-4 py-3 text-gray-500">{d.city || "-"}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.status}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "distributors" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Distributor Management</h1>
              <span className="text-xs bg-stone-200 text-stone-700 font-semibold px-3 py-1 rounded-full">{(distributors || []).length} registered</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Business", "Contact", "Territory", "Credit Limit", "Annual Target", "Status", "Joined"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(distributors || []).length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No distributors registered yet</td></tr>
                  ) : (distributors || []).map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50" data-testid={`row-distributor-${d.id}`}>
                      <td className="px-4 py-3 font-medium">{d.businessName}</td>
                      <td className="px-4 py-3 text-gray-500">{d.contactName}<br /><span className="text-xs text-gray-400">{d.email}</span></td>
                      <td className="px-4 py-3 text-gray-500">{d.territory || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{d.creditLimit ? `₹${(d.creditLimit / 100000).toFixed(1)}L` : "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{d.annualTarget ? `₹${(d.annualTarget / 100000).toFixed(0)}L` : "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      {editingProduct && <ProductEditModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
    </div>
  );
}
