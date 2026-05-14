import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";

interface BarsPromotionProps {
  onShopClick?: () => void;
}

const flavors = [
  { name: "CHOCO PEANUT BUTTER", color: "#8B4513", weight: "75g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-choco%20peanut.webp" },
  { name: "TRUFA DE CHOCOLATE", color: "#4A2511", weight: "58g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-chocolate-truffle.webp" },
  { name: "CAFÉ TIRAMISU", color: "#C9A86A", weight: "65g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-tiramisú.webp" },
  { name: "FRESA", color: "#FF6B9D", weight: "70g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-almond.webp" },
];

export function BarsPromotion({ onShopClick }: BarsPromotionProps) {
  const [price16, setPrice16] = useState<number>(560);
  const [price24, setPrice24] = useState<number>(790);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        const products = await response.json();
        
        const p16 = products.find((p: any) => p.name.includes("16 pzs"));
        const p24 = products.find((p: any) => p.name.includes("24 pzs"));
        const base = products.find((p: any) => p.id === "barras-energeticas");

        if (p16 && p24) {
          setPrice16(Number(p16.price));
          setPrice24(Number(p24.price));
        } else if (base) {
          const basePrice = Number(base.price);
          setPrice16(basePrice);
          setPrice24(Math.round(basePrice * (790/560)));
        }
      } catch (error) {
        console.error("Error fetching prices for BarsPromotion:", error);
      }
    };
    fetchPrices();
  }, []);

  return (
    <section className="relative py-8 md:py-12 lg:py-20 bg-gradient-to-br from-[#00AAC7] via-[#00d4ff] to-[#00AAC7] overflow-hidden">
      {/* Subtle Grid Pattern Texture */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center px-0 md:px-0">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-black px-4 md:px-0"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 md:mb-3 lg:mb-4 leading-none tracking-tighter italic">
              BARRAS DE PROTEÍNA
            </h2>

            <p className="text-[13px] md:text-lg lg:text-xl font-bold mb-4 md:mb-6 lg:mb-8 text-black/80">
              16 o 24 barras | 4 sabores premium
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8">
              <div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black mb-1">Desde ${price16}</div>
                <div className="text-[13px] md:text-xs lg:text-sm font-bold text-black/60">16 barras: ${price16} | 24 barras: ${price24}</div>
              </div>
              <button
                className="group relative overflow-hidden"
                onClick={onShopClick}
              >
                <div className="absolute inset-0 bg-black transition-transform duration-300 group-hover:scale-105" />
                <div className="relative px-5 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 flex items-center gap-2 md:gap-3">
                  <span className="text-white font-black tracking-wide text-xs md:text-sm uppercase">
                    Compra Ahora
                  </span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
              {["30g de proteína por barra", "5g. de BCAA's", "4 ricos sabores"].map((feature, i) => (
                <div key={i} className="bg-black/10 backdrop-blur-sm p-2 md:p-2.5 lg:p-3 text-center">
                  <p className="text-[9px] md:text-[10px] lg:text-xs font-black uppercase tracking-wide">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Flavors */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4"
          >
            {flavors.map((flavor, index) => (
              <motion.div
                key={flavor.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative aspect-square group cursor-pointer overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-black/20 group-hover:border-black/40 transition-colors duration-300"
              >
                {/* Flavor Image */}
                <div className="absolute inset-0 flex items-center justify-center p-3 md:p-4">
                  <img
                    src={flavor.image}
                    alt={flavor.name}
                    className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Flavor Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 md:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-xs md:text-sm font-black tracking-tight text-center">
                    {flavor.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

