import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";

interface ProductsSectionProps {
  onProductClick?: (productId: string) => void;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
  description: string;
}

export function ProductsSection({ onProductClick }: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to static data if API fails
        setProducts([
          {
            id: "barras-energeticas",
            name: "Barras de Proteína",
            category: "Barras de Proteína",
            description: "16 o 24 barras | 4 sabores",
            price: "560",
            image: "https://imagenes.inedito.digital/LITFIT/4-sabores.webp",
            badge: "BEST SELLER",
          },
          {
            id: "proteina-clasica",
            name: "Proteina aislada",
            category: "Proteína ISO",
            description: "1.5kg | 3 sabores",
            price: "780",
            image: "https://imagenes.inedito.digital/LITFIT/proteina-standard.webp",
          },
          {
            id: "proteina-colageno",
            name: "Proteína + colágeno",
            category: "Proteína ISO + Colágeno",
            description: "1.5kg | 3 sabores",
            price: "890",
            image: "https://imagenes.inedito.digital/LITFIT/proteina-colageno-_1_.webp",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section id="productos" className="py-10 md:py-20 bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-4"
          >
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tighter">
                Conoce nuestros productos:
              </h2>
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center font-black text-gray-200 text-6xl tracking-tighter">
              CARGANDO...
            </div>
          ) : (
            products
              .filter(product => product.category !== 'TEST')
              .map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-black overflow-hidden cursor-pointer aspect-square md:aspect-auto"
                  onClick={() => onProductClick?.(product.id)}
                >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 lg:top-4 lg:left-4 z-10">
                    <div className="bg-[#00AAC7] text-black px-1.5 py-0.5 md:px-2 md:py-1 lg:px-3 lg:py-1 text-[9px] md:text-xs font-black tracking-wider shadow-lg">
                      {product.badge}
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="relative h-full md:h-[350px] lg:h-[400px] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 md:via-black/50 to-transparent opacity-80 md:opacity-60" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#00AAC7]/0 group-hover:bg-[#00AAC7]/10 transition-all duration-500" />
                </div>

                {/* Content */}
                <div className="absolute bottom-4 md:bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6 text-white bg-gradient-to-t from-black via-black/80 to-transparent">
                  <h3 className="text-xl md:text-xl lg:text-2xl font-black mb-1 md:mb-1 tracking-tight uppercase">
                    {product.name}
                  </h3>
                  <p className="text-white/80 text-[15px] md:text-xs lg:text-sm font-medium transition-all duration-500 max-h-0 opacity-0 overflow-hidden group-hover:max-h-[100px] group-hover:opacity-100 group-hover:mb-3 lg:group-hover:mb-4 group-hover:mt-2">
                    {product.description}
                  </p>

                  {/* Price and CTA */}
                  <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
                    <span className="text-2xl md:text-2xl lg:text-3xl font-black tracking-tight">
                      {product.id === "barras-energeticas" ? "Desde " : ""}${product.price}
                    </span>
                    <button className="relative group/btn overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-white transition-transform duration-300 group-hover/btn:scale-105 shadow-xl" />
                      <div className="relative px-4 py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 flex items-center gap-1.5 md:gap-2">
                        <ShoppingCart className="w-4 h-4 md:w-4 md:h-4 text-black" />
                        <span className="text-black font-black text-xs md:text-xs tracking-wide">COMPRAR</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00AAC7] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
