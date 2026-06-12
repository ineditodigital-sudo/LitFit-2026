import { useState, useEffect } from "react";
import { Save, Loader2, Gift, Search } from "lucide-react";

interface PromoGiftManagerProps {
  adminToken: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  variant?: string;
  size?: string;
}

export function PromoGiftManager({ adminToken }: PromoGiftManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState("1000");
  const [productId, setProductId] = useState("");

  useEffect(() => {
    Promise.all([fetchSettings(), fetchProducts()]).finally(() => setLoading(false));
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`);
      const data = await response.json();
      if (data.promo_gift_enabled !== undefined) {
        setEnabled(data.promo_gift_enabled === '1');
      }
      if (data.promo_gift_threshold) {
        setThreshold(data.promo_gift_threshold);
      }
      if (data.promo_gift_product_id) {
        setProductId(data.promo_gift_product_id);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSave = async () => {
    if (enabled && !productId) {
      setMessage({ type: 'error', text: 'Debes seleccionar un producto para regalar si la promoción está activa.' });
      return;
    }
    
    if (enabled && (!threshold || isNaN(Number(threshold)) || Number(threshold) <= 0)) {
      setMessage({ type: 'error', text: 'El monto mínimo debe ser un número mayor a 0.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('https://litfitmexico.com/envios/api-settings.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          promo_gift_enabled: enabled ? '1' : '0',
          promo_gift_threshold: threshold,
          promo_gift_product_id: productId
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Configuración de promoción guardada correctamente.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al guardar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = products.find(p => p.id === productId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00AAC7]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#00AAC7]/10 text-[#00AAC7] rounded-2xl flex items-center justify-center">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Promoción Regalo</h2>
          <p className="text-gray-500 font-medium mt-1">Configura el producto gratis por monto mínimo de compra</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <p className="font-bold text-sm">{message.text}</p>
          </div>
        )}

        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900">Estado de la Promoción</h3>
              <p className="text-sm text-gray-500">Activa o desactiva la barra de progreso en el carrito</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00AAC7]"></div>
            </label>
          </div>

          <div className={!enabled ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
            <div className="space-y-4 mb-8">
              <label className="block font-bold text-gray-700">Monto Mínimo de Compra (MXN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00AAC7] focus:border-transparent outline-none font-medium"
                  placeholder="Ej. 1000"
                />
              </div>
              <p className="text-xs text-gray-500">El subtotal del carrito debe alcanzar este monto para desbloquear el regalo.</p>
            </div>

            <div className="space-y-4">
              <label className="block font-bold text-gray-700">Producto de Regalo</label>
              
              {selectedProduct ? (
                <div className="flex items-center gap-4 p-4 border border-[#00AAC7] rounded-xl bg-[#00AAC7]/5">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded-lg bg-white border border-gray-200" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{selectedProduct.name}</h4>
                    {selectedProduct.variant && <p className="text-xs text-gray-600">Sabor: {selectedProduct.variant}</p>}
                    <p className="text-xs font-bold text-[#00AAC7]">ID: {selectedProduct.id}</p>
                  </div>
                  <button 
                    onClick={() => setProductId("")}
                    className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar producto por nombre o ID..." 
                      className="bg-transparent border-none outline-none w-full text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => setProductId(product.id)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                      >
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded bg-white border border-gray-200" />
                        <div>
                          <p className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</p>
                          {product.variant && <p className="text-xs text-gray-500">{product.variant}</p>}
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="text-center text-gray-500 text-sm py-4">No se encontraron productos.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#00AAC7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0095ae] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
