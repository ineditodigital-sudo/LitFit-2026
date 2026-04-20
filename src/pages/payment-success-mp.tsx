import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function PaymentSuccessMercadoPago() {
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const hasProcessed = useRef(false); // Flag para evitar doble ejecución

  useEffect(() => {
    // 1. Recuperar el ID: Prioridad a la URL (Mercado Pago lo envía aquí), después localStorage (local)
    const searchParams = new URLSearchParams(window.location.search);
    const urlOrderId = searchParams.get('external_reference');
    const localOrderId = localStorage.getItem('litfit_last_order_id');
    const lastOrderId = urlOrderId || localOrderId;

    if (!lastOrderId) {
        console.warn('⚠️ No se encontró ID de pedido en URL ni localStorage');
        setStatus('error');
        setErrorMessage('No se encontró el ID del pedido. Por favor verifica tu administrador.');
        return;
    }

    // 🔒 BLOQUEO GOBAL DE SESIÓN
    const lockKey = `processed_${lastOrderId}`;
    if (sessionStorage.getItem(lockKey)) {
      setOrderNumber(lastOrderId);
      setStatus('success');
      return;
    }

    if (hasProcessed.current) return;
    
    const processOrder = async () => {
      hasProcessed.current = true;
      sessionStorage.setItem(lockKey, 'true');
      setOrderNumber(lastOrderId);
      
      try {
        // Recuperar datos del pedido de localStorage si existen
        const orderDataStr = localStorage.getItem(`litfit_pending_order_${lastOrderId}`);
        let orderData = orderDataStr ? JSON.parse(orderDataStr) : null;

        // 🚀 AUTOMATIZACIÓN TOTAL: Si no hay datos locales (porque vienes de localhost)
        // El servidor ya tiene los datos en la DB porque se guardaron en el Checkout.
        // Solo necesitamos decirle al servidor "Oye, procesa este ID ahora mismo".
        const orderNum = lastOrderId;
        console.log('⚡ Iniciando procesamiento automático para:', orderNum);

        // Si tenemos datos locales (ej: compraste desde el sitio real)
        if (orderData) {
          try {
            await fetch("https://litfitmexico.com/envios/save-order.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...orderData,
                status: 'PAID',
                paymentMethod: 'MERCADOPAGO'
              }),
            });
          } catch (e) {
            console.error("Error al actualizar pedido en admin:", e);
          }
        }

        // ============================================
        // PROCESAR PEDIDO CENTRALIZADO (Correos + Envíos + DB)
        // ============================================
        // Este es el paso clave que genera la GUÍA automáticamente
        try {
          const processResponse = await fetch('https://litfitmexico.com/envios/process-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderNum })
          });
          
          const processData = await processResponse.json();
          console.log('📦 Respuesta del procesador automático:', processData);
          
          if (processData.success) {
            console.log('✅ Guía y correos generados automáticamente.');
          }
        } catch (processError) {
          console.error('❌ Error llamando al procesador central:', processError);
        }

        // Limpiar carrito y rastros
        clearCart();
        localStorage.removeItem(`litfit_pending_order_${lastOrderId}`);
        localStorage.removeItem('litfit_last_order_id');

        setStatus('success');
      } catch (error: any) {
        console.error('❌ Error procesando el pedido:', error);
        setErrorMessage(error?.text || error?.message || 'Error desconocido al enviar el email');
        setStatus('error');
      }
    };

    processOrder();
  }, []);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Loader2 className="w-16 h-16 text-[#00AAC7]" />
          </motion.div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Procesando tu pedido...
          </h1>
          <p className="text-gray-600">
            Por favor espera un momento
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-12 rounded-full inline-block mb-6">
            <AlertCircle className="w-24 h-24 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Error al procesar
          </h1>
          <p className="text-gray-600 mb-8">
            Hubo un problema al confirmar tu pedido. Por favor contacta soporte en reenviadorlitfit@inedito.digital
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {errorMessage}
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-black text-white font-black tracking-wide hover:bg-gray-900 transition-colors"
          >
            VOLVER AL INICIO
          </a>
        </div>
      </div>
    );
  }

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
          className="bg-gradient-to-br from-[#00AAC7] to-[#00d4ff] p-12 rounded-full inline-block mb-6"
        >
          <CheckCircle className="w-24 h-24 text-black" />
        </motion.div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        <p className="text-gray-600 mb-2">
          Tu pago con Mercado Pago fue procesado correctamente.
        </p>
        <p className="text-gray-600 mb-2">
          Recibirás un email de confirmación pronto.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Número de orden: #{orderNumber}
        </p>
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
