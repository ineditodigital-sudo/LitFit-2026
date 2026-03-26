import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import React, { useState, FormEvent } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    business: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus('idle');

    try {
      const payload = {
        type: 'contact',
        data: {
          from_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          business: formData.business,
          message: formData.message
        }
      };

      const response = await fetch('https://litfitmexico.com/envios/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSendStatus('success');
        setFormData({ name: '', email: '', phone: '', city: '', business: '', message: '' });
      } else {
        throw new Error(result.message);
      }
      
      setTimeout(() => setSendStatus('idle'), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSendStatus('error');
      setTimeout(() => setSendStatus('idle'), 5000);
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contacto" className="py-10 md:py-14 lg:py-16 bg-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] via-transparent to-[#00AAC7]/[0.03] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8 lg:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-1.5 md:mb-2 italic text-black">
            ¿Quieres LITFIT en tu ciudad?
          </h2>
          <p className="text-sm md:text-base text-black/60 font-medium max-w-2xl mx-auto">
            Ayúdanos con tus datos.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-black/5 p-4 md:p-6 lg:p-8 border border-black/10"
          >
            <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wide text-black mb-1.5 md:mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-black/20 focus:border-[#00AAC7] focus:outline-none transition-colors font-medium text-sm"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wide text-black mb-1.5 md:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-black/20 focus:border-[#00AAC7] focus:outline-none transition-colors font-medium text-sm"
                  placeholder="Tu email"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wide text-black mb-1.5 md:mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-black/20 focus:border-[#00AAC7] focus:outline-none transition-colors font-medium text-sm"
                  placeholder="Tu teléfono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wide text-black mb-1.5 md:mb-2">
                  Ciudad, Estado
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-black/20 focus:border-[#00AAC7] focus:outline-none transition-colors font-medium text-sm"
                  placeholder="Ej: Guadalajara, Jalisco"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wide text-black mb-1.5 md:mb-2">
                  Nombre de empresa o negocio
                </label>
                <input
                  type="text"
                  name="business"
                  value={formData.business}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-black/20 focus:border-[#00AAC7] focus:outline-none transition-colors font-medium text-sm"
                  placeholder="Nombre de tu empresa o negocio"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wide text-black mb-1.5 md:mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-black/20 focus:border-[#00AAC7] focus:outline-none transition-colors resize-none font-medium text-sm"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full group relative overflow-hidden"
                disabled={isSending}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] transition-transform duration-300 group-hover:scale-105" />
                <div className="relative px-5 md:px-6 py-3 md:py-3.5 flex items-center justify-center gap-2">
                  {isSending ? (
                    <CheckCircle className="w-4 h-4 text-black animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-black" />
                  )}
                  <span className="text-black font-black tracking-wide text-xs uppercase">
                    Enviar Mensaje
                  </span>
                </div>
              </button>
              {sendStatus === 'success' && (
                <p className="text-green-500 text-sm mt-2">Mensaje enviado con éxito</p>
              )}
              {sendStatus === 'error' && (
                <p className="text-red-500 text-sm mt-2">Error al enviar el mensaje</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
