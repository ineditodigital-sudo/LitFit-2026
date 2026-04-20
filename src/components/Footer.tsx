import { Facebook, Instagram, Twitter, Youtube, ArrowRight } from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { navigateTo } = useNavigation();

  const products = [
    { name: "Barras de Proteína", page: "barras-energeticas" },
    { name: "Proteína ISO", page: "proteina-regular" },
    { name: "Proteína ISO + Colágeno", page: "proteina-colageno" },
  ];

  return (
    <footer className="bg-black text-white border-t border-white/10">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand Column - Larger */}
          <div className="lg:col-span-5">
            <img
              src="https://imagenes.inedito.digital/LITFIT/LOGO%20LITFIT%20BLANCO%20Y%20AZUL.webp"
              alt="LITFIT"
              className="h-10 mb-6"
            />
            <p className="text-white/60 mb-6 font-medium leading-relaxed max-w-sm">
              Nutrición deportiva premium para atletas de élite. Calidad garantizada, resultados comprobados.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Youtube, label: "YouTube" },
              ].map((social, i) => (
                <button
                  key={i}
                  className="w-10 h-10 bg-white/10 hover:bg-[#00AAC7] flex items-center justify-center transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-white" />
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-black tracking-widest uppercase mb-4 text-[#00AAC7]">
              Productos
            </h3>
            <ul className="space-y-2">
              {products.map((product) => (
                <li key={product.name}>
                  <button 
                    onClick={() => navigateTo(product.page)}
                    className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/40 group-hover:bg-[#00AAC7] transition-colors" />
                    {product.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-black tracking-widest uppercase mb-4 text-[#00AAC7]">
              Soporte
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#faq" className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  Contacto
                </a>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('rastreo')}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  Rastrear Pedido
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-white/40 font-medium">
              © {currentYear} LITFIT. Elite Performance Nutrition.
            </p>
            <div className="flex gap-6">
              {["Privacidad", "Términos", "Cookies"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white/40 hover:text-white transition-colors font-medium"
                >
                  {item}
                </a>
              ))}
              <button 
                onClick={() => navigateTo('test-pago-real')}
                className="text-white/10 hover:text-[#00AAC7] transition-colors font-medium text-[10px] uppercase tracking-tighter"
              >
                Prueba Sistema
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
