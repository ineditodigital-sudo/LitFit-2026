import { useState, useEffect } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Header } from "../components/Header";
import { HeroCarousel } from "../components/HeroCarousel";
import { ProductsSection } from "../components/ProductsSection";
import { BrandSection } from "../components/BrandSection";
import { BarsPromotion } from "../components/BarsPromotion";
import { AmazonBanner } from "../components/AmazonBanner";
import { FAQ } from "../components/FAQ";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { BarrasEnergeticas } from "./barras-energeticas";
import { ProteinaRegular } from "./proteina-regular";
import { ProteinaColageno } from "./proteina-colageno";
import Checkout from "./checkout";
import Rastreo from "./rastreo";
import { CartDrawer } from "../components/CartDrawer";
import { useNavigation } from "../contexts/NavigationContext";

export default function Home() {
  const { currentPage, navigateTo, navigateHome, navigateToProduct } = useNavigation();

  // PayPal configuration
  // IMPORTANTE: Para pasar a PRODUCCIÓN (pagos reales), sigue estos pasos:
  // 1. Ve a https://developer.paypal.com/dashboard
  // 2. Cambia de "Sandbox" a "Live" en la parte superior
  // 3. Crea una nueva App en modo Live
  // 4. Copia el Client ID de producción
  // 5. Reemplaza el client-id de abajo con el de producción
  // 6. Cambia currency="USD" si es necesario (MXN para México)
  // 7. Haz commit y push a GitHub, Vercel redesplegará automáticamente
  // 
  // SANDBOX (pruebas): Usa este Client ID para probar sin dinero real
  // PRODUCCIÓN (pagos reales): Reemplaza con tu Client ID de producción
  const paypalOptions = {
    clientId: "AZAkB7H4GGEZh_CZaP_dvGmEb8m3Bn-FDGfCGhPd6x8nL-xXGZKHZBwH9jMSbGG8KxN_MvXDDp8p5z7l", // SANDBOX - Cambiar a producción
    currency: "MXN",
    intent: "capture",
  };

  const renderPage = () => {
    switch (currentPage) {
      case "barras-energeticas":
        return <BarrasEnergeticas onBack={navigateHome} />;
      case "proteina-clasica":
      case "proteina-regular":
        return <ProteinaRegular onBack={navigateHome} />;
      case "proteina-colageno":
        return <ProteinaColageno onBack={navigateHome} />;
      case "checkout":
        return <Checkout onNavigateHome={navigateHome} />;
      case "rastreo":
        return <Rastreo />;
      default:
        return (
          <>
            <HeroCarousel onSlideClick={navigateToProduct} />
            <ProductsSection onProductClick={navigateToProduct} />
            <BrandSection />
            <BarsPromotion onShopClick={() => navigateToProduct("barras-energeticas")} />
            <AmazonBanner />
            <FAQ />
            <Contact />
          </>
        );
    }
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="min-h-screen bg-white">
        <Header onLogoClick={navigateHome} isProductPage={currentPage !== 'home'} />
        <CartDrawer />
        {renderPage()}
        <Footer />
      </div>
    </PayPalScriptProvider>
  );
}
