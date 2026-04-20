import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TestMercadoPagoData() {
  const [data, setData] = useState<any>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Buscar el último ID de pedido
    const lastOrderId = localStorage.getItem('litfit_last_order_id');
    
    if (lastOrderId) {
      setHasData(true);
      const orderDataStr = localStorage.getItem(`litfit_pending_order_${lastOrderId}`);
      
      if (orderDataStr) {
        try {
          const orderData = JSON.parse(orderDataStr);
          setData({ ...orderData, _lastOrderId: lastOrderId });
        } catch (error) {
          setData({ error: 'Error al parsear JSON', raw: orderDataStr, _lastOrderId: lastOrderId });
        }
      } else {
        setData({ error: 'ID encontrado pero sin datos', _lastOrderId: lastOrderId });
      }
    } else {
      setHasData(false);
    }
  }, []);

  const clearData = () => {
    const lastOrderId = localStorage.getItem('litfit_last_order_id');
    if (lastOrderId) {
      localStorage.removeItem(`litfit_pending_order_${lastOrderId}`);
    }
    localStorage.removeItem('litfit_last_order_id');
    localStorage.removeItem('litfit_pending_order'); // Por si existe el viejo formato
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </a>

        <h1 className="text-3xl font-black mb-6">
          🔍 TEST: Datos de Mercado Pago en localStorage
        </h1>

        {!hasData && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg">
            <h2 className="text-xl font-black mb-2">❌ No hay datos guardados</h2>
            <p className="text-gray-700">
              No se encontró ningún pedido pendiente en localStorage.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Para probar:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>Ve al checkout</li>
              <li>Llena el formulario</li>
              <li>Click en "Pagar con Mercado Pago"</li>
              <li>ANTES de pagar, vuelve a esta página</li>
            </ol>
          </div>
        )}

        {hasData && data && (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
              <h2 className="text-xl font-black mb-2">✅ Datos encontrados</h2>
              <p className="text-gray-700">
                Se encontraron datos de un pedido pendiente.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <h3 className="font-black mb-4">📦 Datos del pedido:</h3>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <h3 className="font-black mb-4">📊 Resumen:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Items:</strong> {data.items?.length || 0}</p>
                <p><strong>Cliente:</strong> {data.formData?.firstName} {data.formData?.lastName}</p>
                <p><strong>Email:</strong> {data.formData?.email}</p>
                <p><strong>Total:</strong> ${data.total?.toLocaleString()}</p>
                <p><strong>Timestamp:</strong> {data.timestamp}</p>
              </div>
            </div>

            <button
              onClick={clearData}
              className="w-full bg-red-500 text-white font-black py-4 px-6 rounded-lg hover:bg-red-600 transition-colors"
            >
              🗑️ LIMPIAR DATOS Y RECARGAR
            </button>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
          <h3 className="font-black mb-2">ℹ️ Información</h3>
          <p className="text-sm text-gray-700">
            Esta página muestra los datos que se guardan en localStorage antes de redirigir a Mercado Pago.
            Si no ves datos aquí después de hacer click en el botón de Mercado Pago, significa que el problema
            está en el guardado de datos.
          </p>
        </div>
      </div>
    </div>
  );
}
