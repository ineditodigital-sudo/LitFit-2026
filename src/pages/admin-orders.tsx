import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Eye, ShoppingBag, Clock, User, CreditCard, ChevronRight, X, Phone, Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";


interface Order {
  orderId: string;
  timestamp: string;
  total: number;
  totalPrice: number;
  shippingCost: number;
  paymentMethod?: string;
  status?: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    colonia: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
  };
  items: any[];
}

export function AdminOrders({ adminToken }: { adminToken: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("Estafeta");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://litfitmexico.com/envios/get-orders.php", { headers: { "Authorization": `Bearer ${adminToken}`, "X-Admin-Token": adminToken } });
      if (!response.ok) throw new Error("Server not found");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.warn("⚠️ No se pudieron cargar pedidos del servidor (PHP no detectado)");
      toast.error("Servidor de pedidos no detectado. ¿Has subido los archivos PHP?");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingInfo?: { number: string, carrier: string }) => {
    setIsUpdating(true);
    try {
      const response = await fetch("https://litfitmexico.com/envios/update-order-status.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ 
          orderId, 
          status,
          trackingNumber: trackingInfo?.number,
          carrier: trackingInfo?.carrier
        })
      });

      if (!response.ok) throw new Error("Error al actualizar");
      
      toast.success(status === 'CANCELLED' ? "Pedido Cancelado" : "Pedido Actualizado");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

    const [filterMissingLabels, setFilterMissingLabels] = useState(false);
  const [isRecoveringMp, setIsRecoveringMp] = useState(false);

  const [isRegenerating, setIsRegenerating] = useState(false);

  const regenerateLabel = async (orderId: string) => {
    setIsRegenerating(true);
    try {
      const response = await fetch('https://litfitmexico.com/envios/regenerate-label.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`, 'X-Admin-Token': adminToken 
        },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedOrder(data.order);
        fetchOrders();
      } else {
        toast.error(data.message || 'Error al despertar envío');
      }
    } catch (e) {
      toast.error('Error de conexión con el servidor.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const recoverPaymentMp = async (paymentId: string) => {
    setIsRecoveringMp(true);
    try {
      const response = await fetch(`https://litfitmexico.com/mercadopago/recover-mp.php?payment_id=${paymentId}`, {
        headers: { "Authorization": `Bearer ${adminToken}`, "X-Admin-Token": adminToken }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Pedido recuperado correctamente");
        fetchOrders();
        setSelectedOrder(data.order);
        setSearchQuery("");
      } else {
        toast.error(data.message || "No se encontró el cobro en Mercado Pago");
      }
    } catch (err) {
      toast.error("Error al conectar con la API de recuperación");
    } finally {
      setIsRecoveringMp(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterMissingLabels) {
      if (o.status !== 'PAID' || o.trackingNumber) return false;
    }
    const query = searchQuery.toLowerCase();
    return JSON.stringify(o).toLowerCase().includes(query);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tighter">Registro de Pedidos</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Vigilando toda la actividad de la tienda</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Buscar o # MP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-[#00AAC7] outline-none transition-all"
            />
            {/^\d{9,15}$/.test(searchQuery) && (
              <button
                onClick={() => recoverPaymentMp(searchQuery)}
                disabled={isRecoveringMp}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00AAC7] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl hover:bg-black transition-colors"
              >
                {isRecoveringMp ? "Buscando..." : "Bajar Cobro MP"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center md:text-left">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Estado</th>
                <th className="px-4 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Pago</th>
                <th className="px-4 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center font-bold text-gray-400 uppercase tracking-widest">Cargando historial...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center font-bold text-gray-400 uppercase tracking-widest">No se encontraron pedidos</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 md:px-8 py-5">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-[8px] md:text-[10px]">L</div>
                        <span className="text-[10px] md:text-xs font-black text-black leading-none truncate max-w-[60px] md:max-w-[120px]">{order.orderId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-black uppercase tracking-tight">{order.formData.firstName} {order.formData.lastName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{order.formData.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 hidden lg:table-cell">
                      <div className="flex flex-col items-start gap-1">
                        {order.status === 'SHIPPED' ? (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">ENVIADO</span>
                        ) : order.status === 'CANCELLED' ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">CANCELADO</span>
                        ) : order.status === 'PENDING' ? (
                          <>
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">PENDIENTE</span>
                            <span className="text-[9px] text-gray-400 font-bold max-w-[140px] leading-tight mt-1">Intento sin éxito o pago en OXXO pendiente</span>
                          </>
                        ) : (
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">PAGADO</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-5">
                      <span className="text-xs md:text-sm font-black text-black">${(order.total || order.totalPrice).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-50">
                          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.paymentMethod || 'MP'}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingNumber("");
                        }}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-50 border border-transparent hover:border-[#00AAC7] hover:text-[#00AAC7] transition-all flex items-center justify-center group/btn ml-auto"
                      >
                        <Eye className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal (Portalized to body) */}
      {selectedOrder && typeof document !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 md:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}>
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedOrder(null)} 
              className="absolute inset-0 bg-black/70 backdrop-blur-md" 
            />
            <motion.div 
              key="modal-card"
              initial={{ y: 20, opacity: 0, scale: 0.98 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 20, opacity: 0, scale: 0.98 }} 
              className="relative bg-white w-full max-w-5xl rounded-[32px] md:rounded-[48px] shadow-[0_0_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-auto max-h-[92vh] md:max-h-[85vh] z-[1000000] m-auto"
            >
              {/* HEADER */}
              <div className="p-5 md:p-8 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter">Detalles de Orden</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center group pointer-events-auto">
                  <X className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="p-5 md:p-8 overflow-y-auto grow space-y-6 md:space-y-8 custom-scrollbar">
                
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 md:p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[#00AAC7]">
                      <User className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Cliente</span>
                    </div>
                    <div>
                      <p className="font-black text-sm md:text-base text-black uppercase">{selectedOrder.formData.firstName} {selectedOrder.formData.lastName}</p>
                      <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-1">{selectedOrder.formData.email}</p>
                      <p className="text-[10px] md:text-xs font-bold text-gray-500">{selectedOrder.formData.phone}</p>
                    </div>
                  </div>

                  <div className="p-4 md:p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[#00AAC7]">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Envío</span>
                    </div>
                    <p className="text-[10px] md:text-xs font-black text-black uppercase leading-relaxed">
                      {selectedOrder.formData.street}<br/>
                      CP {selectedOrder.formData.zipCode}
                    </p>
                  </div>

                  <div className="p-4 md:p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[#00AAC7]">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Resumen</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xl md:text-2xl font-black text-black leading-none">${ (selectedOrder.total || selectedOrder.totalPrice).toLocaleString() }</span>
                       <span className="text-[9px] font-black text-[#00AAC7] uppercase mt-1">{selectedOrder.paymentMethod || 'MERCADO PAGO'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Control */}
                <div className="p-5 md:p-6 bg-[#00AAC7]/5 rounded-[32px] border-2 border-[#00AAC7]/10 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Paquetería</span>
                        <select 
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full h-11 bg-white border-2 border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#00AAC7] transition-all"
                        >
                          <option value="Estafeta">Estafeta</option>
                          <option value="FedEx">FedEx</option>
                          <option value="DHL">DHL</option>
                          <option value="RedPack">RedPack</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">ID de Seguimiento</span>
                        <input 
                          type="text" 
                          placeholder="Número de guía..."
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full h-11 bg-white border-2 border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#00AAC7] transition-all"
                        />
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 pt-2">
                      {(!selectedOrder.trackingNumber && selectedOrder.status === 'PAID') && (
                        <button 
                          onClick={() => regenerateLabel(selectedOrder.orderId)}
                          disabled={isRegenerating}
                          className="flex-1 min-w-[140px] h-11 bg-white border-2 border-orange-200 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                           {isRegenerating ? "Solicitando..." : "⚡ Re-generar Guía"}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.orderId, 'CANCELLED')}
                        disabled={isUpdating || selectedOrder.status === 'CANCELLED'}
                        className="flex-1 min-w-[120px] h-11 bg-red-100 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-200 disabled:opacity-50 transition-all"
                      >
                         Cancelar
                      </button>
                      
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.orderId, 'SHIPPED', { number: trackingNumber, carrier })}
                        disabled={isUpdating || !trackingNumber || selectedOrder.status === 'SHIPPED'}
                        className="flex-[2] min-w-[160px] h-11 bg-[#00AAC7] text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-30 transition-all shadow-lg shadow-[#00AAC7]/20"
                      >
                         {selectedOrder.status === 'SHIPPED' ? "Enviado con Éxito ✅" : "Confirmar y Finalizar Envío"}
                      </button>
                   </div>
                </div>

                {/* Products */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Resumen del Carrito</span>
                    <span className="bg-black text-white px-2 py-0.5 rounded-md text-[8px] font-black">{selectedOrder.items.length} ITEMS</span>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-black uppercase leading-tight">{item.name}</p>
                            <p className="text-[9px] font-bold text-[#00AAC7] uppercase">{item.variant || 'Standard'} {item.size ? `- ${item.size}` : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-black">${ (item.price * item.quantity).toLocaleString() }</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">{item.quantity} x ${ item.price.toLocaleString() }</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.formData.notes && (
                  <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">Notas:</p>
                    <p className="text-[10px] font-medium text-yellow-800 leading-relaxed">{selectedOrder.formData.notes}</p>
                  </div>
                )}
              </div>
              
              {/* FOOTER */}
              <div className="p-5 md:p-8 bg-white border-t border-gray-100 shrink-0">
                <button onClick={() => setSelectedOrder(null)} className="w-full h-12 bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#00AAC7] transition-all shadow-xl shadow-slate-200">
                  Cerrar Ventana
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
