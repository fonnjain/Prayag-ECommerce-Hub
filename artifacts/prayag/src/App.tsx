import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, useSearch, Redirect } from "wouter";
import { useAuthStore } from "@/lib/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AccountPage from "@/pages/AccountPage";
import OrderTrackingPage from "@/pages/OrderTrackingPage";
import DealerPage from "@/pages/DealerPage";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DealerRegistrationPage from "@/pages/DealerRegistrationPage";
import DistributorPage from "@/pages/DistributorPage";
import DirectDealerPage from "@/pages/DirectDealerPage";
import FindDealerPage from "@/pages/FindDealerPage";
import DistributorRegistrationPage from "@/pages/DistributorRegistrationPage";
import AboutPage from "@/pages/AboutPage";
import FaqPage from "@/pages/FaqPage";
import CareersPage from "@/pages/CareersPage";
import PolicyPage from "@/pages/PolicyPage";
import GalleryPage from "@/pages/GalleryPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-black text-gradient-gold mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <a href={`${BASE}/`} className="bg-[hsl(24,10%,16%)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[hsl(24,10%,12%)] transition-colors inline-block">
          Go to Homepage
        </a>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  const search = useSearch();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location, search]);
  return null;
}

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const BARE_ROUTES = ["/admin", "/dealer", "/distributor", "/direct-dealer"];


function RequireLogin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const isBare = BARE_ROUTES.includes(location);

  const content = (
    <Switch>
      <Route path="/admin" component={() => <AdminPage />} />
      <Route path="/dealer" component={() => <RequireLogin><DealerPage /></RequireLogin>} />
      <Route path="/distributor" component={() => <RequireLogin><DistributorPage /></RequireLogin>} />
      <Route path="/direct-dealer" component={() => <RequireLogin><DirectDealerPage /></RequireLogin>} />
      <Route path="/find-dealer" component={FindDealerPage} />
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:slug" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/account/orders/:id" component={OrderTrackingPage} />
      <Route path="/account/orders" component={AccountPage} />
      <Route path="/account/wishlist" component={AccountPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dealer-registration" component={DealerRegistrationPage} />
      <Route path="/distributor-registration" component={DistributorRegistrationPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/shipping-policy">{() => <PolicyPage type="shipping" />}</Route>
      <Route path="/returns">{() => <PolicyPage type="returns" />}</Route>
      <Route path="/privacy-policy">{() => <PolicyPage type="privacy" />}</Route>
      <Route path="/terms">{() => <PolicyPage type="terms" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );

  return isBare ? content : <WithLayout>{content}</WithLayout>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={BASE}>
        <ScrollToTop />
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
