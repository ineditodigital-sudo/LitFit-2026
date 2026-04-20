import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestEnvio() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    colonia: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState('proteina-iso');
  const [quantity, setQuantity] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const productos = {
    'proteina-iso': {
      name: 'Proteína ISO',
      price: 899,
      variant: 'Chocolate',
      size: '1kg',
      sku: 'LITFIT-ISO-CHOC'
    },
    'proteina-colageno': {
      name: 'Proteína ISO + Colágeno',
      price: 999,
      variant: 'Vainilla',
      size: '1kg',
      sku: 'LITFIT-ISOCOL-VAN'
    },
    'barras': {
      name: 'Barras de Proteína',
      price: 45,
      variant: 'Chocolate',
      size: 'Caja 12 unidades',
      sku: 'LITFIT-BAR-CHOC'
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const testEnvio = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);

    try {
      addLog('🚀 Iniciando prueba de creación de envío...');

      // Validar datos
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'colonia', 'city', 'state', 'zipCode'];
      const missing = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missing.length > 0) {
        addLog(`❌ Faltan campos requeridos: ${missing.join(', ')}`);
        setLoading(false);
        return;
      }

      addLog('✅ Todos los campos están completos');

      // Preparar datos del producto
      const product = productos[selectedProduct as keyof typeof productos];
      const items = [{
        name: product.name,
        variant: product.variant,
        size: product.size,
        sku: product.sku,
        price: product.price,
        quantity: quantity
      }];

      const totalPrice = product.price * quantity;
      const shippingCost = totalPrice >= 1000 ? 0 : 150;
      const total = totalPrice + shippingCost;

      addLog(`📦 Producto: ${product.name} - ${product.variant} (${product.size})`);
      addLog(`💰 Subtotal: $${totalPrice.toLocaleString()}`);
      addLog(`🚚 Envío: $${shippingCost}`);
      addLog(`💵 Total: $${total.toLocaleString()}`);

      // Generar ID de orden de prueba
      const orderId = 'TEST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      addLog(`🔑 ID de Orden: ${orderId}`);

      // Preparar datos para enviar
      const dataToSend = {
        orderId: orderId,
        items: items,
        formData: formData,
        total: total,
        shippingCost: shippingCost,
        totalPrice: totalPrice,
        paymentMethod: 'TEST - Simulación'
      };

      addLog('📤 Datos preparados:');
      addLog(JSON.stringify(dataToSend, null, 2));

      addLog('🌐 Enviando a: https://litfitmexico.com/envios/crear-orden.php');

      // Llamar al endpoint
      const response = await fetch('https://litfitmexico.com/envios/crear-orden.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      addLog(`📥 Respuesta del servidor: HTTP ${response.status}`);

      const responseData = await response.json();
      
      addLog('📦 Respuesta completa:');
      addLog(JSON.stringify(responseData, null, 2));

      setResult(responseData);

      if (responseData.success) {
        if (responseData.method === 'api') {
          addLog('✅ ¡ÉXITO! Envío creado en la API de Envíos Internacionales');
          if (responseData.trackingNumber) {
            addLog(`📮 Número de rastreo: ${responseData.trackingNumber}`);
          }
          if (responseData.shipmentId) {
            addLog(`🆔 ID del envío: ${responseData.shipmentId}`);
          }
        } else if (responseData.method === 'email_fallback') {
          addLog('⚠️ La API no respondió, se envió email de fallback');
          addLog('📧 Revisa tu correo: ricoro845@gmail.com');
        }
      } else {
        addLog('❌ Error: ' + (responseData.message || 'Error desconocido'));
      }

    } catch (error: any) {
      addLog('❌ Error en la prueba: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00AAC7] rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Prueba de Envíos
          </h1>
          <p className="text-gray-600">
            Simula un pedido completo sin pagar para probar la integración con Envíos Internacionales
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-black mb-4">📝 Datos del Cliente</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                    placeholder="Ricardo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                    placeholder="Corona"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                  placeholder="ricoro845@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                  placeholder="8112345678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Calle y número</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                  placeholder="Av. Constitución 123"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Colonia</label>
                <input
                  type="text"
                  name="colonia"
                  value={formData.colonia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                  placeholder="Centro"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                    placeholder="Monterrey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Estado</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                    placeholder="Nuevo León"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Código Postal</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                  placeholder="64000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Notas (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                  placeholder="Casa azul con portón blanco"
                  rows={2}
                />
              </div>

              <hr className="my-4" />

              <h3 className="text-lg font-black mb-3">📦 Producto de Prueba</h3>

              <div>
                <label className="block text-sm font-bold mb-1">Producto</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                >
                  <option value="proteina-iso">Proteína ISO - Chocolate ($899)</option>
                  <option value="proteina-colageno">Proteína ISO + Colágeno - Vainilla ($999)</option>
                  <option value="barras">Barras de Proteína - Caja 12 uds ($45)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00AAC7]"
                />
              </div>

              <button
                onClick={testEnvio}
                disabled={loading}
                className="w-full py-3 bg-[#00AAC7] text-white font-black tracking-wide hover:bg-[#008fb0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Probando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    PROBAR ENVÍO
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 text-white font-mono text-sm">
            <h2 className="text-xl font-black mb-4 text-[#00AAC7]">📊 Logs en Tiempo Real</h2>
            
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Esperando prueba...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-xs leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>

            {result && (
              <div className="mt-6 p-4 bg-gray-800 rounded border-2 border-[#00AAC7]">
                {result.success ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-bold">¡Prueba Exitosa!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-6 h-6" />
                    <span className="font-bold">Error en la prueba</span>
                  </div>
                )}
                
                {result.method === 'api' && result.trackingNumber && (
                  <div className="mt-2 text-xs">
                    <p className="text-gray-400">Tracking:</p>
                    <p className="text-[#00AAC7] font-bold">{result.trackingNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-black mb-2 text-blue-900">ℹ️ Instrucciones</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Completa todos los campos del formulario con tus datos reales</li>
            <li>• Selecciona un producto y cantidad</li>
            <li>• Haz clic en "PROBAR ENVÍO"</li>
            <li>• Revisa los logs en tiempo real para ver qué sucede</li>
            <li>• Si es exitoso, verás el número de rastreo y el envío aparecerá en enviosinternacionales.com</li>
            <li>• Si falla, revisa el mensaje de error en los logs</li>
          </ul>
        </div>

        {/* Botón volver */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 border-2 border-gray-300 text-gray-900 font-black tracking-wide hover:border-[#00AAC7] transition-colors"
          >
            ← VOLVER AL INICIO
          </a>
        </div>
      </div>
    </div>
  );
}
