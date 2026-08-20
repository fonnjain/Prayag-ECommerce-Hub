import { useState } from "react";
import { Link } from "wouter";
import { BarChart3, Users, Store, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
];

async function fetchStats() {
  const res = await authenticatedFetch("/api/direct-dealer/network?page=1");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function DirectDealerPage() {
  const [active, setActive] = useState("dashboard");
  const { data: stats, isLoading } = useQuery({ queryKey: ["direct-dealer-stats"], queryFn: fetchStats });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[hsl(24,9%,26%)] text-white flex-shrink-0 min-h-screen flex flex-col">
        <div className="p-5 border-b border-[hsl(24,10%,12%)]">
          <div className="text-xl font-black">PRAYAG</div>
          <div className="text-[hsl(42,62%,68%)] text-xs mt-0.5">Direct Dealer Portal</div>
        </div>
        <nav className="py-2 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${active === id ? "bg-[hsl(24,10%,12%)] font-medium" : "text-[hsl(42,40%,80%)] hover:bg-[hsl(24,10%,12%)]"}`}
              data-testid={`nav-direct-dealer-${id}`}>
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
        {active === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Direct Dealer Dashboard</h1>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Direct Dealers", value: (stats?.total ?? 0).toLocaleString("en-IN"), icon: Store, color: "bg-amber-500" },
                  { label: "States Covered", value: stats?.states?.length ?? 0, icon: MapPin, color: "bg-green-500" },
                  { label: "Directory Pages", value: stats?.totalPages ?? 0, icon: Users, color: "bg-stone-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3" data-testid={`stat-dd-${label.toLowerCase().replace(/ /g, "-")}`}>
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
              <div className="grid sm:grid-cols-2 gap-3">
                <Link href="/products"><button className="w-full border border-[hsl(38,52%,40%)] text-[hsl(38,52%,40%)] font-medium py-3 rounded-xl text-sm hover:bg-amber-50 transition-colors" data-testid="button-dd-bulk-order">Bulk Order</button></Link>
                <Link href="/dealer"><button className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors" data-testid="button-dd-dealer-portal">Dealer Portal</button></Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
