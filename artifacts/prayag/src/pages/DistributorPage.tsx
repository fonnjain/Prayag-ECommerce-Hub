import { useState } from "react";
import { Link } from "wouter";
import { Package, DollarSign, Clock, CheckCircle, FileText, Tag, BookOpen, BarChart3, MapPin, Target, CreditCard, TrendingUp, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

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

async function fetchDistributorDetail(id: number) {
  const res = await fetch(`/api/distributor/network/${id}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchDistributorNetwork(search: string, state: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (state) params.set("state", state);
  params.set("page", String(page));
  const res = await fetch(`/api/distributor/network?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function DistributorPage() {
  const [active, setActive] = useState("dashboard");
  const [netSearch, setNetSearch] = useState("");
  const [netSearchInput, setNetSearchInput] = useState("");
  const [netState, setNetState] = useState("");
  const [netPage, setNetPage] = useState(1);
  const [selectedDistId, setSelectedDistId] = useState<number | null>(null);
  const { data: distDetail, isLoading: distDetailLoading } = useQuery({
    queryKey: ["distributor-detail", selectedDistId],
    queryFn: () => fetchDistributorDetail(selectedDistId!),
    enabled: selectedDistId !== null,
  });
  const { data: network, isLoading: networkLoading } = useQuery({
    queryKey: ["distributor-network", netSearch, netState, netPage],
    queryFn: () => fetchDistributorNetwork(netSearch, netState, netPage),
    enabled: active === "network",
  });
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
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Distributor Network</h1>
              {network && (
                <span className="text-xs bg-stone-200 text-stone-700 font-semibold px-3 py-1 rounded-full" data-testid="text-network-total">
                  {network.total.toLocaleString("en-IN")} distributors
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <form
                className="relative flex-1"
                onSubmit={(e) => { e.preventDefault(); setNetSearch(netSearchInput); setNetPage(1); }}
              >
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={netSearchInput}
                  onChange={(e) => setNetSearchInput(e.target.value)}
                  placeholder="Search by company, contact, city or district..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(38,52%,40%)]"
                  data-testid="input-network-search"
                />
              </form>
              <select
                value={netState}
                onChange={(e) => { setNetState(e.target.value); setNetPage(1); }}
                className="bg-white border border-gray-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-[hsl(38,52%,40%)]"
                data-testid="select-network-state"
              >
                <option value="">All States</option>
                {(network?.states || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {networkLoading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : network && network.distributors.length > 0 ? (
              <>
                <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{["Company", "Contact Person", "Phone", "City", "District", "State", "GST", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {network.distributors.map((d: any) => (
                        <tr key={d.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-network-${d.id}`}>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedDistId(d.id)}
                              className="font-medium text-[hsl(38,52%,40%)] hover:underline text-left"
                              data-testid={`button-network-detail-${d.id}`}
                            >{d.businessName}</button>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{d.contactName}</td>
                          <td className="px-4 py-3 text-gray-500">{d.phone || "—"}</td>
                          <td className="px-4 py-3 text-gray-500">{d.city || "—"}</td>
                          <td className="px-4 py-3 text-gray-500">{d.territory || "—"}</td>
                          <td className="px-4 py-3 text-gray-500">{d.state || "—"}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{d.gstNumber || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${d.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    Page {network.page} of {network.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNetPage(p => Math.max(1, p - 1))}
                      disabled={network.page <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                      data-testid="button-network-prev"
                    ><ChevronLeft className="w-3.5 h-3.5" /> Prev</button>
                    <button
                      onClick={() => setNetPage(p => Math.min(network.totalPages, p + 1))}
                      disabled={network.page >= network.totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                      data-testid="button-network-next"
                    >Next <ChevronRight className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No distributors found</p>
              </div>
            )}
          </div>
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

      {/* ── DISTRIBUTOR DETAIL DIALOG ── */}
      <Dialog open={selectedDistId !== null} onOpenChange={(open) => { if (!open) setSelectedDistId(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="dialog-distributor-detail">
          {distDetailLoading || !distDetail ? (
            <div className="space-y-3 py-6">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  {distDetail.profileImgUrl ? (
                    <img src={distDetail.profileImgUrl} alt={distDetail.businessName} className="w-14 h-14 rounded-full object-cover border border-gray-200"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[hsl(24,10%,16%)]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[hsl(38,52%,40%)]" />
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-lg font-bold text-gray-900">{distDetail.businessName}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {distDetail.distributorCode && <span className="text-xs text-gray-400">{distDetail.distributorCode}</span>}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${distDetail.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{distDetail.status}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {[
                { section: "Contact Details", fields: [
                  ["Contact Person 1", distDetail.contactName],
                  ["Contact Number 1", distDetail.phone],
                  ["Alternate Contact 1", distDetail.alternateContact1],
                  ["Contact Person 1 DOB", distDetail.contact1Dob],
                  ["Contact Person 2", distDetail.contactPerson2],
                  ["Contact Number 2", distDetail.contactNumber2],
                  ["Alternate Contact 2", distDetail.alternateContact2],
                  ["Contact Person 2 DOB", distDetail.contact2Dob],
                  ["Date of Anniversary", distDetail.anniversaryDate],
                  ["Email", distDetail.email],
                ]},
                { section: "Location", fields: [
                  ["Address", distDetail.address],
                  ["State", distDetail.state],
                  ["District", distDetail.district],
                  ["City", distDetail.city],
                  ["Pincode", distDetail.pincode],
                  ["Area", distDetail.area],
                ]},
                { section: "Business Details", fields: [
                  ["Customer Type", distDetail.customerType],
                  ["Category", distDetail.category],
                  ["GST", distDetail.gstNumber],
                  ["Assigned Segment", distDetail.assignedSegment],
                  ["Assign User", distDetail.assignedUser],
                  ["Customer Branding", distDetail.customerBranding],
                ]},
                { section: "Record Info", fields: [
                  ["Date Created", distDetail.dateCreated],
                  ["Created By", distDetail.createdBy],
                  ["Authorised Date", distDetail.authorisedDate],
                ]},
              ].map(({ section, fields }) => {
                const filled = fields.filter(([, v]) => v);
                if (filled.length === 0) return null;
                return (
                  <div key={section} className="mt-2">
                    <h3 className="text-xs font-semibold text-[hsl(38,52%,40%)] uppercase tracking-wide mb-2">{section}</h3>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 bg-gray-50 rounded-xl p-4">
                      {filled.map(([label, value]) => (
                        <div key={label as string} className={label === "Address" ? "sm:col-span-2" : ""}>
                          <div className="text-[11px] text-gray-400">{label}</div>
                          <div className="text-sm font-medium text-gray-900 break-words">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(distDetail.visitingCardUrl || distDetail.passbookImgUrl) && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-[hsl(38,52%,40%)] uppercase tracking-wide mb-2">Documents</h3>
                  <div className="flex gap-3">
                    {distDetail.visitingCardUrl && (
                      <a href={distDetail.visitingCardUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Visiting Card</a>
                    )}
                    {distDetail.passbookImgUrl && (
                      <a href={distDetail.passbookImgUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Passbook Image</a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
