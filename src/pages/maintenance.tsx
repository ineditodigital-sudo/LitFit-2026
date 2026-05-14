import { motion } from "motion/react";
import { Hammer, Lock, Mail, Instagram } from "lucide-react";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00AAC7] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00AAC7] blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#00AAC7] rounded-[30px] flex items-center justify-center shadow-2xl shadow-[#00AAC7]/20">
            <Hammer className="w-10 h-10 text-black animate-bounce" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic">
          Estamos <span className="text-[#00AAC7]">Mejorando</span> Para Ti
        </h1>

        <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          Nuestra tienda está recibiendo una actualización de alto rendimiento. 
          Volveremos muy pronto con nuevos lanzamientos y la mejor suplementación.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#00AAC7]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase tracking-widest">Acceso Restringido</p>
              <p className="text-gray-500 text-xs">Ventas pausadas temporalmente</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Instagram className="w-6 h-6 text-[#00AAC7]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm uppercase tracking-widest">Síguenos</p>
              <p className="text-gray-500 text-xs">@litfitmexico</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-3 text-gray-500">
            <Mail className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">contacto@litfitmexico.com</span>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <img 
            src="https://imagenes.inedito.digital/LITFIT/LOGO-LITFIT-V8.png" 
            alt="LITFIT" 
            className="h-8 mx-auto opacity-50 grayscale brightness-200"
          />
        </div>
      </motion.div>
    </div>
  );
}
