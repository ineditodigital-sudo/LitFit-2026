import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { m as motion, AnimatePresence } from "motion/react";

interface HeroCarouselProps {
  onSlideClick?: (productId: string) => void;
}

export function HeroCarousel({ onSlideClick }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  // index.php inyecta los slides en el HTML (window.__LITFIT_HERO__), asi el
  // banner se pinta en el primer render en vez de esperar a api-settings. Si no
  // vienen (desarrollo con vite), se consultan como antes.
  const slidesIniciales = typeof window !== "undefined" ? (window as any).__LITFIT_HERO__ : null;
  const [slides, setSlides] = useState<any[]>(Array.isArray(slidesIniciales) && slidesIniciales.length > 0 ? slidesIniciales : []);

  const defaultSlides = [
    {
      image: "/BANNER-CREATINA.png",
      imageMobile: "/responsivecreatine-1.png",
      productId: "creatina",
    },
    {
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_1.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/banner-1-2.webp",
      productId: "barras-energeticas",
    },
    {
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_2.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/banner-2-2.webp",
      productId: "proteina-clasica",
    },
    {
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_2_copia.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/banner-3-2.webp",
      productId: "proteina-colageno",
    },
    {
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_2_copia_2.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/BANNER-4-2.webp",
      productId: "shaker",
    },
  ];

  useEffect(() => {
    // Ya vinieron en el HTML: no hace falta pedirlos.
    if (slides.length > 0) return;

    const fetchSlides = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`);
        if (response.ok) {
          const settings = await response.json();
          if (settings.hero_slides) {
            const parsedSlides = JSON.parse(settings.hero_slides);
            if (parsedSlides.length > 0) {
              setSlides(parsedSlides);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      }
      // Fallback
      setSlides(defaultSlides);
    };

    fetchSlides();
  }, []);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // El carrusel ocupa toda la pantalla en movil, asi que cada giro repinta el
  // viewport entero. Girando desde el primer instante competia con la carga de
  // la pagina y no dejaba que se estabilizara nunca.
  //
  // Ahora empieza cuando la pagina ya termino de cargar y el visitante llevaba
  // unos segundos mirando el primer banner, se detiene si la pestana pasa a
  // segundo plano, y no gira si el sistema pide reducir el movimiento.
  useEffect(() => {
    if (slides.length < 2) return;

    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (sinMovimiento.matches) return;

    let intervalo: ReturnType<typeof setInterval> | undefined;
    let arranque: ReturnType<typeof setTimeout> | undefined;

    const detener = () => { if (intervalo) { clearInterval(intervalo); intervalo = undefined; } };
    const arrancar = () => { if (!intervalo && document.visibilityState === "visible") intervalo = setInterval(nextSlide, 5000); };

    // 12 s antes del primer giro: da tiempo a leer el banner de entrada y evita
    // que el carrusel repinte la pantalla completa mientras la pagina todavia se
    // esta asentando. Los giros siguientes van cada 5 s, como siempre.
    const programar = () => { arranque = setTimeout(arrancar, 12000); };
    if (document.readyState === "complete") programar();
    else window.addEventListener("load", programar, { once: true });

    const alCambiarVisibilidad = () => { if (document.visibilityState === "hidden") detener(); else if (arranque === undefined || intervalo) arrancar(); };
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      detener();
      if (arranque) clearTimeout(arranque);
      window.removeEventListener("load", programar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [slides.length]);

  // Adelanta la imagen del siguiente slide cuando el navegador esta libre. Antes
  // se descargaban las de todos los slides (movil y escritorio) nada mas entrar:
  // mas de 1 MB compitiendo con el arranque. Con solo la siguiente, el cambio
  // sigue siendo instantaneo y la carga inicial se mantiene ligera.
  useEffect(() => {
    if (slides.length < 2) return;
    const siguiente = slides[(currentSlide + 1) % slides.length];
    if (!siguiente) return;
    const esEscritorio = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
    const url = esEscritorio ? siguiente.image : (siguiente.imageMobile || siguiente.image);
    if (!url) return;

    const w = window as any;
    const adelantar = () => { new Image().src = url; };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(adelantar, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = setTimeout(adelantar, 1500);
    return () => clearTimeout(id);
  }, [currentSlide, slides]);

  // El contenedor reserva el alto con la proporcion real de los banners
  // (9:16 en movil, 5:2 en escritorio). Antes el placeholder era h-screen y al
  // llegar los slides el alto cambiaba de golpe: era el origen del CLS.
  const PROPORCION = "aspect-[9/16] md:aspect-[5/2]";

  if (slides.length === 0) {
    return <div className={`w-full bg-black ${PROPORCION}`} />;
  }

  return (
    <div id="hero" className={`relative w-full overflow-hidden bg-black ${PROPORCION}`}>
      {/* initial={false}: el primer slide aparece ya visible, sin fundido.
          El HTML pinta ese banner antes de que arranque React; al montar, el
          fundido de entrada lo llevaba a opacity 0 y lo hacia reaparecer poco a
          poco, de modo que la imagen parpadeaba a negro casi dos segundos.
          Los cambios de slide posteriores si se funden, como siempre. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => {
            if (onSlideClick && slides[currentSlide].productId) {
              onSlideClick(slides[currentSlide].productId);
            }
          }}
        >
          {/* Un solo <picture>: el navegador descarga la version movil O la de
              escritorio, nunca las dos. Antes se bajaban ambas en todos los
              dispositivos, y ademas las de todos los slides. */}
          <picture className="w-full h-full">
            <source media="(min-width: 768px)" srcSet={slides[currentSlide].image} />
            <img
              src={slides[currentSlide].imageMobile || slides[currentSlide].image}
              alt={`LITFIT Banner ${currentSlide + 1}`}
              width={1080}
              height={1920}
              loading="eager"
              // React 18 no reconoce fetchPriority en camelCase: avisa en consola y
              // lo pasa en minusculas. Se manda ya en minusculas.
              {...({ fetchpriority: currentSlide === 0 ? "high" : "auto" } as Record<string, string>)}
              decoding="async"
              className="w-full h-full object-contain"
            />
          </picture>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="group relative"
            aria-label={`Ver banner ${index + 1} de ${slides.length}`}
            aria-current={currentSlide === index ? "true" : undefined}
          >
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "w-12 bg-[#00AAC7]"
                  : "w-8 bg-white/30 hover:bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        aria-label="Banner anterior"
        className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/30 hover:bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all z-20 group"
      >
        <ChevronLeft aria-hidden="true" className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        aria-label="Banner siguiente"
        className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/30 hover:bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all z-20 group"
      >
        <ChevronRight aria-hidden="true" className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide Counter */}
      <div className="absolute bottom-4 right-4 md:right-8 z-20 text-white/50 font-bold text-sm tracking-wider">
        <span className="text-[#00AAC7]">{String(currentSlide + 1).padStart(2, "0")}</span>
        <span className="mx-2">/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
