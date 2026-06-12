import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Plus, Trash2, Image as ImageIcon } from "lucide-react";

interface Flavor {
  name: string;
  color: string;
  weight: string;
  image: string;
}

const DEFAULT_FLAVORS: Flavor[] = [
  { name: "CHOCO PEANUT BUTTER", color: "#8B4513", weight: "75g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-choco%20peanut.webp" },
  { name: "TRUFA DE CHOCOLATE", color: "#4A2511", weight: "58g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-chocolate-truffle.webp" },
  { name: "CAFÉ TIRAMISU", color: "#C9A86A", weight: "65g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-tiramisú.webp" },
  { name: "ALMENDRA VAINILLA", color: "#D4B08C", weight: "60g", image: "https://imagenes.inedito.digital/LITFIT/barras-litfit-almond.webp" },
  { name: "FRESA", color: "#FF6B9D", weight: "70g", image: "/assets/barras_fresa.png" },
];

export function BarsPromoManager({ adminToken }: { adminToken: string }) {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("https://litfitmexico.com/envios/api-settings.php");
      const data = await res.json();
      if (data.bars_promotion_flavors) {
        setFlavors(JSON.parse(data.bars_promotion_flavors));
      } else {
        setFlavors(DEFAULT_FLAVORS);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("https://litfitmexico.com/envios/api-settings.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          bars_promotion_flavors: JSON.stringify(flavors)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Sección actualizada correctamente");
      } else {
        toast.error("Error al guardar: " + data.message);
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const updateFlavor = (index: number, field: keyof Flavor, value: string) => {
    const newFlavors = [...flavors];
    newFlavors[index] = { ...newFlavors[index], [field]: value };
    setFlavors(newFlavors);
  };

  const addFlavor = () => {
    setFlavors([...flavors, { name: "NUEVO SABOR", color: "#00AAC7", weight: "70g", image: "" }]);
  };

  const removeFlavor = (index: number) => {
    setFlavors(flavors.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Subiendo imagen...");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://litfitmexico.com/envios/upload-image.php", {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        updateFlavor(index, "image", data.url);
        toast.success("Imagen subida", { id: toastId });
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (err) {
      toast.error("Error al subir", { id: toastId });
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Cargando sección...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Sección "Barras de Proteína"</h2>
          <p className="text-slate-500 text-sm">Gestiona los sabores que aparecen en el recuadro azul brillante de la portada.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid gap-4">
        {flavors.map((flavor, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm">
            <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center relative group">
              {flavor.image ? (
                <img src={flavor.image} alt={flavor.name} className="w-full h-full object-contain p-2" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-xs backdrop-blur-sm">
                Cambiar
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(index, e)} />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del Sabor</label>
                <input
                  type="text"
                  value={flavor.name}
                  onChange={(e) => updateFlavor(index, "name", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#00AAC7] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Color (Hexadecimal)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={flavor.color}
                    onChange={(e) => updateFlavor(index, "color", e.target.value)}
                    className="w-10 h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={flavor.color}
                    onChange={(e) => updateFlavor(index, "color", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#00AAC7] outline-none font-mono"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">URL de la Imagen</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flavor.image}
                    onChange={(e) => updateFlavor(index, "image", e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#00AAC7] outline-none"
                    placeholder="https://..."
                  />
                  <button onClick={() => removeFlavor(index)} className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar Sabor">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addFlavor}
        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-[#00AAC7] hover:text-[#00AAC7] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Agregar Nuevo Sabor
      </button>
    </div>
  );
}
