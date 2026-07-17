import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { User, MapPin, Package, Heart, RotateCcw, HeadphonesIcon, ChevronRight, Star } from "lucide-react";
import { useListOrders, useGetWishlist, useListAddresses } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "support", label: "Support", icon: HeadphonesIcon },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AccountPage() {
  const [location] = useLocation();
  const sectionFromUrl = location.startsWith("/account/") ? location.split("/")[2] : "profile";
  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  useEffect(() => {
    setActiveSection(sectionFromUrl);
  }, [sectionFromUrl]);
  const { user } = useAuthStore();
  const { data: orders, isLoading: ordersLoading } = useListOrders();
  const { data: wishlist, isLoading: wishlistLoading } = useGetWishlist();
  const { data: addresses } = useListAddresses();

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Please sign in</h2>
      <p className="text-gray-500 mb-6">You need to be logged in to view your account.</p>
      <Link href="/login"><button className="bg-[hsl(215,100%,34%)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] transition-colors" data-testid="button-login">Sign In</button></Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-[hsl(215,100%,34%)] text-white p-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <User className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm">{user.name}</div>
              <div className="text-blue-200 text-xs">{user.email}</div>
            </div>
            <nav className="py-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeSection === id ? "bg-blue-50 text-[hsl(215,100%,34%)] font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  data-testid={`nav-account-${id}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "profile" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Profile Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: user.name },
                  { label: "Email Address", value: user.email },
                  { label: "Phone", value: user.phone || "Not provided" },
                  { label: "Account Type", value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">{label}</div>
                    <div className="text-sm font-medium text-gray-900" data-testid={`text-profile-${label.toLowerCase().replace(/ /g, "-")}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">My Orders</h2>
              {ordersLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4" data-testid={`row-order-${order.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                          <span className="text-gray-400 text-xs ml-2">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`} data-testid={`text-order-status-${order.id}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{order.items.length} items</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[hsl(215,100%,34%)]">₹{order.total.toLocaleString("en-IN")}</span>
                          <Link href={`/account/orders/${order.id}`}>
                            <button className="text-xs text-[hsl(215,100%,34%)] font-medium hover:underline flex items-center gap-0.5" data-testid={`button-track-${order.id}`}>
                              Track <ChevronRight className="w-3 h-3" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link href="/products"><button className="mt-3 text-[hsl(215,100%,34%)] text-sm font-medium hover:underline">Start Shopping</button></Link>
                </div>
              )}
            </div>
          )}

          {activeSection === "addresses" && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Saved Addresses</h2>
              {addresses && addresses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-white rounded-xl border border-gray-100 p-4" data-testid={`card-address-${addr.id}`}>
                      {addr.isDefault && <span className="text-xs bg-blue-100 text-[hsl(215,100%,34%)] font-medium px-2 py-0.5 rounded-full mb-2 inline-block">Default</span>}
                      <div className="font-medium text-sm text-gray-900">{addr.name}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{addr.phone}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No saved addresses</p>
                </div>
              )}
            </div>
          )}

          {activeSection === "wishlist" && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">My Wishlist</h2>
              {wishlistLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
              ) : wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map((p: any) => (
                    <Link key={p.id} href={`/products/${p.slug}`} data-testid={`card-wishlist-${p.id}`}>
                      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square bg-gray-50">
                          <img src={p.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop"} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</p>
                          <p className="text-[hsl(215,100%,34%)] font-bold text-sm mt-1">₹{p.price?.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Link href="/products"><button className="mt-3 text-[hsl(215,100%,34%)] text-sm font-medium hover:underline">Browse Products</button></Link>
                </div>
              )}
            </div>
          )}

          {activeSection === "returns" && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <RotateCcw className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">No Return Requests</h3>
              <p className="text-sm text-gray-400">Your return and refund requests will appear here.</p>
            </div>
          )}

          {activeSection === "support" && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <HeadphonesIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Customer Support</h3>
              <p className="text-sm text-gray-400 mb-4">Need help? Contact our support team.</p>
              <div className="inline-flex items-center gap-2 bg-[hsl(215,100%,34%)] text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                Call 1800-123-7729
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
