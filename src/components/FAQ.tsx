import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "¿Cuánto tardan en llegar?",
    answer: "El pedido se enviará en max 24 hrs y tardará 2-3 días pero aún así pueden surgir contratiempos con la paquetería.",
  },
  {
    question: "¿Tiene lactosa?",
    answer: "Utilizamos proteína aislada de suero de leche, se considera libre de lactosa. Pero por ser de origen lácteo si existe la posibilidad.",
  },
  {
    question: "¿Tiene azúcar?",
    answer: "Las barras sí, la proteína en polvo no.",
  },
  {
    question: "¿Mejor momento para consumir?",
    answer: "Principalmente se sugiere después de realizar actividad física, te ayudará a recuperarte más rápido. Pero puedes adaptar nuestros productos a cualquier momento del día.",
  },
  {
    question: "¿Apta para veganos?",
    answer: "No, al contener productos lácteos no se recomiendan en veganos.",
  },
  {
    question: "¿Si no hago ejercicio puedo consumir proteína?",
    answer: "Sí, la proteína es para todos, el cuerpo la usa para muchas funciones. Y se recomienda en cualquier etapa de vida y actividad.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-10 md:py-16 lg:py-20 bg-gradient-to-br from-black via-black to-[#00AAC7]/10 text-white relative overflow-hidden">
      <div className="max-w-[900px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8 lg:mb-12"
        >
          <p className="text-[#00AAC7] font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2">
            Soporte
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-2 md:mb-3 lg:mb-4 italic">
            FAQ
          </h2>
          <p className="text-white/60 text-base md:text-lg font-medium">
            Respuestas rápidas a preguntas frecuentes
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="border border-white/10 hover:border-[#00AAC7]/50 transition-colors duration-300 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 md:px-6 py-3 md:py-4 lg:py-5 flex items-center justify-between text-left group"
              >
                <span className={`text-sm md:text-base font-bold tracking-tight transition-colors ${
                  openIndex === index ? 'text-[#00AAC7]' : 'text-white group-hover:text-[#00AAC7]'
                }`}>
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 ml-3 md:ml-4 transition-colors ${
                  openIndex === index ? 'text-[#00AAC7]' : 'text-white/50'
                }`}>
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-3 md:pb-4 lg:pb-5 text-white/60 text-sm md:text-base font-medium border-t border-white/5">
                      <div className="pt-3 md:pt-4">{faq.answer}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-6 md:mt-8 lg:mt-12 bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] p-5 md:p-6 lg:p-8 text-center"
        >
          <h3 className="text-xl md:text-2xl font-black text-black mb-1.5 md:mb-2 tracking-tight">
            ¿Necesitas más ayuda?
          </h3>
          <p className="text-sm md:text-base text-black/70 mb-4 md:mb-5 lg:mb-6 font-medium">
            Nuestro equipo está disponible 24/7
          </p>
          <button className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-black transition-transform duration-300 group-hover:scale-105" />
            <div className="relative px-6 md:px-8 py-3 md:py-4">
              <span className="text-white font-black tracking-wide text-xs md:text-sm uppercase">
                Contactar Soporte
              </span>
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
