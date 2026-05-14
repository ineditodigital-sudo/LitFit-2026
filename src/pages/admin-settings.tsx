import { useState, useEffect } from "react";
import { Hammer, Save, Loader2, AlertTriangle } from "lucide-react";

interface AdminSettingsProps {
  adminToken: string;
}

export function AdminSettings({ adminToken }: AdminSettingsProps) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`);
      const data = await response.json();
      setIsMaintenance(data.maintenance_mode === '1');
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
          maintenance_mode: isMaintenance ? '1' : '0'
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
        // Recargar para asegurar consistencia
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al guardar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00AAC7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Configuración del Sitio</h2>
        <p className="text-[#64748B] font-medium italic">Gestiona el estado global de la tienda LITFIT.</p>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[30px] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-slate-100">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Hammer className="w-5 h-5 text-[#EA580C]" />
              <h3 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">Modo Mantenimiento</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Activa la vista "En Construcción" para el público. Esto impedirá que los clientes vean los productos y realicen compras mientras realizas cambios en el sitio.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isMaintenance ? 'text-[#EA580C]' : 'text-[#64748B]'}`}>
              {isMaintenance ? 'ACTIVADO' : 'DESACTIVADO'}
            </span>
            <button
              onClick={() => setIsMaintenance(!isMaintenance)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                isMaintenance ? 'bg-[#EA580C]' : 'bg-slate-200'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${
                isMaintenance ? 'left-9' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {isMaintenance && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
            <p className="text-xs text-[#EA580C] font-bold leading-relaxed">
              Atención: Al activar el modo mantenimiento, el sitio público mostrará un mensaje de "En Construcción". Los administradores podrán seguir accediendo al panel para realizar gestiones.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest ${
            message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
