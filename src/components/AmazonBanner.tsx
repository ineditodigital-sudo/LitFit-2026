import { motion } from "motion/react";

export function AmazonBanner() {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-0 md:py-20">
      <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden cursor-pointer group"
          onClick={scrollToContact}
        >
          <img
            src="https://imagenes.inedito.digital/LITFIT/QUIERES_LITFIT_EN_TU_GYM.webp"
            alt="¿Quieres LITFIT en tu Gym?"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
}
