import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

interface PromoBannerManagerProps {
  adminToken: string;
}

export function PromoBannerManager({ adminToken }: PromoBannerManagerProps) {
  const [promoBannerVisible, setPromoBannerVisible] = useState(true);
  const [promoBannerText, setPromoBannerText] = useState("En la compra de $1,000 o más en productos, agrega a tu carrito un shaker de regalo");
  const [promoBannerSpeed, setPromoBannerSpeed] = useState("20");
  const [promoBannerLink, setPromoBannerLink] = useState("");
  const [promoBannerRepetitions, setPromoBannerRepetitions] = useState("3");
  
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
      setPromoBannerVisible(data.promo_banner_visible !== '0');
      if (data.promo_banner_text) setPromoBannerText(data.promo_banner_text);
      if (data.promo_banner_speed) setPromoBannerSpeed(data.promo_banner_speed);
      if (data.promo_banner_link) setPromoBannerLink(data.promo_banner_link);
      if (data.promo_banner_repetitions) setPromoBannerRepetitions(data.promo_banner_repetitions);
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
          promo_banner_visible: promoBannerVisible ? '1' : '0',
          promo_banner_text: promoBannerText,
          promo_banner_speed: promoBannerSpeed,
          promo_banner_link: promoBannerLink,
          promo_banner_repetitions: promoBannerRepetitions
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cintillo guardado correctamente.' });
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
        <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Cintillo Promocional</h2>
        <p className="text-[#64748B] font-medium italic">Administra el texto animado que aparece en la parte superior del sitio web.</p>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[30px] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 bg-[#00AAC7] rounded flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-black">TXT</span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">Ajustes del Cintillo</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Modifica la visibilidad, texto, velocidad, enlace y las repeticiones para que luzca perfecto.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${promoBannerVisible ? 'text-[#00AAC7]' : 'text-[#64748B]'}`}>
              {promoBannerVisible ? 'MOSTRAR' : 'OCULTAR'}
            </span>
            <button
              onClick={() => setPromoBannerVisible(!promoBannerVisible)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                promoBannerVisible ? 'bg-[#00AAC7]' : 'bg-slate-200'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${
                promoBannerVisible ? 'left-9' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Texto del Cintillo
            </label>
            <input
              type="text"
              value={promoBannerText}
              onChange={(e) => setPromoBannerText(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-[#00AAC7] focus:bg-white transition-colors outline-none"
              placeholder="Ej. En la compra de $1,000 o más en productos, agrega a tu carrito un shaker de regalo"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Velocidad de Animación (segundos)
            </label>
            <input
              type="number"
              value={promoBannerSpeed}
              onChange={(e) => setPromoBannerSpeed(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-[#00AAC7] focus:bg-white transition-colors outline-none"
              placeholder="20"
              min="5"
              max="100"
            />
            <p className="text-[10px] text-slate-400 mt-2">Un número menor hace que se mueva más rápido (recomendado: 20).</p>
          </div>
          <div>
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Enlace de Redirección (Opcional)
            </label>
            <input
              type="text"
              value={promoBannerLink}
              onChange={(e) => setPromoBannerLink(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-[#00AAC7] focus:bg-white transition-colors outline-none"
              placeholder="Ej. /productos/shaker o https://..."
            />
            <p className="text-[10px] text-slate-400 mt-2">URL a la que irá el usuario si hace clic en el cintillo.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Repeticiones del Texto
            </label>
            <input
              type="number"
              value={promoBannerRepetitions}
              onChange={(e) => setPromoBannerRepetitions(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-[#00AAC7] focus:bg-white transition-colors outline-none"
              placeholder="3"
              min="1"
              max="20"
            />
            <p className="text-[10px] text-slate-400 mt-2">Cantidad de veces que se repetirá el texto en el cintillo continuo.</p>
          </div>
        </div>

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
