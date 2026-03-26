import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailureMercadoPago() {
  const hasProcessed = useRef(false); // Flag para evitar doble ejecución

  useEffect(() => {
    // Si ya se procesó, no hacer nada
    if (hasProcessed.current) {

      return;
    }

    // Marcar como procesado INMEDIATAMENTE
    hasProcessed.current = true;


    
    // Limpiar datos del pedido pendiente
    const lastOrderId = localStorage.getItem('litfit_last_order_id');
    if (lastOrderId) {

      localStorage.removeItem(`litfit_pending_order_${lastOrderId}`);
      localStorage.removeItem('litfit_last_order_id');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="bg-red-100 p-12 rounded-full inline-block mb-6"
        >
          <XCircle className="w-24 h-24 text-red-500" />
        </motion.div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Pago Rechazado
        </h1>
        <p className="text-gray-600 mb-2">
          Tu pago con Mercado Pago no pudo ser procesado.
        </p>
        <p className="text-gray-600 mb-8">
          Por favor verifica tus datos e intenta nuevamente.
        </p>
        <div className="space-y-3">
          <a
            href="/checkout"
            className="block px-8 py-4 bg-[#00AAC7] text-black font-black tracking-wide hover:bg-[#00d4ff] transition-colors"
          >
            INTENTAR DE NUEVO
          </a>
          <a
            href="/"
            className="block px-8 py-4 border-2 border-gray-300 text-gray-900 font-black tracking-wide hover:border-[#00AAC7] transition-colors"
          >
            VOLVER AL INICIO
          </a>
        </div>
      </motion.div>
    </div>
  );
}
