import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartButton } from "./CartButton";

interface HeaderProps {
  onLogoClick?: () => void;
  isProductPage?: boolean;
}

export function Header({ onLogoClick, isProductPage = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    // Si estamos en una página de producto, primero volver al home
    if (isProductPage && onLogoClick) {
      onLogoClick();
      // Esperar a que se renderice la página de home y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Si estamos en home, hacer scroll directo
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
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

  return (
    <motion.header
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
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

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
