import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowLeft } from 'lucide-react';

export default function PaymentPendingMercadoPago() {
  const hasProcessed = useRef(false); // Flag para evitar doble ejecución

  useEffect(() => {
    // Si ya se procesó, no hacer nada
    if (hasProcessed.current) {

      return;
    }

    // Marcar como procesado INMEDIATAMENTE
    hasProcessed.current = true;


    
    // NO limpiar datos todavía porque el pago puede completarse más tarde
    const lastOrderId = localStorage.getItem('litfit_last_order_id');
    if (lastOrderId) {

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
          className="bg-yellow-100 p-12 rounded-full inline-block mb-6"
        >
          <Clock className="w-24 h-24 text-yellow-600" />
        </motion.div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Pago Pendiente
        </h1>
        <p className="text-gray-600 mb-2">
          Tu pago está en proceso de validación.
        </p>
        <p className="text-gray-600 mb-2">
          Recibirás un email cuando se confirme el pago.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Número de orden: #{localStorage.getItem('litfit_last_order_id')}
        </p>
        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 mb-8 text-left">
          <p className="text-sm text-gray-700">
            <strong className="font-black">Si pagaste con OXXO o efectivo:</strong><br />
            Tu pedido se procesará una vez que realices el pago en la tienda. Revisa tu correo para las instrucciones.
          </p>
        </div>
        <div className="space-y-3">
          <a
            href="/"
            className="block px-8 py-4 bg-black text-white font-black tracking-wide hover:bg-gray-900 transition-colors"
          >
            VOLVER AL INICIO
          </a>
          <a
            href="/checkout"
            className="block px-8 py-4 border-2 border-gray-300 text-gray-900 font-black tracking-wide hover:border-[#00AAC7] transition-colors"
          >
            HACER OTRO PEDIDO
          </a>
        </div>
      </motion.div>
    </div>
  );
}
