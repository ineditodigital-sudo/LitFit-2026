import { useState, useEffect } from "react";
import { Hammer, Save, Loader2, AlertTriangle, Activity, Eye, ExternalLink } from "lucide-react";

interface AdminSettingsProps {
  adminToken: string;
}

// Sólo se permiten estos caracteres en los IDs: es lo que aceptan Meta y Clarity,
// y evita que se cuele cualquier cosa rara dentro de la etiqueta <script>.
const PIXEL_RE = /^[0-9]*$/;
const CLARITY_RE = /^[a-z0-9]*$/;

// Valores por defecto mientras las claves no existan en la base de datos.
// Deben coincidir con el respaldo del index.php (ver scripts/deploy.mjs):
// así el panel muestra exactamente lo que el sitio está usando en vivo.
// Una vez que se guarda por primera vez, mandan los valores de la BD y esto
// deja de aplicar. Ojo: una clave guardada VACÍA sí desactiva el seguimiento,
// por eso se usa ?? (clave ausente) y no || (valor vacío).
const PIXEL_POR_DEFECTO = "37935625759362059";
const CLARITY_POR_DEFECTO = "xwpsdnfmsh";

function EstadoSeguimiento({ activo, enBD }: { activo: boolean; enBD: boolean }) {
  if (!activo) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#64748B] text-[9px] font-black uppercase tracking-widest">
        Desactivado
      </span>
    );
  }
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
        enBD ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
      }`}
      title={
        enBD
          ? "Guardado en la base de datos"
          : "Activo con el valor por defecto. Guarda para fijarlo."
      }
    >
      {enBD ? "Configurado" : "Activo · sin guardar"}
    </span>
  );
}

export function AdminSettings({ adminToken }: AdminSettingsProps) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [metaPixelId, setMetaPixelId] = useState("");
  const [clarityId, setClarityId] = useState("");
  // Si la clave ya vive en la BD o si se está mostrando el valor por defecto
  const [pixelEnBD, setPixelEnBD] = useState(false);
  const [clarityEnBD, setClarityEnBD] = useState(false);

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
      // ?? y no ||: una clave guardada vacía significa "desactivado a propósito"
      setMetaPixelId(data.meta_pixel_id ?? PIXEL_POR_DEFECTO);
      setClarityId(data.clarity_id ?? CLARITY_POR_DEFECTO);
      setPixelEnBD(data.meta_pixel_id !== undefined);
      setClarityEnBD(data.clarity_id !== undefined);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const pixelInvalido = !PIXEL_RE.test(metaPixelId);
  const clarityInvalido = !CLARITY_RE.test(clarityId);

  const handleSave = async () => {
    if (pixelInvalido || clarityInvalido) {
      setMessage({ type: 'error', text: 'Revisa los IDs de seguimiento antes de guardar.' });
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
          maintenance_mode: isMaintenance ? '1' : '0',
          meta_pixel_id: metaPixelId.trim(),
          clarity_id: clarityId.trim()
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

        {/* ── Pixel de Meta ── */}
        <div className="mb-10 pb-10 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-[#0866FF]" />
            <h3 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">Pixel de Meta</h3>
            <EstadoSeguimiento activo={!!metaPixelId} enBD={pixelEnBD} />
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed mb-4">
            Mide conversiones y permite optimizar campañas de anuncios en Facebook e Instagram.
            Lo encuentras en Meta Events Manager, en Orígenes de datos.
          </p>

          <label className="block text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-2">
            ID del Pixel
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={metaPixelId}
            onChange={(e) => setMetaPixelId(e.target.value.trim())}
            placeholder="Ej. 1234567890123456"
            className={`w-full bg-slate-50 border-2 rounded-2xl px-4 py-3 outline-none font-mono text-sm transition-colors ${
              pixelInvalido ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-[#00AAC7]'
            }`}
          />
          {pixelInvalido ? (
            <p className="mt-2 text-[11px] font-bold text-red-500">
              El ID del pixel sólo puede contener números.
            </p>
          ) : (
            <p className={`mt-2 text-[11px] ${!pixelEnBD && metaPixelId ? 'text-amber-600 font-bold' : 'text-[#94A3B8]'}`}>
              {!metaPixelId
                ? "Vacío: el pixel no se cargará. Déjalo así para desactivarlo."
                : pixelEnBD
                  ? "Activo: el pixel se está cargando en todas las páginas del sitio."
                  : "El pixel ya está activo en el sitio con este ID, pero aún no queda guardado en la base de datos. Presiona Guardar Cambios para fijarlo."}
            </p>
          )}

          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-black uppercase tracking-widest text-[#0866FF] hover:underline"
          >
            Abrir Events Manager <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* ── Microsoft Clarity ── */}
        <div className="mb-10 pb-10 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-[#7B4FE0]" />
            <h3 className="font-black text-sm uppercase tracking-widest text-[#0F172A]">Microsoft Clarity</h3>
            <EstadoSeguimiento activo={!!clarityId} enBD={clarityEnBD} />
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed mb-4">
            Graba sesiones y genera mapas de calor para ver cómo navegan los clientes y
            dónde se atoran. Es gratuito. El ID está en clarity.microsoft.com, en Settings → Overview.
          </p>

          <label className="block text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-2">
            ID del Proyecto
          </label>
          <input
            type="text"
            value={clarityId}
            onChange={(e) => setClarityId(e.target.value.trim().toLowerCase())}
            placeholder="Ej. abc123xyz"
            className={`w-full bg-slate-50 border-2 rounded-2xl px-4 py-3 outline-none font-mono text-sm transition-colors ${
              clarityInvalido ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-[#00AAC7]'
            }`}
          />
          {clarityInvalido ? (
            <p className="mt-2 text-[11px] font-bold text-red-500">
              El ID de Clarity sólo puede contener letras y números.
            </p>
          ) : (
            <p className={`mt-2 text-[11px] ${!clarityEnBD && clarityId ? 'text-amber-600 font-bold' : 'text-[#94A3B8]'}`}>
              {!clarityId
                ? "Vacío: Clarity no se cargará. Déjalo así para desactivarlo."
                : clarityEnBD
                  ? "Activo: Clarity está grabando las sesiones del sitio."
                  : "Clarity ya está activo en el sitio con este ID, pero aún no queda guardado en la base de datos. Presiona Guardar Cambios para fijarlo."}
            </p>
          )}

          <a
            href="https://clarity.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-black uppercase tracking-widest text-[#7B4FE0] hover:underline"
          >
            Abrir Clarity <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Los cambios en estos dos IDs se aplican en el sitio público de inmediato al guardar,
            sin necesidad de volver a publicar. Verifícalos recargando la tienda en una ventana de incógnito.
          </p>
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
