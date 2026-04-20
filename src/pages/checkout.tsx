import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, CreditCard, Truck, MapPin, User, Mail, Phone, CheckCircle, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { ShippingQuote } from '../components/ShippingQuote';

// ⚠️ IMPORTANTE: Backend PHP usando subdominio cdn.inedito.digital
// Frontend en: litfit.inedito.digital (Figma Make)
const MP_BACKEND_URL = "https://litfitmexico.com/mercadopago/create-preference.php";
const ENVIOS_CREAR_GUIA_URL = "https://litfitmexico.com/envios/crear-guia.php";
const SAVE_ORDER_URL = "https://litfitmexico.com/envios/save-order.php";


interface ShippingOption {
  id?: string;
  carrier: string;
  service: string;
  price: number;
  deliveryDays: string;
}

// Función para registrar el pedido en el administrador (Control Total)
async function recordOrder(orderData: any) {
  try {
    const response = await fetch(SAVE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error al registrar pedido:", error);
    return null;
  }
}

// Función para crear guía de envío después del pago exitoso
async function createShippingLabel(orderData: any, shippingOption: ShippingOption) {
  try {
    const response = await fetch(ENVIOS_CREAR_GUIA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: orderData,
        shipping: shippingOption,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear guía de envío');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return null;
  }
}

// Mercado Pago Button Component
function MercadoPagoButton({ 
  items, 
  totalPrice, 
  shippingCost, 
  total, 
  formData,
  selectedShippingOption
}: {
  items: any[];
  totalPrice: number;
  shippingCost: number;
  total: number;
  formData: any;
  selectedShippingOption: ShippingOption | null;
}) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Generar un ID único para este pedido
      const orderId = 'LITFIT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Guardar datos del pedido en localStorage con ID único
      const orderData = {
        items,
        formData,
        totalPrice,
        shippingCost,
        total,
        selectedShippingOption,
        timestamp: new Date().toISOString(),
        orderId
      };
      
      // Registrar pedido en el sistema LIFTIT (Control Total) como PENDIENTE
      const recordToast = toast.loading("Guardando pedido en el administrador...");
      const saveResult = await recordOrder({
        ...orderData,
        status: "PENDING",
        paymentMethod: "MERCADOPAGO",
      });
      
      if (saveResult && saveResult.success) {
        toast.success("Pedido registrado con éxito", { id: recordToast });
      } else {
        toast.error("Aviso: El pedido no se pudo registrar en la base de datos, pero el pago continuará.", { id: recordToast });
      }
      
      // Guardar con el ID como clave
      localStorage.setItem(`litfit_pending_order_${orderId}`, JSON.stringify(orderData));
      // También guardar el último ID para referencia
      localStorage.setItem('litfit_last_order_id', orderId);
      
      // 🚀 BYPASS PARA PRUEBAS: Si el carrito tiene productos de prueba (totalPrice 0)
      if (total === 0 || totalPrice === 0 || items.some(i => i.price === 0)) {
        toast.success("Pedido de prueba gratuito válido. Procesando sin pago...", { duration: 1500 });
        setTimeout(() => {
          window.location.href = '/payment-success-mp';
        }, 1500);
        return;
      }


      
      const response = await fetch(MP_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          formData,
          shippingCost,
          totalPrice,
          total,
          orderId, // Enviar el ID al backend
          shippingOption: selectedShippingOption
        }),
      });
      

      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        console.error('📊 Status:', response.status);
        console.error('📋 Response completo:', response);
        
        // Mostrar el error específico del servidor
        throw new Error(`Error del servidor (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();

      
      // Verificar que se recibió la URL de checkout
      if (data.checkoutUrl && data.checkoutUrl.trim() !== '') {
        // Redirigir a Mercado Pago

        toast.success('Redirigiendo a Mercado Pago...', { duration: 1000 });
        
        // Pequeño delay para que el usuario vea el mensaje
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 500);
      } else {
        console.error('❌ No se recibió checkoutUrl');
        console.error('📦 Respuesta completa:', data);
        throw new Error('No se recibió la URL de pago del servidor');
      }
    } catch (err: any) {
      console.error('❌ Error al iniciar pago con Mercado Pago:', err);
      console.error('📋 Error completo:', err);
      
      // Mensaje de error más específico
      let errorMessage = 'No se pudo iniciar el pago con Mercado Pago.';
      let errorDetail = '';
      
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        errorMessage = '⚠️ No se pudo conectar con el servidor de pagos';
        errorDetail = 'Posibles causas:\n' +
          '1. El backend PHP no está accesible en litfitmexico.com\n' +
          '2. CORS está bloqueando la petición\n' +
          '3. Tu bloqueador de anuncios está bloqueando la conexión\n\n' +
          '💡 Prueba desactivando tu bloqueador de anuncios (uBlock, AdBlock, etc.) temporalmente.';
        
        console.error('💡 SOLUCIÓN:');
        console.error('1. Verifica que los archivos PHP estén subidos a cPanel');
        console.error('2. Desactiva bloqueadores de anuncios (uBlock Origin, AdBlock, etc.)');
        console.error('3. Revisa la consola de errores en cPanel');
        console.error('📚 Lee: GUIA-RAPIDA-MERCADOPAGO.md');
      } else if (err.message.includes('Error del servidor')) {
        errorMessage = 'El servidor de pagos encontró un error';
        errorDetail = err.message;
      } else if (err.message.includes('No se recibió la URL')) {
        errorMessage = 'Error al generar la preferencia de pago';
        errorDetail = 'El servidor no devolvió una URL válida. Verifica las credenciales de Mercado Pago en el backend.';
      } else {
        errorDetail = err.message;
      }
      
      // Mostrar error en consola con formato claro
      console.group('🔴 ERROR DE MERCADO PAGO');
      console.error('Mensaje:', errorMessage);
      console.error('Detalle:', errorDetail);
      console.error('Error original:', err);
      console.groupEnd();
      
      // Toast con el error
      toast.error(errorMessage + (errorDetail ? '\n\nRevisa la consola para más detalles.' : ''), {
        duration: 5000,
      });
      
      // Alert solo si es error de conexión
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        alert(
          '⚠️ ERROR DE CONEXIÓN\n\n' +
          errorMessage + '\n\n' +
          errorDetail +
          '\n\n📊 Revisa la consola del navegador (F12) para más información.'
        );
      }
      
      // Limpiar datos guardados en caso de error
      const lastOrderId = localStorage.getItem('litfit_last_order_id');
      if (lastOrderId) {
        localStorage.removeItem(`litfit_pending_order_${lastOrderId}`);
        localStorage.removeItem('litfit_last_order_id');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-[#00AAC7] hover:bg-[#00d4ff] transition-colors py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-black font-black">
        {loading ? 'Conectando con Mercado Pago...' : 'Pagar con Mercado Pago'}
      </span>
    </button>
  );
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mercadopago' | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [formData, setFormData] = useState({
    // Información personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Dirección de envío
    street: '',
    colonia: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    // Notas
    notes: '',
  });

  // Calcular costo de envío
  const isFreeTestOrder = items.some(item => item.id === 'test-pago-real') || totalPrice < 30;
  const shippingCost = isFreeTestOrder ? 0 : (selectedShippingOption?.price || 0);
  const total = totalPrice + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // 🔧 Handler adicional para capturar autocompletado del navegador
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Forzar actualización del estado cuando el campo pierde el foco
    // Esto captura valores autocompletados que onChange podría haber perdido
    if (e.target.value !== formData[e.target.name as keyof typeof formData]) {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado una opción de envío
    if (!selectedShippingOption || selectedShippingOption.price === undefined) {
      toast.error('Por favor espera a que se calculen las opciones de envío o verifica tu código postal');
      return;
    }
    
    setStep('payment');
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-gray-100 p-12 rounded-full inline-block mb-6">
            <CreditCard className="w-24 h-24 text-gray-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-8">
            Agrega productos antes de proceder al checkout
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-black text-white font-black tracking-wide hover:bg-gray-900 transition-colors"
          >
            VOLVER A LA TIENDA
          </a>
        </div>
      </div>
    );
  }

  if (step === 'success') {
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
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 mb-2">
            Gracias por tu compra. Recibirás un correo de confirmación con los detalles de tu pedido.
          </p>
          <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest font-black">
            LITFIT TEAM
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-black text-white font-black tracking-wide hover:bg-gray-900 transition-colors"
          >
            VOLVER AL INICIO
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-black text-white py-6 sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-black tracking-tight">LITFIT</span>
            </a>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00AAC7]" />
              <span className="text-sm font-medium">Compra Segura</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Forms */}
          <div>
            {/* Progress Steps */}
            <div className="mb-8 flex items-center gap-4">
              <div className={`flex items-center gap-3 ${step === 'info' ? 'text-[#00AAC7]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step === 'info' ? 'bg-[#00AAC7] text-black' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="font-black text-sm">INFORMACIÓN</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200" />
              <div className={`flex items-center gap-3 ${step === 'payment' ? 'text-[#00AAC7]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step === 'payment' ? 'bg-[#00AAC7] text-black' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="font-black text-sm">PAGO</span>
              </div>
            </div>

            {/* Step 1: Information Form */}
            {step === 'info' && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmitInfo}
                className="space-y-8"
                autoComplete="off"
              >
                {/* Personal Info */}
                <div className="bg-white p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-[#00AAC7]" />
                    <h2 className="text-xl font-black text-gray-900">Información Personal</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          autoComplete="off"
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          autoComplete="off"
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-[#00AAC7]" />
                    <h2 className="text-xl font-black text-gray-900">Dirección de Envío</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        Calle y número *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        Colonia *
                      </label>
                      <input
                        type="text"
                        name="colonia"
                        value={formData.colonia}
                        onChange={handleInputChange}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          autoComplete="off"
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-2">
                          Estado *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          autoComplete="off"
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        autoComplete="off"
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        Notas de entrega (opcional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all resize-none"
                        placeholder="Ej: Tocar timbre, departamento 301..."
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Quote - Cotización dinámica desde la API */}
                <ShippingQuote
                  formData={formData}
                  onSelectShipping={setSelectedShippingOption}
                  selectedOption={selectedShippingOption}
                  subtotal={totalPrice}
                  isFree={isFreeTestOrder}
                />

                <button
                  type="submit"
                  className="w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] transition-transform duration-300 group-hover:scale-105" />
                  <div className="relative px-8 py-4 flex items-center justify-center gap-3">
                    <Truck className="w-5 h-5 text-black" />
                    <span className="text-black font-black tracking-wide uppercase">
                      Continuar al Pago
                    </span>
                  </div>
                </button>
              </motion.form>
            )}

            {/* Step 2: Payment */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button
                  onClick={() => setStep('info')}
                  className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-black text-sm">Volver</span>
                </button>

                <div className="bg-white p-6 border border-gray-200 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-[#00AAC7]" />
                    <h2 className="text-xl font-black text-gray-900">Método de Pago</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Mercado Pago */}
                    <div 
                      className={`p-6 border-2 transition-colors cursor-pointer ${
                        selectedPaymentMethod === 'mercadopago' 
                          ? 'border-[#00AAC7] bg-[#00AAC7]/5' 
                          : 'border-gray-300 hover:border-[#00AAC7]/50'
                      }`}
                      onClick={() => setSelectedPaymentMethod('mercadopago')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" 
                            alt="Mercado Pago" 
                            className="h-8 w-8"
                          />
                          <span className="font-black text-gray-900">Mercado Pago</span>
                        </div>
                        <div className="bg-green-500 px-3 py-1">
                          <span className="text-white text-xs font-black">DISPONIBLE</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Paga con tarjeta de crédito, débito, efectivo o transferencia. La forma más segura de pagar en México.
                      </p>
                      
                      {/* Mostrar botón de Mercado Pago cuando está seleccionado */}
                      {selectedPaymentMethod === 'mercadopago' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <MercadoPagoButton 
                            items={items}
                            totalPrice={totalPrice}
                            shippingCost={shippingCost}
                            total={total}
                            formData={formData}
                            selectedShippingOption={selectedShippingOption}
                          />
                        </div>
                      )}
                    </div>

                    </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#00AAC7]" />
                RESUMEN DEL PEDIDO
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-gray-600">Sabor: {item.variant}</p>
                      )}
                      {item.size && (
                        <p className="text-xs text-gray-600">Tamaño: {item.size}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-black text-gray-900">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-black text-gray-900">${shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl pt-3 border-t-2 border-gray-300">
                  <span className="font-black text-gray-900">Total:</span>
                  <span className="font-black text-[#00AAC7]">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-[#00AAC7]" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-[#00AAC7]" />
                  <span>Envío a toda la república</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#00AAC7]" />
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
