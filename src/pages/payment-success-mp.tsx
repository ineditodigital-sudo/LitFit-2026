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
    const lastOrderId = localStorage.getItem('litfit_last_order_id');
    if (!lastOrderId) {
        console.warn('⚠️ No hay ID de pedido en localStorage');
        setStatus('error');
        setErrorMessage('No se encontró el ID del último pedido. ¿Ya fue procesado?');
        return;
    }

    // 🔒 BLOQUEO GOLBAL DE SESIÓN (Mucho más fuerte que useRef)
    const lockKey = `processed_${lastOrderId}`;
    if (sessionStorage.getItem(lockKey)) {
      console.log('🛑 Ya procesado en esta sesión. Abortando duplicado.');
      setOrderNumber(lastOrderId);
      setStatus('success');
      return;
    }

    if (hasProcessed.current) return;
    
    const processOrder = async () => {
      // Marcar bloqueo INMEDIATAMENTE de forma sincrónica
      hasProcessed.current = true;
      sessionStorage.setItem(lockKey, 'true');
      console.log('🧊 Procesando pedido por primera vez:', lastOrderId);
      setOrderNumber(lastOrderId);
      
      try {

        
        // Intentar obtener el ID del último pedido
        const lastOrderId = localStorage.getItem('litfit_last_order_id');
        
        if (!lastOrderId) {
          console.error('❌ No se encontró ID del pedido');
          setErrorMessage('No se encontraron los datos del pedido. Es posible que ya haya sido procesado.');
          setStatus('error');
          return;
        }



        // Recuperar datos del pedido usando el ID
        const orderDataStr = localStorage.getItem(`litfit_pending_order_${lastOrderId}`);
        
        if (!orderDataStr) {
          console.error('❌ No se encontraron datos para el ID:', lastOrderId);
          setErrorMessage('No se encontraron los datos del pedido. Es posible que ya haya sido procesado.');
          setStatus('error');
          return;
        }


        const orderData = JSON.parse(orderDataStr);
        const { items, formData, totalPrice, shippingCost, total, orderId, selectedShippingOption } = orderData;

        // Validar que los datos estén completos (permitiendo que total sea 0 para pruebas)
        if (!items || !formData || typeof total === 'undefined') {
          console.error('❌ Datos del pedido incompletos');
          setErrorMessage('Los datos del pedido están incompletos.');
          setStatus('error');
          return;
        }

        // Usar el ID del pedido que ya viene en los datos
        const orderNum = orderId || lastOrderId;
        setOrderNumber(orderNum);

        // Actualizar pedido en el sistema LIFTIT (Marcar como PAGADO)
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

        // Preparar detalles del pedido para el Admin (Texto plano)
        const orderDetails = items.map((item: any) => 
          `- ${item.name}${item.variant ? ` (${item.variant})` : ''}${item.size ? ` - ${item.size}` : ''} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
        ).join('\n');

        // Preparar detalles del pedido para el Cliente (HTML TABLE)
        const orderItemsHtml = `
          <table width="100%" style="border-collapse: collapse;">
            ${items.map((item: any) => `
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #222;">
                  <p style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: 700;">${item.name} ${item.variant ? `(${item.variant})` : ''}</p>
                  <p style="color: #888; font-size: 11px; margin: 5px 0 0;">CANTIDAD: ${item.quantity}</p>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #222; text-align: right;">
                  <p style="color: #00AAC7; font-size: 14px; margin: 0; font-weight: 900;">$${(item.price * item.quantity).toLocaleString()}</p>
                </td>
              </tr>
            `).join('')}
          </table>
        `;

        const shippingAddress = `${formData.street}, Col. ${formData.colonia}, ${formData.city}, ${formData.state}, CP ${formData.zipCode}, ${formData.country}`;
        
        // ============================================
        // PROCESAR PEDIDO CENTRALIZADO (Correos + Envíos + DB)
        // ============================================
        // El endpoint es IDEMPOTENTE: no enviará duplicados si ya fue procesado por el webhook.
        try {
          const processResponse = await fetch('https://litfitmexico.com/envios/process-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderNum })
          });
          
          const processData = await processResponse.json();
          if (processData.is_duplicate) {
            console.log('ℹ️ Pedido ya procesado por el servidor (Webhook).');
          } else if (processData.success) {
            console.log('✅ Pedido procesado desde el frontend con éxito.');
          } else {
            console.warn('⚠️ El servidor reportó un problema al procesar:', processData.message);
          }
        } catch (processError) {
          console.error('❌ Error llamando al procesador central:', processError);
        }

        // Limpiar carrito

        clearCart();

        // Limpiar localStorage

        localStorage.removeItem(`litfit_pending_order_${lastOrderId}`);
        localStorage.removeItem('litfit_last_order_id');

        // Marcar como éxito

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
