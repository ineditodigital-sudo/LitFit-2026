import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { ProductsSection } from "./components/ProductsSection";
import { BrandSection } from "./components/BrandSection";
import { BarsPromotion } from "./components/BarsPromotion";
import { AmazonBanner } from "./components/AmazonBanner";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { BarrasEnergeticas } from "./pages/barras-energeticas";
import { ProteinaRegular } from "./pages/proteina-regular";
import { ProteinaColageno } from "./pages/proteina-colageno";
import { TestProduct } from "./pages/test-product";
import { ProductDetail } from "./pages/product-detail";
import Checkout from "./pages/checkout";
import PaymentSuccessMercadoPago from "./pages/payment-success-mp";
import PaymentFailureMercadoPago from "./pages/payment-failure-mp";
import PaymentPendingMercadoPago from "./pages/payment-pending-mp";
import { AdminLogin } from "./pages/admin-login";
import { AdminDashboard } from "./pages/admin-dashboard";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { NavigationProvider } from "./contexts/NavigationContext";

// ─── Session helpers ──────────────────────────────────────────────────────────
function getStoredAdminSession(): string | null {
  const token   = sessionStorage.getItem("litfit_admin_token");
  const expires = sessionStorage.getItem("litfit_admin_expires");
  if (!token || !expires) return null;
  if (Date.now() > Number(expires)) {
    sessionStorage.removeItem("litfit_admin_token");
    sessionStorage.removeItem("litfit_admin_expires");
    return null;
  }
  return token;
}

function clearAdminSession() {
  sessionStorage.removeItem("litfit_admin_token");
  sessionStorage.removeItem("litfit_admin_expires");
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [adminToken, setAdminToken]   = useState<string | null>(null);

  // Recuperar sesión admin al cargar la página (persiste entre refreshes)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("payment-success-mp"))  setCurrentPage("payment-success-mp");
    else if (path.includes("payment-failure-mp")) setCurrentPage("payment-failure-mp");
    else if (path.includes("payment-pending-mp")) setCurrentPage("payment-pending-mp");
    else if (path.includes("admin"))              setCurrentPage("admin");

    // Restaurar sesión si sigue vigente (no ha expirado)
    const storedToken = getStoredAdminSession();
    if (storedToken) setAdminToken(storedToken);
  }, []);

  // Verificar expiración de sesión cada minuto
  useEffect(() => {
    if (!adminToken) return;
    const interval = setInterval(() => {
      const valid = getStoredAdminSession();
      if (!valid) {
        setAdminToken(null);
        setCurrentPage("home");
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [adminToken]);

  const navigateToProduct = (productId: string) => {
    setCurrentPage(productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateHome = () => {
    setCurrentPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminToken(null);
    setCurrentPage("home");
  };

  return (
    <NavigationProvider navigateTo={navigateTo}>
      <CartProvider>
        <CartDrawer />

        {/* Admin Panel */}
        {currentPage === "admin" && (
          <>
            {!adminToken ? (
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            ) : (
              <AdminDashboard
                adminToken={adminToken}
                onLogout={handleAdminLogout}
              />
            )}
          </>
        )}

        {/* Checkout */}
        {currentPage === "checkout" && <Checkout />}

        {/* Mercado Pago return pages */}
        {currentPage === "payment-success-mp" && <PaymentSuccessMercadoPago />}
        {currentPage === "payment-failure-mp"  && <PaymentFailureMercadoPago />}
        {currentPage === "payment-pending-mp"  && <PaymentPendingMercadoPago />}

        {/* Home + Products */}
        {!["checkout", "payment-success-mp", "payment-failure-mp", "payment-pending-mp", "admin"].includes(currentPage) && (
          <>
            {currentPage === "home" && (
              <div className="min-h-screen">
                <Header onLogoClick={navigateHome} isProductPage={false} />
                <div className="pt-16">
                  <HeroCarousel onSlideClick={navigateToProduct} />
                </div>
                <ProductsSection onProductClick={navigateToProduct} />
                <BrandSection />
                <BarsPromotion onShopClick={() => navigateToProduct("barras-energeticas")} />
                <AmazonBanner />
                <FAQ />
                <Contact />
                <Footer />
              </div>
            )}

            {currentPage !== "home" && (
              <div className="min-h-screen">
                <Header onLogoClick={navigateHome} isProductPage={true} />
                {currentPage === "barras-energeticas" && <BarrasEnergeticas onBack={navigateHome} />}
                {currentPage === "proteina-clasica"   && <ProteinaRegular onBack={navigateHome} />}
                {currentPage === "proteina-regular"   && <ProteinaRegular onBack={navigateHome} />}
                {currentPage === "proteina-colageno"  && <ProteinaColageno onBack={navigateHome} />}
                {currentPage === "test-product"       && <TestProduct onBack={navigateHome} />}
                {/* Fallback para productos nuevos dinámicos generados desde el backend */}
                {!["barras-energeticas", "proteina-clasica", "proteina-regular", "proteina-colageno", "test-product"].includes(currentPage) && (
                  <ProductDetail productId={currentPage} onBack={navigateHome} />
                )}
                <Footer />
              </div>
            )}
          </>
        )}
      </CartProvider>
    </NavigationProvider>
  );
}
