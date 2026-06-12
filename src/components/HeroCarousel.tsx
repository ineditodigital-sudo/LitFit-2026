import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroCarouselProps {
  onSlideClick?: (productId: string) => void;
}

export function HeroCarousel({ onSlideClick }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);

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

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return <div className="w-full h-screen bg-black" />; // Splash / placeholder
  }

  return (
    <div id="hero" className="relative w-full h-auto overflow-hidden bg-black">
      {/* Preload images to fix slow loading on transitions */}
      <div className="hidden">
        {slides.map((slide, index) => (
          <div key={`preload-${index}`}>
            <link rel="preload" as="image" href={slide.image} fetchPriority={index === 0 ? "high" : "auto"} />
            <link rel="preload" as="image" href={slide.imageMobile} fetchPriority={index === 0 ? "high" : "auto"} />
            {/* hidden img tags just fallback caching */}
            <img src={slide.image} alt="preload desk" />
            <img src={slide.imageMobile} alt="preload mob" />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full flex items-center justify-center cursor-pointer"
          onClick={() => {
            if (onSlideClick && slides[currentSlide].productId) {
              onSlideClick(slides[currentSlide].productId);
            }
          }}
        >
          <img
            src={slides[currentSlide].image}
            alt={`LITFIT Banner ${currentSlide + 1}`}
            className="hidden md:block w-full h-auto object-contain"
          />
          <img
            src={slides[currentSlide].imageMobile}
            alt={`LITFIT Banner ${currentSlide + 1}`}
            className="block md:hidden w-full h-auto object-contain"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="group relative"
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

      {/* Slide Counter */}
      <div className="absolute bottom-4 right-4 md:right-8 z-20 text-white/50 font-bold text-sm tracking-wider">
        <span className="text-[#00AAC7]">{String(currentSlide + 1).padStart(2, "0")}</span>
        <span className="mx-2">/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
