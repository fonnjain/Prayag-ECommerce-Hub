import { useState } from "react";
import { Link } from "wouter";
import { Package, DollarSign, Clock, CheckCircle, FileText, Tag, BookOpen, BarChart3, MapPin, Target, CreditCard, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import NetworkDirectory from "@/components/NetworkDirectory";

async function fetchDistributorDashboard() {
  const res = await fetch("/api/distributor/dashboard");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
async function fetchDistributorOrders() {
  const res = await fetch("/api/distributor/orders");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
async function fetchDistributorSchemes() {
  const res = await fetch("/api/distributor/schemes");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "network", label: "Distributors", icon: Users },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "schemes", label: "Schemes", icon: Tag },
  { id: "catalogues", label: "Catalogues", icon: BookOpen },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "territory", label: "My Territory", icon: MapPin },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-amber-100 text-[hsl(30,50%,35%)]",
  packed: "bg-stone-200 text-stone-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function DistributorPage() {
  const [active, setActive] = useState("dashboard");
  const { data: dashboard, isLoading: dashLoading } = useQuery({ queryKey: ["distributor-dashboard"], queryFn: fetchDistributorDashboard });
  const { data: orders, isLoading: ordersLoading } = useQuery({ queryKey: ["distributor-orders"], queryFn: fetchDistributorOrders });
  const { data: schemes, isLoading: schemesLoading } = useQuery({ queryKey: ["distributor-schemes"], queryFn: fetchDistributorSchemes });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[hsl(24,9%,26%)] text-white flex-shrink-0 min-h-screen flex flex-col">
        <div className="p-5 border-b border-[hsl(24,10%,12%)]">
          <div className="text-xl font-black">PRAYAG</div>
          <div className="text-[hsl(42,62%,68%)] text-xs mt-0.5">Distributor Portal</div>
        </div>
        <nav className="py-2 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${active === id ? "bg-[hsl(24,10%,12%)] font-medium" : "text-[hsl(42,40%,80%)] hover:bg-[hsl(24,10%,12%)]"}`}
              data-testid={`nav-distributor-${id}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4">
          <Link href="/products">
            <button className="w-full bg-white text-[hsl(38,52%,40%)] text-sm font-bold py-2.5 rounded-lg hover:bg-amber-50 transition-colors">
              Place Bulk Order
            </button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {/* ── DASHBOARD ── */}
        {active === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
              <span className="text-xs bg-stone-200 text-stone-700 font-semibold px-3 py-1 rounded-full">Premium Tier</span>
            </div>

            {dashLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Monthly Orders", value: dashboard?.monthlyOrders ?? 0, icon: Package, color: "bg-amber-500" },
                    { label: "Total Revenue", value: `₹${((dashboard?.totalRevenue ?? 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: "bg-green-500" },
                    { label: "Pending Orders", value: dashboard?.pendingOrders ?? 0, icon: Clock, color: "bg-yellow-500" },
                    { label: "Delivered", value: dashboard?.deliveredOrders ?? 0, icon: CheckCircle, color: "bg-emerald-500" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3" data-testid={`stat-dist-${label.toLowerCase().replace(/ /g, "-")}`}>
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

                {/* Credit & Target */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-4" data-testid="stat-dist-territory">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[hsl(38,52%,40%)]" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Territory</span>
                    </div>
                    <div className="font-bold text-gray-900">{dashboard?.territory || "Not Assigned"}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4" data-testid="stat-dist-credit">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Credit Limit</span>
                    </div>
                    <div className="font-bold text-gray-900">₹{((dashboard?.creditLimit ?? 0) / 100000).toFixed(1)}L</div>
                    <div className="text-xs text-gray-400 mt-1">Outstanding: ₹{((dashboard?.outstandingAmount ?? 0)).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4" data-testid="stat-dist-target">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Annual Target</span>
                    </div>
                    <div className="font-bold text-gray-900">₹{((dashboard?.annualTarget ?? 0) / 100000).toFixed(0)}L</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((dashboard?.totalRevenue ?? 0) / (dashboard?.annualTarget ?? 1)) * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-4 gap-3">
                <Link href="/products"><button className="w-full bg-[hsl(24,10%,16%)] text-white font-medium py-3 rounded-xl text-sm hover:bg-[hsl(24,9%,26%)] transition-colors" data-testid="button-dist-bulk-order">Bulk Order</button></Link>
                <button onClick={() => setActive("schemes")} className="w-full border border-[hsl(38,52%,40%)] text-[hsl(38,52%,40%)] font-medium py-3 rounded-xl text-sm hover:bg-amber-50 transition-colors" data-testid="button-dist-schemes">View Schemes</button>
                <button onClick={() => setActive("territory")} className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors" data-testid="button-dist-territory">My Territory</button>
                <button onClick={() => setActive("catalogues")} className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors" data-testid="button-dist-catalogue">Catalogues</button>
              </div>
            </div>
          </div>
        )}

        {/* ── DISTRIBUTOR NETWORK ── */}
        {active === "network" && (
          <NetworkDirectory
            apiBase="/api/distributor/network"
            title="Distributor Network"
            entityLabel="distributors"
            testPrefix="network"
          />
        )}

        {/* ── ORDERS ── */}
        {active === "orders" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
            {ordersLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : orders && orders.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Order #", "Date", "Amount", "Status", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-dist-order-${order.id}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 font-bold text-[hsl(38,52%,40%)]">₹{order.total.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/account/orders/${order.id}`}><button className="text-[hsl(38,52%,40%)] text-xs font-medium hover:underline" data-testid={`button-track-dist-order-${order.id}`}>Track</button></Link>
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

        {/* ── SCHEMES ── */}
        {active === "schemes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Distributor Schemes</h1>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">Higher margins than dealers</span>
            </div>
            {schemesLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
            ) : schemes && schemes.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {schemes.map((scheme: any) => (
                  <div key={scheme.id} className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-[hsl(30,35%,30%)]" data-testid={`card-dist-scheme-${scheme.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{scheme.title}</h3>
                      <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-0.5 rounded-full">{scheme.discount}% OFF</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{scheme.description}</p>
                    {scheme.minOrderValue && (
                      <div className="text-xs text-[hsl(38,52%,40%)] font-medium mb-1">Min. Order: ₹{scheme.minOrderValue.toLocaleString("en-IN")}</div>
                    )}
                    <div className="text-xs text-gray-400">Valid until: {scheme.validUntil}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No active schemes right now</p>
              </div>
            )}
          </div>
        )}

        {/* ── CATALOGUES ── */}
        {active === "catalogues" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Catalogues</h1>
            <div className="grid sm:grid-cols-3 gap-4">
              {["Full Product Catalogue 2024", "CP Faucets Range", "Sanitaryware Guide", "Pipes & Fittings", "Water Heaters", "Accessories", "Distributor Price List", "Trade Terms 2024"].map(title => (
                <div key={title} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:border-[hsl(38,52%,40%)] transition-all cursor-pointer group" data-testid={`card-dist-catalogue-${title.replace(/\s+/g, "-").toLowerCase()}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[hsl(24,10%,16%)]/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[hsl(38,52%,40%)]" />
                    </div>
                    <span className="font-medium text-sm text-gray-900">{title}</span>
                  </div>
                  <span className="text-xs text-[hsl(38,52%,40%)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Download</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INVOICES ── */}
        {active === "invoices" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">GST Invoices</h1>
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">Your GST invoices will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Invoices are generated after order delivery</p>
            </div>
          </div>
        )}

        {/* ── TERRITORY ── */}
        {active === "territory" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Territory</h1>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[hsl(24,10%,16%)]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[hsl(38,52%,40%)]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Territory Assignment</h2>
                    <p className="text-xs text-gray-400">Your exclusive distribution zone</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Territory", value: dashboard?.territory || "Not Assigned" },
                    { label: "Annual Target", value: `₹${((dashboard?.annualTarget ?? 0) / 100000).toFixed(0)}L` },
                    { label: "Credit Limit", value: `₹${((dashboard?.creditLimit ?? 0) / 100000).toFixed(1)}L` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="font-semibold text-sm text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Dealers Under You</h2>
                <div className="text-center py-10">
                  <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Dealer mapping coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">Contact your PRAYAG representative</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
