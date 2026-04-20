import { motion } from "motion/react";
import { Activity, Zap, TrendingUp, Sparkles } from "lucide-react";

const productHighlights = [
  {
    title: "BARRAS DE PROTEÍNA",
    subtitle: "4 diferentes sabores",
  },
  {
    title: "PROTEÍNA CON COLÁGENO",
    subtitle: "Adicionada con colágeno hidrolizado",
  },
  {
    title: "PROTEÍNA AISLADA",
    subtitle: "De suero de leche",
  },
];

const benefits = [
  {
    icon: Activity,
    title: "30g DE PROTEÍNA",
    description: "En cada barra",
  },
  {
    icon: Zap,
    title: "5g DE BCAA'S",
    description: "Cada barra está adicionada con BCAA's para mejorar tu recuperación",
  },
  {
    icon: TrendingUp,
    title: "28.5g DE PROTEÍNA",
    description: "Nuestra proteina standard con más proteina por porción",
  },
  {
    icon: Sparkles,
    title: "COLÁGENO",
    description: "Proteína adicionada con colageno hidrolizado",
  },
];

export function BrandSection() {
  return (
    <section id="nosotros" className="relative py-8 md:py-12 lg:py-24 bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#00AAC7 1px, transparent 1px), linear-gradient(90deg, #00AAC7 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center mb-6 md:mb-10 lg:mb-20">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block mb-3 md:mb-4 lg:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] blur-lg opacity-50" />
                <div className="relative bg-black/50 backdrop-blur-sm border border-[#00AAC7]/50 px-2.5 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2">
                  <span className="text-[#00AAC7] text-[9px] md:text-[10px] lg:text-xs font-black tracking-widest uppercase">
                    Formula LITFIT una marca creada por y para atletas
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 md:mb-4 lg:mb-6 leading-none tracking-tighter italic">
              LITFIT,
              <span className="block text-[#00AAC7]">NUTRICIÓN DE ALTO DESEMPEÑO</span>
            </h2>

            {/* Mobile text */}
            <div className="md:hidden">
              <p className="text-sm text-white/70 mb-3 font-medium leading-relaxed">
                Nacemos desde la experiencia real en el entrenamiento y el alto rendimiento. Sabemos lo que el cuerpo necesita porque lo vivimos todos los días.
              </p>

              <p className="text-sm text-white/70 mb-3 font-medium leading-relaxed">
                Desarrollamos fórmulas enfocadas en rendimiento y nutrición óptima, con más proteína por porción que muchas marcas. Más gramos efectivos = mejor recuperación, más músculo y mejor desempeño.
              </p>

              <p className="text-sm text-white/70 mb-4 font-medium leading-relaxed">
                Sin ingredientes innecesarios.<br />
                Sin promesas vacías.<br />
                Solo nutrición estratégica que respalda tu entrenamiento. 💪
              </p>
            </div>

            {/* Desktop/Tablet text */}
            <div className="hidden md:block">
              <p className="text-base lg:text-lg text-white/70 mb-4 lg:mb-6 font-medium leading-relaxed">
                Nace desde la experiencia real en entrenamiento, desde el esfuerzo en cada repetición, desde la disciplina que exige el alto rendimiento. Sabemos lo que el cuerpo necesita porque lo vivimos todos los días. Por eso desarrollamos fórmulas enfocadas en una sola cosa: rendimiento y nutrición óptima.
              </p>

              <p className="text-sm lg:text-base text-white/50 mb-4 lg:mb-6 leading-relaxed">
                Además, ofrecemos mayores cantidades de proteína por porción que muchas marcas del mercado, porque entendemos que el atleta serio necesita resultados reales, no promesas. Más gramos efectivos, mejor recuperación, mejor construcción muscular y mejor desempeño.
              </p>

              <p className="text-sm lg:text-base text-white/50 mb-6 lg:mb-8 leading-relaxed">
                Cada producto está diseñado para complementar tu fuerza, resistencia y recuperación, manteniendo un equilibrio entre calidad, sabor y funcionalidad. Sin fórmulas infladas. Sin ingredientes innecesarios. Solo nutrición estratégica que respalda tu entrenamiento.
              </p>
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src="https://imagenes.inedito.digital/LITFIT/imagen-nosotros-litfit.webp"
                alt="LITFIT Elite"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              {/* Floating Product Highlights - Top 2 - Hidden on mobile, shown on md+ */}
              <div className="hidden md:grid absolute bottom-6 left-6 right-6 grid-cols-2 gap-4">
                {productHighlights.slice(0, 2).map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-black/80 backdrop-blur-sm border border-white/10 p-4 text-center"
                  >
                    <div className="font-black mb-1 text-xl text-[#00AAC7]">
                      {product.title}
                    </div>
                    <div className="text-xs text-white/60 font-bold tracking-wide">
                      {product.subtitle}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile: Product Highlights - Top 2 - Shown below image on mobile only */}
            <div className="grid md:hidden grid-cols-2 gap-2 md:gap-3 mt-2 md:mt-3">
              {productHighlights.slice(0, 2).map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-black/80 backdrop-blur-sm border border-white/10 p-2.5 md:p-3 text-center"
                >
                  <div className="font-black mb-0.5 text-sm md:text-base lg:text-xl text-[#00AAC7]">
                    {product.title}
                  </div>
                  <div className="text-[11px] md:text-[10px] lg:text-xs text-white/60 font-bold tracking-wide">
                    {product.subtitle}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Product Highlight - Bottom 1 */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 mt-2 md:mt-3 lg:mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-black/80 backdrop-blur-sm border border-white/10 p-2.5 md:p-3 lg:p-4 text-center col-span-2"
              >
                <div className="font-black mb-0.5 text-sm md:text-base lg:text-xl text-[#00AAC7]">
                  {productHighlights[2].title}
                </div>
                <div className="text-[11px] md:text-[10px] lg:text-xs text-white/60 font-bold tracking-wide">
                  {productHighlights[2].subtitle}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00AAC7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-3 md:p-4 lg:p-6 group-hover:border-[#00AAC7]/50 transition-all duration-500 md:h-full flex flex-col aspect-square md:aspect-auto md:min-h-[160px] lg:min-h-[200px]">
                <benefit.icon className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#00AAC7] mb-2 md:mb-3 lg:mb-4" />
                <h3 className="text-base md:text-lg lg:text-xl font-black mb-1.5 md:mb-2 tracking-tight">{benefit.title}</h3>
                <p className="text-white/60 text-[13px] md:text-xs lg:text-sm leading-relaxed flex-grow">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
