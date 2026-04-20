import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Clock, Search, Download, Copy, Filter, Eye, MoreHorizontal,
  Navigation, Loader2, X, MapPin, Phone, MessageSquare, Weight, Maximize, ClipboardList, Zap
} from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface Order {
  uuid: string;
  id: string;
  date: Date;
  total: number;
  carrier: string;
  tracking: string;
  labelUrl: string | null;
  rawStatus: string;
  status: string;
  customerName: string;
  recipient: any;
  sender: any;
  package: any;
  zip: string;
}

function getStatusLabel(rawStatus: string): string {
  switch (rawStatus) {
    case "success": return "Entregado";
    case "cancelled":
    case "canceled": return "Cancelado";
    case "created": return "Creado";
    case "collected":
    case "picked_up": return "Recolectado";
    case "in_transit":
    case "on_the_way": return "En camino";
    case "near_destination":
    case "out_for_delivery": return "Por llegar";
    case "delivery_attempt": return "Intento de entrega";
    case "error": return "Error";
    default: return rawStatus ? rawStatus.replace(/_/g, ' ') : "Desconocido";
  }
}

function getStatusBadgeStyle(rawStatus: string): string {
  if (rawStatus === "created" || !rawStatus) return "bg-[#E0F2FE] text-[#0369A1]"; 
  if (rawStatus === "success") return "bg-[#DCFCE7] text-[#15803D]"; 
  if (rawStatus.includes("cancel")) return "bg-[#FEE2E2] text-[#B91C1C]"; 
  return "bg-[#E0F2FE] text-[#0369A1]"; 
}

export function AdminShipping({ adminToken }: { adminToken: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCarrier, setFilterCarrier] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://litfitmexico.com/envios/historial-publico.php", { headers: { "Authorization": `Bearer ${adminToken}` } });
      const result = await response.json();
      if (result && Array.isArray(result.data)) {
        const included = result.included || [];
        const transformed = result.data.map((item: any) => {
          const attr = item.attributes || {};
          const rels = item.relationships || {};
          
          const recipient = included.find((inc: any) => inc.type === "address" && inc.id === rels.address_to?.data?.id)?.attributes || {};
          const sender = included.find((inc: any) => inc.type === "address" && inc.id === rels.address_from?.data?.id)?.attributes || {};
          const pkg = included.find((inc: any) => inc.type === "package" && inc.id === rels.packages?.data?.[0]?.id)?.attributes || {};

          return {
            uuid: item.id,
            id: item.id.substring(0, 8),
            date: new Date(attr.created_at),
            total: parseFloat(attr.total || 0),
            carrier: (attr.carrier_name || "Paquetería").toUpperCase(),
            tracking: attr.master_tracking_number || "Asignando...",
            labelUrl: pkg.label_url || null,
            rawStatus: pkg.tracking_status || attr.workflow_status || "",
            status: getStatusLabel(pkg.tracking_status || attr.workflow_status || ""),
            customerName: recipient.name || recipient.person_name || "Cliente Final",
            zip: recipient.postal_code,
            recipient: {
               full_name: recipient.name || recipient.person_name,
               address: `${recipient.street1}${recipient.apartment_number ? ', '+recipient.apartment_number : ''}`,
               area: `${recipient.area_level3 || ''}, ${recipient.area_level2 || ''}, ${recipient.area_level1 || ''}`,
               zip: recipient.postal_code,
               phone: recipient.phone || "Sin teléfono",
               email: recipient.email || "Sin email",
               reference: recipient.reference || "Sin referencias"
            },
            sender: {
               name: sender.name || sender.company || "LITFIT",
               address: `${sender.street1}, ${sender.area_level2}, ${sender.area_level1}`,
               zip: sender.postal_code
            },
            package: {
               weight: pkg.weight,
               dimensions: `${pkg.length}x${pkg.width}x${pkg.height} cm`,
               description: pkg.consignment_note || "Sin descripción de productos"
            }
          };
        });
        setOrders(transformed.sort((a, b) => b.date.getTime() - a.date.getTime()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (orderId: string) => {
    const toastId = toast.loading("Generando guía en Envíos Internacionales...");
    try {
      const response = await fetch("https://litfitmexico.com/envios/reprocess-order.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message, { id: toastId });
        fetchOrders(); // Recargar lista
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch (e) {
      toast.error("Error de conexión con el servidor", { id: toastId });
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = o.customerName.toLowerCase().includes(query) || o.tracking.includes(query);
    const matchesCarrier = filterCarrier === "Todas" || o.carrier === filterCarrier;
    const matchesStatus = filterStatus === "Todos" || o.status === filterStatus;
    return matchesSearch && matchesCarrier && matchesStatus;
  });

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
         <div>
           <h1 className="text-lg md:text-xl font-bold text-[#0F172A]">Gestión de Envíos</h1>
           <p className="text-[10px] md:text-xs text-[#64748B] font-medium tracking-tight">Consolidado de EnviosInternacionales.com</p>
         </div>
         <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input type="text" placeholder="Cliente o # Guía..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-9 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-[11px] focus:ring-1 focus:ring-[#EA580C] outline-none" />
            </div>
            <button onClick={fetchOrders} className="h-10 w-10 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Clock className={`w-4 h-4 text-[#64748B] ${loading ? 'animate-spin text-[#EA580C]' : ''}`} />
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`h-10 w-10 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-all shadow-sm ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : ''}`}>
              <Filter className="w-4 h-4" />
            </button>
         </div>
      </header>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border border-[#E2E8F0] rounded-md p-6 mb-8 shadow-sm overflow-hidden flex flex-wrap gap-8">
             <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Paquetería</label>
                <select value={filterCarrier} onChange={(e) => setFilterCarrier(e.target.value)} className="h-9 px-2 bg-white border border-[#E2E8F0] rounded-md text-xs outline-none focus:border-[#EA580C]">
                  <option>Todas</option><option>FEDEX</option><option>ESTAFETA</option><option>DHL</option>
                </select>
             </div>
             <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Estatus</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 px-2 bg-white border border-[#E2E8F0] rounded-md text-xs outline-none focus:border-[#EA580C]">
                  <option>Todos</option><option>Creado</option><option>En camino</option><option>Recolectado</option><option>Entregado</option>
                </select>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#EA580C] animate-spin" />
           </div>
      ) : (
        <div className="flex flex-col gap-4">
           {filteredOrders.map((order) => (
              <div key={order.uuid} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-[#EA580C]/40 transition-colors group">
                 <div className="flex justify-between items-center px-4 md:px-6 py-3 border-b border-[#F1F5F9] bg-slate-50/50">
                    <div className="flex items-center gap-2 md:gap-3">
                       <div className="w-6 h-6 md:w-8 md:h-8 bg-black rounded-lg flex items-center justify-center font-bold text-white text-[8px] md:text-[10px] shadow-sm">L</div>
                       <div className="text-[10px] md:text-[11px] font-black text-[#64748B] uppercase">
                          {order.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                       </div>
                    </div>
                    <div className={`px-2 md:px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase flex items-center gap-1.5 ${getStatusBadgeStyle(order.rawStatus)}`}>
                       {order.status}
                    </div>
                 </div>

                 <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 items-start">
                    <div className="flex flex-col gap-1 md:gap-2">
                       <p className="text-[8px] md:text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Paquetería</p>
                       <span className="font-black text-[10px] md:text-xs text-[#0F172A]">{order.carrier}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:gap-2 col-span-1">
                       <p className="text-[8px] md:text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Guía</p>
                       <button onClick={() => { navigator.clipboard.writeText(order.tracking); toast.success("Copiado!"); }} className="text-[#00AAC7] font-black text-[10px] md:text-xs hover:underline flex items-center gap-1.5">
                          <span className="truncate max-w-[80px] md:max-w-none">#{order.tracking}</span> <Copy className="w-3 h-3" />
                       </button>
                    </div>
                    <div className="flex flex-col gap-1 md:gap-2 col-span-2 md:col-span-1 border-t md:border-t-0 pt-3 md:pt-0">
                       <p className="text-[8px] md:text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Destino</p>
                       <span className="font-black text-[10px] md:text-xs text-[#0F172A] uppercase truncate">{order.customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                       <p className="text-[8px] md:text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Total</p>
                       <span className="font-black text-[10px] md:text-xs text-[#0F172A] uppercase">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                       {!order.labelUrl && (
                         <button 
                           onClick={() => handleReprocess(order.id)} 
                           className="flex-1 md:w-auto px-4 h-10 flex items-center justify-center bg-[#EA580C] text-white rounded-xl hover:bg-black transition-all shadow-sm text-[10px] font-black uppercase tracking-tighter"
                         >
                           <Zap className="w-3.5 h-3.5 mr-1" /> Generar Guía
                         </button>
                       )}
                       <button onClick={() => setSelectedOrder(order)} className="flex-1 md:w-9 md:h-9 h-10 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-xl text-[#64748B] hover:text-[#00AAC7] transition-all shadow-sm"><Eye className="w-4 h-4" /></button>
                       <button onClick={() => window.open(order.labelUrl!, "_blank")} disabled={!order.labelUrl} className="flex-1 md:w-9 md:h-9 h-10 flex items-center justify-center bg-black disabled:bg-gray-100 text-white rounded-xl hover:bg-[#00AAC7] transition-all shadow-sm"><Download className="w-4 h-4" /></button>
                    </div>
                 </div>
              </div>
            ))}
        </div>
      )}

      {/* MODAL DETALLES ESTILO ENVIOS INTERNACIONALES (RENDERIZADO VÍA PORTAL) */}
      {selectedOrder && createPortal(
        <div key="shipping-modal-portal" className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4 overflow-hidden">
           <AnimatePresence>
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setSelectedOrder(null)} 
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
             />
             
             {/* Content Container */}
             <motion.div 
               initial={{ opacity: 0, x: 100 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: 100 }} 
               className="relative bg-[#F8FAFC] w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
             >
                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                   <h2 className="text-lg font-bold text-slate-800">Detalles del envío</h2>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(selectedOrder.labelUrl || '#', "_blank")} 
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#00AAC7] transition-colors"
                        title="Ver guía original"
                      >
                         <Maximize className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSelectedOrder(null)} 
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                         <X className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   {/* 1. RASTREO (STEPPER) */}
                   <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="font-bold text-slate-800">Rastreo</h3>
                         <span className="text-[10px] text-gray-400 font-medium">Última actualización: {selectedOrder.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      
                      {/* Stepper Visual */}
                      <div className="relative px-2">
                         <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100" />
                         <div 
                           className="absolute top-4 left-4 h-0.5 bg-[#00AAC7] transition-all duration-1000" 
                           style={{ width: selectedOrder.rawStatus === 'success' ? '100%' : selectedOrder.rawStatus === 'in_transit' ? '50%' : '5%' }} 
                         />
                         
                         <div className="relative flex justify-between">
                            {[
                              { label: 'Creado', status: 'created', icon: Package },
                              { label: 'Recolectado', status: 'collected', icon: MapPin },
                              { label: 'En camino', status: 'in_transit', icon: Navigation },
                              { label: 'Por llegar', status: 'near_destination', icon: Clock },
                              { label: 'Entregado', status: 'success', icon: ClipboardList }
                            ].map((step, idx) => {
                               const isActive = selectedOrder.rawStatus === step.status || 
                                               (step.status === 'created' && true) || 
                                               (selectedOrder.rawStatus === 'success');
                               return (
                                 <div key={idx} className="flex flex-col items-center gap-2 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isActive ? 'bg-[#00AAC7] text-white' : 'bg-slate-100 text-slate-300'}`}>
                                       <step.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase transition-colors ${isActive ? 'text-slate-800' : 'text-slate-300'}`}>{step.label}</span>
                                 </div>
                               );
                            })}
                         </div>
                      </div>
                   </div>

                   {/* 2. DATOS GENERALES */}
                   <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                         <span className="text-xs text-slate-500">Paquetería:</span>
                         <span className="text-xs font-bold text-slate-800">{selectedOrder.carrier}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                         <span className="text-xs text-slate-500">Número de rastreo:</span>
                         <span className="text-xs font-bold text-[#00AAC7]">{selectedOrder.tracking}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                         <span className="text-xs text-slate-500">Creado por:</span>
                         <span className="text-xs font-bold text-slate-800">LITFIT Admin</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                         <span className="text-xs text-slate-500">Monto total:</span>
                         <span className="text-xs font-bold text-[#00AAC7]">${selectedOrder.total.toFixed(2)} MXN</span>
                      </div>
                   </div>

                   {/* 3. DIRECCIONES */}
                   <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                         <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Dirección de origen
                         </h3>
                         <div className="flex gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                               <Package className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-slate-800 uppercase">{selectedOrder.sender?.name || 'LITFIT'}</p>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed uppercase">{selectedOrder.sender?.address || 'Aguascalientes, México'}</p>
                               <div className="flex gap-4 mt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><Phone className="w-3 h-3" /> 4491952361</div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><MessageSquare className="w-3 h-3" /> mmedellin_89@hotmail.com</div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                         <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Navigation className="w-3.5 h-3.5 text-[#EA580C]" /> Dirección de destino
                         </h3>
                         <div className="flex gap-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                               <MapPin className="w-5 h-5 text-[#EA580C]" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-slate-800 uppercase">{selectedOrder.recipient?.full_name}</p>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed uppercase">{selectedOrder.recipient?.address}</p>
                               <p className="text-[10px] text-slate-400 mt-1 font-bold">{selectedOrder.recipient?.area}</p>
                               <div className="flex gap-4 mt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><Phone className="w-3 h-3" /> {selectedOrder.recipient?.phone}</div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><MessageSquare className="w-3 h-3" /> {selectedOrder.recipient?.email}</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* 4. PAQUETE */}
                   <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Paquete</h3>
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                            <span className="text-slate-500">Dimensiones:</span>
                            <span className="font-bold text-slate-800">{selectedOrder.package?.dimensions}</span>
                         </div>
                         <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                            <span className="text-slate-500">Peso:</span>
                            <span className="font-bold text-slate-800">{selectedOrder.package?.weight} kg</span>
                         </div>
                         <div className="pt-2">
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Contenido del paquete:</p>
                            <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-dotted border-slate-200">{selectedOrder.package?.description}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                   <button 
                     onClick={() => window.open(selectedOrder.labelUrl!, "_blank")} 
                     disabled={!selectedOrder.labelUrl}
                     className="flex-1 bg-[#00AAC7] hover:bg-black text-white h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:shadow-none"
                   >
                     <Download className="w-4 h-4" /> Descargar Guía
                   </button>
                   <button 
                     onClick={() => setSelectedOrder(null)} 
                     className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                   >
                     Cerrar
                   </button>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>,
        document.body
      )}

    </>
  );
}
