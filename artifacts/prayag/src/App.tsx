import { Switch, Route, Router as WouterRouter } from "wouter";
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
import DealerRegistrationPage from "@/pages/DealerRegistrationPage";
import DistributorPage from "@/pages/DistributorPage";
import DistributorRegistrationPage from "@/pages/DistributorRegistrationPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-black text-[hsl(215,100%,34%)] mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <a href={`${BASE}/`} className="bg-[hsl(215,100%,34%)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[hsl(215,100%,28%)] transition-colors inline-block">
          Go to Homepage
        </a>
      </div>
    </div>
  );
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

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={() => <AdminPage />} />
      <Route path="/dealer" component={() => <DealerPage />} />
      <Route path="/distributor" component={() => <DistributorPage />} />
      <Route path="*">
        {() => (
          <WithLayout>
            <Switch>
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
              <Route path="/register" component={RegisterPage} />
              <Route path="/dealer-registration" component={DealerRegistrationPage} />
              <Route path="/distributor-registration" component={DistributorRegistrationPage} />
              <Route component={NotFound} />
            </Switch>
          </WithLayout>
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={BASE}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
