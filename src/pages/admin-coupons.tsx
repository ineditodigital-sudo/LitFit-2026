import { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_purchase: number;
  valid_from: string | null;
  valid_until: string | null;
  allow_shaker: boolean;
  is_active: boolean;
  created_at?: string;
}

interface AdminCouponsProps {
  adminToken: string;
}

export function AdminCoupons({ adminToken }: AdminCouponsProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    type: 'percent',
    value: 10,
    min_purchase: 0,
    valid_from: '',
    valid_until: '',
    allow_shaker: true,
    is_active: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`https://litfitmexico.com/envios/api-coupons.php`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoupons(data);
      } else {
        toast.error("Error al cargar cupones");
      }
    } catch (err) {
      toast.error("Error de conexión al cargar cupones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchPromoGift();
  }, [adminToken]);

  const [promoGift, setPromoGift] = useState<{ enabled: boolean, name: string } | null>(null);

  const fetchPromoGift = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        fetch(`https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`),
        fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`)
      ]);
      const settings = await settingsRes.json();
      const productsData = await productsRes.json();
      
      if (settings.promo_gift_enabled === '1' && settings.promo_gift_product_id) {
        const productList = Array.isArray(productsData) ? productsData : (productsData.products || []);
        const product = productList.find((p: any) => p.id === settings.promo_gift_product_id);
        if (product) {
          setPromoGift({ enabled: true, name: product.name });
        }
      }
    } catch (err) {
      console.error("Error fetching promo gift settings");
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_purchase: coupon.min_purchase,
        valid_from: coupon.valid_from ? coupon.valid_from.replace(' ', 'T').slice(0, 16) : '',
        valid_until: coupon.valid_until ? coupon.valid_until.replace(' ', 'T').slice(0, 16) : '',
        allow_shaker: Boolean(coupon.allow_shaker),
        is_active: Boolean(coupon.is_active)
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '', type: 'percent', value: 10, min_purchase: 0,
        valid_from: '', valid_until: '', allow_shaker: true, is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        id: editingId,
        valid_from: formData.valid_from ? formData.valid_from.replace('T', ' ') + ':00' : null,
        valid_until: formData.valid_until ? formData.valid_until.replace('T', ' ') + ':00' : null,
        allow_shaker: formData.allow_shaker ? 1 : 0,
        is_active: formData.is_active ? 1 : 0
      };

      const res = await fetch(`https://litfitmexico.com/envios/api-coupons.php`, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(editingId ? "Cupón actualizado" : "Cupón creado");
        setShowModal(false);
        fetchCoupons();
      } else {
        toast.error(data.message || "Error al guardar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cupón?")) return;
    try {
      const res = await fetch(`https://litfitmexico.com/envios/api-coupons.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cupón eliminado");
        fetchCoupons();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Siempre';
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cupones y Promociones</h2>
          <p className="text-sm text-slate-500">Gestiona los códigos de descuento para tus clientes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#1E293B] transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Crear Cupón
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                  <th className="p-4">Código</th>
                  <th className="p-4">Descuento</th>
                  <th className="p-4">Condiciones</th>
                  <th className="p-4">Vigencia</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#00AAC7]" />
                        <span className="font-bold text-slate-800 tracking-wide uppercase">{coupon.code}</span>
                      </div>
                      {!coupon.allow_shaker && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                          Excluye Shaker
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {coupon.type === 'percent' ? `${coupon.value}% OFF` : `$${coupon.value} MXN`}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {coupon.min_purchase > 0 ? `Min. $${coupon.min_purchase}` : 'Sin mínimo'}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {coupon.valid_from || coupon.valid_until ? (
                        <div className="space-y-1">
                          {coupon.valid_from && <div>Desde: {formatDate(coupon.valid_from)}</div>}
                          {coupon.valid_until && <div>Hasta: {formatDate(coupon.valid_until)}</div>}
                        </div>
                      ) : (
                        'Permanente'
                      )}
                    </td>
                    <td className="p-4">
                      {coupon.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <AlertCircle className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(coupon)} className="p-2 text-slate-400 hover:text-[#00AAC7] transition-colors rounded-lg hover:bg-slate-100">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No hay cupones creados. ¡Crea el primero!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#00AAC7]" />
                {editingId ? "Editar Cupón" : "Nuevo Cupón"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Código del Cupón</label>
                <input
                  type="text"
                  required
                  placeholder="ej. VERANO20"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 uppercase font-bold focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 transition-all outline-none"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Descuento</label>
                  <select
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#00AAC7] outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor</label>
                  <input
                    type="number"
                    min="1"
                    step={formData.type === 'percent' ? '1' : '0.01'}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#00AAC7] outline-none"
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Compra mínima ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0 para sin mínimo"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#00AAC7] outline-none"
                  value={formData.min_purchase}
                  onChange={e => setFormData({...formData, min_purchase: parseFloat(e.target.value)})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Válido Desde (Opcional)</label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#00AAC7] outline-none text-sm"
                    value={formData.valid_from || ''}
                    onChange={e => setFormData({...formData, valid_from: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Válido Hasta (Opcional)</label>
                  <input
                    type="datetime-local"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#00AAC7] outline-none text-sm"
                    value={formData.valid_until || ''}
                    onChange={e => setFormData({...formData, valid_until: e.target.value})}
                  />
                </div>
              </div>

              {promoGift?.enabled && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-[#00AAC7] rounded border-gray-300"
                      checked={formData.allow_shaker}
                      onChange={e => setFormData({...formData, allow_shaker: e.target.checked})}
                    />
                    <div>
                      <span className="block text-sm font-bold text-amber-900">Combinable con "{promoGift.name}" (Regalo)</span>
                      <span className="block text-xs text-amber-700 mt-0.5">Si se desmarca, al aplicar este cupón se eliminará automáticamente el regalo promocional del carrito del usuario.</span>
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#00AAC7] rounded border-gray-300"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-slate-700">Cupón Activo (Encendido)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-[#1E293B] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Actualizar" : "Crear Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
