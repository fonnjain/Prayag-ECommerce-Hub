import { useState } from "react";
import { Link } from "wouter";
import { Package, DollarSign, Clock, CheckCircle, FileText, Tag, BookOpen, BarChart3 } from "lucide-react";
import { useGetDealerDashboard, useListDealerOrders, useListDealerSchemes } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "schemes", label: "Schemes", icon: Tag },
  { id: "catalogues", label: "Catalogues", icon: BookOpen },
  { id: "invoices", label: "Invoices", icon: FileText },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function DealerPage() {
  const [active, setActive] = useState("dashboard");
  const { data: dashboard, isLoading: dashLoading } = useGetDealerDashboard();
  const { data: orders, isLoading: ordersLoading } = useListDealerOrders();
  const { data: schemes, isLoading: schemesLoading } = useListDealerSchemes();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[hsl(215,100%,34%)] text-white flex-shrink-0 min-h-screen">
        <div className="p-5 border-b border-[hsl(215,100%,28%)]">
          <div className="text-xl font-black">PRAYAG</div>
          <div className="text-blue-200 text-xs mt-0.5">Dealer Portal</div>
        </div>
        <nav className="py-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${active === id ? "bg-[hsl(215,100%,28%)] font-medium" : "text-blue-100 hover:bg-[hsl(215,100%,28%)]"}`}
              data-testid={`nav-dealer-${id}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <Link href="/products">
            <button className="w-full bg-white text-[hsl(215,100%,34%)] text-sm font-bold py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
              Browse Products
            </button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {active === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dealer Dashboard</h1>
            {dashLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Monthly Orders", value: dashboard?.monthlyOrders || 0, icon: Package, color: "bg-blue-500" },
                  { label: "Outstanding", value: `₹${(dashboard?.outstandingAmount || 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "bg-red-500" },
                  { label: "Pending Orders", value: dashboard?.pendingOrders || 0, icon: Clock, color: "bg-yellow-500" },
                  { label: "Delivered", value: dashboard?.deliveredOrders || 0, icon: CheckCircle, color: "bg-green-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>
                    <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-black text-xl text-gray-900">{value}</div>
                      <div className="text-xs text-gray-400">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <Link href="/products"><button className="w-full bg-[hsl(215,100%,34%)] text-white font-medium py-3 rounded-xl text-sm hover:bg-[hsl(215,100%,28%)] transition-colors" data-testid="button-bulk-order">Place Bulk Order</button></Link>
                <button onClick={() => setActive("schemes")} className="w-full border border-[hsl(215,100%,34%)] text-[hsl(215,100%,34%)] font-medium py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" data-testid="button-view-schemes">View Schemes</button>
                <button onClick={() => setActive("catalogues")} className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors" data-testid="button-catalogues">Download Catalogue</button>
              </div>
            </div>
          </div>
        )}

        {active === "orders" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
            {ordersLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : orders && orders.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Order #", "Date", "Amount", "Status", "Action"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-dealer-order-${order.id}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 font-bold text-[hsl(215,100%,34%)]">₹{order.total.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/account/orders/${order.id}`}><button className="text-[hsl(215,100%,34%)] text-xs font-medium hover:underline" data-testid={`button-track-dealer-order-${order.id}`}>Track</button></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        )}

        {active === "schemes" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dealer Schemes</h1>
            {schemesLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
            ) : schemes && schemes.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {schemes.map(scheme => (
                  <div key={scheme.id} className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-[hsl(215,100%,34%)]" data-testid={`card-scheme-${scheme.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{scheme.title}</h3>
                      <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-0.5 rounded-full">{scheme.discount}% OFF</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{scheme.description}</p>
                    <div className="text-xs text-gray-400">Valid until: {scheme.validUntil}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No active schemes</p>
              </div>
            )}
          </div>
        )}

        {active === "catalogues" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Catalogues</h1>
            <div className="grid sm:grid-cols-3 gap-4">
              {["Main Catalogue 2024", "CP Faucets Range", "Sanitaryware Guide", "Pipes & Fittings", "Water Heaters", "Accessories"].map(title => (
                <div key={title} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:border-[hsl(215,100%,34%)] transition-all cursor-pointer group" data-testid={`card-catalogue-${title.replace(/\s+/g, "-").toLowerCase()}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[hsl(215,100%,34%)]/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[hsl(215,100%,34%)]" />
                    </div>
                    <span className="font-medium text-sm text-gray-900">{title}</span>
                  </div>
                  <span className="text-xs text-[hsl(215,100%,34%)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Download</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "invoices" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Invoices</h1>
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">GST invoices will appear here</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
