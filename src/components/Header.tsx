import { Menu, X, ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "motion/react";
import { CartButton } from "./CartButton";
import { obtenerAjustes } from "../config/datos-tienda";

interface HeaderProps {
  onLogoClick?: () => void;
  isProductPage?: boolean;
}

export function Header({ onLogoClick, isProductPage = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promoSettings, setPromoSettings] = useState({
    visible: true,
    text: "En la compra de $1,000 o más en productos, agrega a tu carrito un shaker de regalo",
    speed: 20,
    link: "",
    repetitions: 3,
    isStatic: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await obtenerAjustes();
        setPromoSettings({
          visible: data.promo_banner_visible !== '0',
          text: data.promo_banner_text || "En la compra de $1,000 o más en productos, agrega a tu carrito un shaker de regalo",
          speed: data.promo_banner_speed ? parseInt(data.promo_banner_speed) : 20,
          link: data.promo_banner_link || "",
          repetitions: data.promo_banner_repetitions ? parseInt(data.promo_banner_repetitions) : 3,
          isStatic: data.promo_banner_is_static === '1'
        });
      } catch (error) {
        console.error("Error fetching promo banner settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const scrollToSection = (id: string) => {
    // El menú se cierra primero. Al cerrarse, Motion hace una pasada de medición
    // que guarda y vuelve a poner la posición de scroll (window.scrollTo con el
    // valor suspendido), y eso cancelaba el desplazamiento suave si se lanzaba
    // antes: en móvil el menú se cerraba y la página no se movía a la sección.
    setMobileMenuOpen(false);

    const irALaSeccion = () => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    };

    // Dos cuadros de espera dejan pasar esa medición. El temporizador es el
    // respaldo por si el navegador no entrega cuadros.
    const cuandoTermineLaMedicion = (retraso = 0) => {
      let hecho = false;
      const unaVez = () => { if (!hecho) { hecho = true; irALaSeccion(); } };
      setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(unaVez)), retraso);
      setTimeout(unaVez, retraso + 250);
    };

    if (isProductPage && onLogoClick) {
      // Volver a la portada y esperar a que monte antes de buscar la sección.
      onLogoClick();
      cuandoTermineLaMedicion(300);
    } else {
      cuandoTermineLaMedicion(0);
    }
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
    // Si estamos en home, hacer scroll al top
    if (!isProductPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // La cinta promocional anima sin descanso. Girando desde el primer instante
  // consumia hilo principal durante el arranque y, al no parar nunca, la pagina
  // no llegaba a considerarse "visualmente estable". Se queda quieta hasta que
  // la carga termina, se detiene con la pestana en segundo plano y respeta la
  // preferencia de movimiento reducido del sistema.
  // La cabecera es fija y su alto cambia: 64 px de barra mas la cinta
  // promocional cuando esta encendida. Las fichas de producto reservaban 80 px
  // fijos, asi que el boton VOLVER quedaba debajo de la cinta y no se podia
  // tocar. Se publica el alto real para que cualquier pagina lo use.
  const cabeceraRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const nodo = cabeceraRef.current;
    if (!nodo) return;
    const publicar = () => {
      document.documentElement.style.setProperty('--alto-cabecera', `${Math.round(nodo.getBoundingClientRect().height)}px`);
    };
    publicar();
    const observador = new ResizeObserver(publicar);
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  const [animarCinta, setAnimarCinta] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    const arrancar = () => { t = setTimeout(() => setAnimarCinta(true), 2500); };
    if (document.readyState === "complete") arrancar();
    else window.addEventListener("load", arrancar, { once: true });
    return () => { clearTimeout(t); window.removeEventListener("load", arrancar); };
  }, []);

  const RepeatedText = () => (
    <>
      {Array.from({ length: promoSettings.repetitions }).map((_, i) => (
        <span key={i} className="mx-4 md:mx-8">
          {promoSettings.text}
        </span>
      ))}
    </>
  );

  return (
    <motion.header
      ref={cabeceraRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={handleLogoClick}
          >
            <img
              src="https://imagenes.inedito.digital/LITFIT/LOGO%20LITFIT%20BLANCO%20Y%20AZUL.webp"
              alt="LITFIT"
              className="h-7 sm:h-8"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Inicio", id: "hero" },
              { label: "Nosotros", id: "nosotros" },
              { label: "Productos", id: "productos" },
              { label: "Contacto", id: "contacto" },
              { label: "FAQ", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white/70 hover:text-white px-4 py-2 transition-colors relative group text-sm font-semibold tracking-wide uppercase"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00AAC7] group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Cart Button & Mobile Menu */}
          <div className="flex items-center gap-2">
            <CartButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
              aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
            >
              {/* Los iconos son decorativos: el nombre lo da el aria-label. */}
              {mobileMenuOpen ? <X aria-hidden="true" className="w-6 h-6" /> : <Menu aria-hidden="true" className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      {promoSettings.visible && (
        <div className="w-full bg-gradient-to-r from-[#0088A3] via-[#00AAC7] to-[#0088A3] text-white shadow-md border-t border-white/10 overflow-hidden relative group">
          {promoSettings.link ? (
            <a href={promoSettings.link} className="block w-full overflow-hidden" target={promoSettings.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
              {promoSettings.isStatic ? (
                <div className="py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-center w-full">
                  {promoSettings.text}
                </div>
              ) : (
                <div
                  className={`whitespace-nowrap flex items-center w-max py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider ${animarCinta ? "litfit-cinta" : ""}`}
                  style={{ ["--litfit-cinta-duracion" as any]: `${promoSettings.speed}s` }}
                >
                  <RepeatedText />
                  <RepeatedText />
                </div>
              )}
            </a>
          ) : (
            <div className="w-full overflow-hidden">
              {promoSettings.isStatic ? (
                <div className="py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-center w-full">
                  {promoSettings.text}
                </div>
              ) : (
                <div
                  className={`whitespace-nowrap flex items-center w-max py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider ${animarCinta ? "litfit-cinta" : ""}`}
                  style={{ ["--litfit-cinta-duracion" as any]: `${promoSettings.speed}s` }}
                >
                  <RepeatedText />
                  <RepeatedText />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 sm:px-6 py-6 space-y-1">
              {[
                { label: "Inicio", id: "hero" },
                { label: "Nosotros", id: "nosotros" },
                { label: "Productos", id: "productos" },
                { label: "Contacto", id: "contacto" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-white/70 hover:text-white py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
