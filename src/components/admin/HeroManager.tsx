import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, MoveUp, MoveDown, Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface HeroManagerProps {
  adminToken: string;
}

export interface HeroSlide {
  id: string; // Unique ID for React key
  image: string;
  imageMobile: string;
  productId: string;
}

interface Product {
  id: string;
  name: string;
}

export function HeroManager({ adminToken }: HeroManagerProps) {
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  const defaultSlides: HeroSlide[] = [
    {
      id: "default-1",
      image: "/BANNER-CREATINA.png",
      imageMobile: "/responsivecreatine-1.png",
      productId: "creatina",
    },
    {
      id: "default-2",
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_1.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/banner-1-2.webp",
      productId: "barras-energeticas",
    },
    {
      id: "default-3",
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_2.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/banner-2-2.webp",
      productId: "proteina-clasica",
    },
    {
      id: "default-4",
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_2_copia.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/banner-3-2.webp",
      productId: "proteina-colageno",
    },
    {
      id: "default-5",
      image: "https://imagenes.inedito.digital/LITFIT/Mesa_de_trabajo_2_copia_2.png",
      imageMobile: "https://imagenes.inedito.digital/LITFIT/BANNER-4-2.webp",
      productId: "shaker",
    },
  ];
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsRes = await fetch(`https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`);
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.hero_slides && settings.hero_slides !== "[]") {
            const parsed = JSON.parse(settings.hero_slides);
            if (parsed.length > 0) {
              setSlides(parsed);
            } else {
              setSlides(defaultSlides);
            }
          } else {
            setSlides(defaultSlides);
          }
        }

        // Fetch Products for the dropdown
        const productsRes = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        id: "slide-" + Date.now().toString(),
        image: "",
        imageMobile: "",
        productId: "",
      },
    ]);
    
    // Auto-scroll to bottom after state updates
    setTimeout(() => {
      if (slidesContainerRef.current && slidesContainerRef.current.lastElementChild) {
        slidesContainerRef.current.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleRemoveSlide = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id));
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    if (direction === "up" && index > 0) {
      const temp = newSlides[index];
      newSlides[index] = newSlides[index - 1];
      newSlides[index - 1] = temp;
    } else if (direction === "down" && index < newSlides.length - 1) {
      const temp = newSlides[index];
      newSlides[index] = newSlides[index + 1];
      newSlides[index + 1] = temp;
    }
    setSlides(newSlides);
  };

  const handleUpdateSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: string, field: "image" | "imageMobile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Formato no permitido. Solo JPG, PNG y WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es muy pesada. Máximo 5MB.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    const loadToast = toast.loading("Subiendo imagen...");
    try {
      const response = await fetch("https://litfitmexico.com/envios/upload-image.php", {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` },
        body: formDataUpload
      });
      const data = await response.json();
      if (data.success) {
        handleUpdateSlide(slideId, field, data.url);
        toast.dismiss(loadToast);
        toast.success("Imagen subida correctamente");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      toast.error(err.message || "Error al subir la imagen");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage({ text: "", type: "" });

    try {
      const response = await fetch("https://litfitmexico.com/envios/api-settings.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          hero_slides: JSON.stringify(slides),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSaveMessage({ text: "¡Banners guardados exitosamente!", type: "success" });
      } else {
        setSaveMessage({ text: data.message || "Error al guardar", type: "error" });
      }
    } catch (error) {
      setSaveMessage({ text: "Error de red al guardar", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Cargando banners...</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-black tracking-tight mb-2">
            Gestor de Banners (Hero Section)
          </h2>
          <p className="text-gray-500 text-sm">
            Agrega, ordena y configura los banners de la página principal.
          </p>
        </div>
        <button
          onClick={handleAddSlide}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 font-bold text-sm hover:bg-[#00AAC7] transition-colors rounded-lg"
        >
          <Plus className="w-4 h-4" />
          NUEVO BANNER
        </button>
      </div>

      <div className="space-y-6" ref={slidesContainerRef}>
        {slides.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay banners configurados.</p>
            <p className="text-sm text-gray-400 mt-1">Si no hay banners, se mostrarán los diseños por defecto.</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={slide.id}
              className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveSlide(index, "up")}
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-black disabled:opacity-30 bg-white rounded-md shadow-sm border border-gray-100"
                  title="Mover arriba"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveSlide(index, "down")}
                  disabled={index === slides.length - 1}
                  className="p-2 text-gray-400 hover:text-black disabled:opacity-30 bg-white rounded-md shadow-sm border border-gray-100"
                  title="Mover abajo"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveSlide(slide.id)}
                  className="p-2 text-red-500 hover:bg-red-50 bg-white rounded-md shadow-sm border border-gray-100 ml-2"
                  title="Eliminar banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">
                  {index + 1}
                </div>
                <h3 className="font-bold text-black">Configuración del Banner</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Imagen Escritorio
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 flex items-center justify-center gap-2 bg-black text-white p-3 rounded-lg cursor-pointer hover:bg-[#00AAC7] transition-all text-xs font-bold">
                      <Upload className="w-4 h-4" /> SUBIR ARCHIVO
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, slide.id, "image")}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-[10px] font-bold text-gray-400">URL:</span>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => handleUpdateSlide(slide.id, "image", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-white text-black p-2 rounded border border-gray-200 focus:border-[#00AAC7] outline-none text-xs transition-all"
                    />
                  </div>
                  {slide.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center min-h-[100px]">
                      <img src={slide.image} alt="Preview" className="max-h-32 object-contain" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Imagen Móvil
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 flex items-center justify-center gap-2 bg-black text-white p-3 rounded-lg cursor-pointer hover:bg-[#00AAC7] transition-all text-xs font-bold">
                      <Upload className="w-4 h-4" /> SUBIR ARCHIVO
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, slide.id, "imageMobile")}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-[10px] font-bold text-gray-400">URL:</span>
                    <input
                      type="text"
                      value={slide.imageMobile}
                      onChange={(e) => handleUpdateSlide(slide.id, "imageMobile", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-white text-black p-2 rounded border border-gray-200 focus:border-[#00AAC7] outline-none text-xs transition-all"
                    />
                  </div>
                  {slide.imageMobile && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center min-h-[100px]">
                      <img src={slide.imageMobile} alt="Preview" className="max-h-32 object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-3">
                  <LinkIcon className="w-4 h-4" /> Redirección al hacer clic
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={slide.productId.startsWith('http') ? 'custom' : slide.productId}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        handleUpdateSlide(slide.id, "productId", e.target.value);
                      } else {
                        handleUpdateSlide(slide.id, "productId", "https://");
                      }
                    }}
                    className="md:w-1/2 bg-gray-50 text-black p-3 rounded-lg border border-gray-200 focus:border-[#00AAC7] focus:ring-1 focus:ring-[#00AAC7] outline-none text-sm font-medium"
                  >
                    <option value="">-- Sin Redirección --</option>
                    <optgroup label="Productos">
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Páginas">
                      <option value="barras-energeticas">Página: Barras de Proteína</option>
                      <option value="proteina-clasica">Página: Proteína Aislada</option>
                      <option value="proteina-colageno">Página: Proteína ISO + Colágeno</option>
                      <option value="test-product">Página: Producto de Prueba</option>
                    </optgroup>
                    <optgroup label="Personalizado">
                      <option value="custom">-- Enlace Personalizado (URL) --</option>
                    </optgroup>
                  </select>
                  
                  {slide.productId.startsWith('http') && (
                    <input
                      type="url"
                      placeholder="https://ejemplo.com"
                      value={slide.productId}
                      onChange={(e) => handleUpdateSlide(slide.id, "productId", e.target.value)}
                      className="md:w-1/2 bg-gray-50 text-black p-3 rounded-lg border border-gray-200 focus:border-[#00AAC7] focus:ring-1 focus:ring-[#00AAC7] outline-none text-sm"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
        {saveMessage.text ? (
          <span
            className={`text-sm font-bold ${
              saveMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {saveMessage.text}
          </span>
        ) : (
          <span /> // empty placeholder for layout
        )}
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#00AAC7] hover:bg-[#008a9f] text-white px-8 py-4 font-black text-sm tracking-widest transition-all shadow-lg hover:shadow-xl rounded-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
        </button>
      </div>
    </div>
  );
}
