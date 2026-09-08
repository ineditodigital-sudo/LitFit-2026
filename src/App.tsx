import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { ProductsSection } from "./components/ProductsSection";
import { BrandSection } from "./components/BrandSection";
import { BarsPromotion } from "./components/BarsPromotion";
import { AmazonBanner } from "./components/AmazonBanner";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
// Todo lo que no se ve en la portada se carga bajo demanda. El bundle unico
// obligaba a bajar el panel de administracion, el checkout y las fichas de
// producto antes de pintar la home. Cada uno viaja ahora en su propio archivo.
const BarrasEnergeticas = lazy(() => import("./pages/barras-energeticas").then(m => ({ default: m.BarrasEnergeticas })));
const ProteinaRegular = lazy(() => import("./pages/proteina-regular").then(m => ({ default: m.ProteinaRegular })));
const ProteinaColageno = lazy(() => import("./pages/proteina-colageno").then(m => ({ default: m.ProteinaColageno })));
const TestProduct = lazy(() => import("./pages/test-product").then(m => ({ default: m.TestProduct })));
const ProductDetail = lazy(() => import("./pages/product-detail").then(m => ({ default: m.ProductDetail })));
const Checkout = lazy(() => import("./pages/checkout"));
const PaymentSuccessMercadoPago = lazy(() => import("./pages/payment-success-mp"));
const PaymentFailureMercadoPago = lazy(() => import("./pages/payment-failure-mp"));
const PaymentPendingMercadoPago = lazy(() => import("./pages/payment-pending-mp"));
const AdminLogin = lazy(() => import("./pages/admin-login").then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard").then(m => ({ default: m.AdminDashboard })));
import { MaintenancePage } from "./pages/maintenance";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import { NavigationProvider } from "./contexts/NavigationContext";
const AvisoPrivacidad = lazy(() => import("./pages/aviso-privacidad").then(m => ({ default: m.AvisoPrivacidad })));
import { trackPageView, tagSession } from "./config/analytics";
import { obtenerAjustes } from "./config/datos-tienda";

// Reserva alto mientras llega el trozo de codigo de la pagina, para que la carga
// diferida no genere un salto de maquetacion.
function CargandoPagina() {
  return <div className="min-h-screen" aria-busy="true" />;
}

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

  // index.php pinta el banner del hero en una capa encima de #root para que se
  // vea antes de que arranque React. Se retira una vez React ya pinto debajo:
  // el useEffect corre tras el commit y el rAF espera al pintado, asi el relevo
  // no deja ni un fotograma en negro.
  useEffect(() => {
    const capa = document.getElementById("lcp-overlay");
    if (!capa) return;
    requestAnimationFrame(() => requestAnimationFrame(() => capa.remove()));
  }, []);
  const [adminToken, setAdminToken]   = useState<string | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState<boolean>(true);

  // Recuperar sesión admin al cargar la página (persiste entre refreshes)
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('p');

    if (path.includes("payment-success-mp"))  setCurrentPage("payment-success-mp");
    else if (path.includes("payment-failure-mp")) setCurrentPage("payment-failure-mp");
    else if (path.includes("payment-pending-mp")) setCurrentPage("payment-pending-mp");
    else if (path.includes("admin"))              setCurrentPage("admin");
    else if (productParam)                        setCurrentPage(productParam);

    // Restaurar sesión si sigue vigente (no ha expirado)
    const storedToken = getStoredAdminSession();
    if (storedToken) setAdminToken(storedToken);
  }, []);

  // Verificar modo mantenimiento
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const settings = await obtenerAjustes();
        if (settings && settings.maintenance_mode === '1') {
          setIsMaintenanceMode(true);
        } else {
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.error("Error checking maintenance mode:", error);
      } finally {
        setIsLoadingMaintenance(false);
      }
    };
    checkMaintenance();
  }, []);

  // Reportar cada cambio de página a Meta Pixel y Clarity.
  // El primer PageView ya lo dispara el snippet de index.html, así que lo omitimos.
  const isFirstPageView = useRef(true);
  useEffect(() => {
    if (isFirstPageView.current) {
      isFirstPageView.current = false;
    } else {
      trackPageView();
    }
    tagSession("page", currentPage);
  }, [currentPage]);

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
    if (productId.startsWith("http")) {
      window.location.href = productId;
      return;
    }
    setCurrentPage(productId);
    window.history.pushState({}, '', `?p=${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateHome = () => {
    setCurrentPage("home");
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    if (page === "home") {
      window.history.pushState({}, '', window.location.pathname);
    } else {
      window.history.pushState({}, '', `?p=${page}`);
    }
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

  if (isLoadingMaintenance) {
    return <div className="min-h-screen bg-black" />; // Splash simple mientras carga
  }

  // Si estamos en mantenimiento y NO somos admin ni estamos en el dashboard admin, mostrar MaintenancePage
  if (isMaintenanceMode && currentPage !== "admin" && !adminToken) {
    return <MaintenancePage />;
  }

  return (
    <NavigationProvider navigateTo={navigateTo}>
      <CartProvider>
        <CartDrawer />

        {/* Admin Panel */}
        {currentPage === "admin" && (
          <Suspense fallback={<CargandoPagina />}>
            {!adminToken ? (
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            ) : (
              <AdminDashboard
                adminToken={adminToken}
                onLogout={handleAdminLogout}
              />
            )}
          </Suspense>
        )}

        {/* Checkout */}
        {currentPage === "checkout" && (
          <Suspense fallback={<CargandoPagina />}><Checkout /></Suspense>
        )}

        {/* Mercado Pago return pages */}
        {["payment-success-mp", "payment-failure-mp", "payment-pending-mp"].includes(currentPage) && (
          <Suspense fallback={<CargandoPagina />}>
            {currentPage === "payment-success-mp" && <PaymentSuccessMercadoPago />}
            {currentPage === "payment-failure-mp"  && <PaymentFailureMercadoPago />}
            {currentPage === "payment-pending-mp"  && <PaymentPendingMercadoPago />}
          </Suspense>
        )}

        {/* Home + Products */}
        {!["checkout", "payment-success-mp", "payment-failure-mp", "payment-pending-mp", "admin"].includes(currentPage) && (
          <>
            {currentPage === "home" && (
              <div className="min-h-screen">
                <Header onLogoClick={navigateHome} isProductPage={false} />
                <div className="pt-16">
                  <HeroCarousel onSlideClick={navigateToProduct} />
                </div>
                {/* Debajo del pliegue: el navegador se salta su maquetacion hasta
                    que se acercan a la pantalla. Siguen en el DOM, asi que no
                    cambia nada para buscadores ni para el usuario. */}
                <div className="difiere-maquetacion">
                <ProductsSection onProductClick={navigateToProduct} />
                <BrandSection />
                <BarsPromotion onShopClick={(flavorId?: string | React.MouseEvent) => {
                  if (typeof flavorId === 'string') {
                    setCurrentPage("barras-energeticas");
                    window.history.pushState({}, '', `?p=barras-energeticas&flavor=${flavorId}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    navigateToProduct("barras-energeticas");
                  }
                }} />
                <AmazonBanner />
                <FAQ />
                <Contact />
                <Footer />
                </div>
              </div>
            )}

            {currentPage !== "home" && (
              <div className="min-h-screen">
                <Header onLogoClick={navigateHome} isProductPage={true} />
                {/* El Suspense envuelve solo la pagina: asi el header y el pie
                    siguen visibles mientras llega su codigo. */}
                <Suspense fallback={<CargandoPagina />}>
                  {currentPage === "barras-energeticas" && <BarrasEnergeticas onBack={navigateHome} />}
                  {currentPage === "proteina-clasica"   && <ProteinaRegular onBack={navigateHome} />}
                  {currentPage === "proteina-regular"   && <ProteinaRegular onBack={navigateHome} />}
                  {currentPage === "proteina-colageno"  && <ProteinaColageno onBack={navigateHome} />}
                  {currentPage === "test-product"       && <TestProduct onBack={navigateHome} />}
                  {currentPage === "aviso-privacidad"   && <AvisoPrivacidad />}
                  {/* Fallback para productos nuevos dinámicos generados desde el backend */}
                  {!["barras-energeticas", "proteina-clasica", "proteina-regular", "proteina-colageno", "test-product", "aviso-privacidad"].includes(currentPage) && (
                    <ProductDetail productId={currentPage} onBack={navigateHome} />
                  )}
                </Suspense>
                <Footer />
              </div>
            )}
          </>
        )}
      </CartProvider>
    </NavigationProvider>
  );
}

