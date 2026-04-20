import React, { useState, useEffect } from "react";
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
      const response = await fetch("https://litfitmexico.com/envios/get-orders.php", { headers: { "Authorization": `Bearer ${adminToken}` } });
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

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(query) ||
      o.formData.firstName.toLowerCase().includes(query) ||
      o.formData.lastName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tighter">Registro de Pedidos</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Vigilando toda la actividad de la tienda</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-[#00AAC7] outline-none transition-all"
          />
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
                      <div className="flex items-center gap-2">
                        {order.status === 'SHIPPED' ? (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">ENVIADO</span>
                        ) : order.status === 'CANCELLED' ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">CANCELADO</span>
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-black uppercase tracking-tighter">Detalles de Orden</h2>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px] md:max-w-none">{selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center">
                  <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto grow space-y-8 md:space-y-10">
                {/* User & Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#00AAC7]">
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cliente</span>
                    </div>
                    <div>
                      <p className="font-black text-base md:text-lg text-black uppercase leading-tight">{selectedOrder.formData.firstName} {selectedOrder.formData.lastName}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-500">
                          <Mail className="w-3 h-3 md:w-3.5 md:h-3.5" /> {selectedOrder.formData.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-500">
                          <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" /> {selectedOrder.formData.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#00AAC7]">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dirección</span>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-black uppercase">{selectedOrder.formData.street}</p>
                      <p className="text-[10px] md:text-[11px] font-medium text-gray-500 leading-relaxed uppercase">Col. {selectedOrder.formData.colonia}, {selectedOrder.formData.city}</p>
                      <p className="text-[10px] md:text-[11px] font-medium text-gray-500 leading-relaxed uppercase">{selectedOrder.formData.state}, México CP {selectedOrder.formData.zipCode}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                      <span>Resumen</span>
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs font-bold text-gray-500">Subtotal:</span>
                      <span className="text-xs md:text-sm font-black text-black">${selectedOrder.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs font-bold text-gray-500">Envío:</span>
                      <span className="text-xs md:text-sm font-black text-green-500">{selectedOrder.shippingCost === 0 ? "GRATIS" : `$${selectedOrder.shippingCost}`}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs font-black text-black uppercase">TOTAL:</span>
                      <span className="text-lg md:text-xl font-black text-black">${selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Estado (NUEVO) */}
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex flex-col md:flex-row gap-6 items-end">
                   <div className="flex-1 w-full space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Información de Envío</span>
                      <div className="flex gap-2">
                        <select 
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="h-12 bg-white border-2 border-slate-200 rounded-xl px-3 text-xs font-bold outline-none focus:border-[#00AAC7]"
                        >
                          <option value="Estafeta">Estafeta</option>
                          <option value="FedEx">FedEx</option>
                          <option value="DHL">DHL</option>
                          <option value="RedPack">RedPack</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Número de guía / rastreo"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="flex-1 h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#00AAC7]"
                        />
                      </div>
                   </div>
                   <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.orderId, 'CANCELLED')}
                        disabled={isUpdating || selectedOrder.status === 'CANCELLED'}
                        className="flex-1 md:flex-none h-12 px-6 bg-red-100 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-200 disabled:opacity-50 transition-all"
                      >
                         Cancelar Pedido
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.orderId, 'SHIPPED', { number: trackingNumber, carrier })}
                        disabled={isUpdating || !trackingNumber || selectedOrder.status === 'SHIPPED'}
                        className="flex-1 md:flex-none h-12 px-8 bg-[#00AAC7] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00d4ff] disabled:opacity-50 transition-all"
                      >
                         {selectedOrder.status === 'SHIPPED' ? "Enviado ✅" : "Confirmar Envío"}
                      </button>
                   </div>
                </div>

                {/* Products */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] border-b border-gray-100 pb-3 flex items-center justify-between">
                    Productos Seleccionados
                    <span className="bg-black text-white px-2 py-0.5 rounded-full text-[9px]">{selectedOrder.items.length} UNIDS</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                            <img src={item.image} alt="" className="w-full h-full object-cover grayscale" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-black uppercase">{item.name}</p>
                            <p className="text-[10px] font-black text-[#00AAC7] uppercase tracking-widest">{item.variant || 'Regular'} {item.size ? `- ${item.size}` : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-black">${(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.quantity} x ${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.formData.notes && (
                  <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 space-y-2">
                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Notas del Cliente</span>
                    <p className="text-xs font-bold text-orange-950/80">{selectedOrder.formData.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="p-8 bg-gray-50 shrink-0">
                <button onClick={() => setSelectedOrder(null)} className="w-full h-14 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#00AAC7] transition-all">
                  Cerrar Detalles
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
