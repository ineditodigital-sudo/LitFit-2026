import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Package, Tag, DollarSign, Image as ImageIcon, Sparkles, Activity } from "lucide-react";
import { toast } from "sonner";
// Importar datos locales como fallback
import localProducts from "../data/products.json";

export interface Variant {
  name: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  images?: string[];
  badge?: string;
  description: string;
  flavors?: string[];
  variants?: (string | Variant)[];
  sizes?: string[];
  nutrition?: Record<string, string>;
  features?: string[];
}

export function AdminProducts({ adminToken }: { adminToken: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Product>({
    id: "",
    name: "",
    category: "",
    price: "",
    image: "",
    images: [],
    badge: "",
    description: "",
    flavors: [],
    variants: [],
    sizes: [],
    nutrition: {},
    features: []
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`, { headers: { "Authorization": `Bearer ${adminToken}` } });
      if (!response.ok) throw new Error("Server not found");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.warn("⚠️ Usando datos locales de respaldo (PHP no detectado en el servidor)");
      // Fallback a los datos locales si el servidor falla
      setProducts(localProducts as Product[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (list: Product[]) => {
    try {
      const response = await fetch("https://litfitmexico.com/envios/api-products.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(list),
      });
      const result = await response.json();
      if (result.success) {
        setProducts(list);
        toast.success(result.message);
        setEditingId(null);
        setIsAdding(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar en el servidor. ¿Has subido los archivos PHP?");
      // Permitir cambio local para previsualizar aunque el guardado falle
      setProducts(list);
      setEditingId(null);
      setIsAdding(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      ...product,
      images: product.images || [],
      flavors: product.flavors || product.variants || [],
      variants: (product.variants || product.flavors || []).map(v => typeof v === 'string' ? { name: v } : v),
      sizes: product.sizes || [],
      nutrition: product.nutrition || {},
      features: product.features || []
    });
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: "prod-" + Date.now(),
      name: "",
      category: "",
      price: "",
      image: "",
      images: [],
      badge: "",
      description: "",
      flavors: [],
      variants: [],
      sizes: [],
      nutrition: {},
      features: []
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      const newList = products.filter((p) => p.id !== id);
      handleSave(newList);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newList;
    if (isAdding) {
      const newProduct = { ...formData, variants: formData.variants };
      if (!newProduct.id) {
        newProduct.id = newProduct.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
      }
      newList = [...products, newProduct];
    } else {
      newList = products.map((p) => (p.id === editingId ? { ...formData, variants: formData.variants } : p));
    }
    handleSave(newList);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Formato no permitido. Solo JPG, PNG y WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es muy pesada. Máximo 2MB.");
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
        if (isGallery) {
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), data.url] }));
        } else {
          setFormData(prev => ({ ...prev, image: data.url }));
        }
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

  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Formato no permitido. Solo JPG, PNG y WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es muy pesada. Máximo 2MB.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    const loadToast = toast.loading("Subiendo imagen de variante...");
    try {
      const response = await fetch("https://litfitmexico.com/envios/upload-image.php", {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` },
        body: formDataUpload
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => {
          const newVars = [...(prev.variants as Variant[] || [])];
          if (newVars[variantIndex]) {
            newVars[variantIndex] = { ...newVars[variantIndex], image: data.url };
          }
          return { ...prev, variants: newVars };
        });
        toast.dismiss(loadToast);
        toast.success("Imagen de variante subida");
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      toast.error(err.message || "Error al subir la imagen");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter">Inventario LITFIT</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium tracking-tight">Administrando {products.length} productos en stock</p>
        </div>
        <button
          onClick={startAdd}
          className="w-full sm:w-auto bg-black text-white px-6 py-3 md:py-2.5 font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00AAC7] transition-all rounded-xl shadow-lg"
        >
          <Plus className="w-4 h-4" /> Agregar Producto
        </button>
      </header>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center font-bold text-gray-400">CARGANDO CATÁLOGO...</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white border-2 border-slate-100 group hover:border-[#00AAC7]/50 transition-all rounded-[32px] overflow-hidden flex flex-col shadow-sm">
              <div className="aspect-[4/3] relative bg-slate-50 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                {product.badge && (
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-xl">
                    {product.badge}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black text-[#00AAC7] uppercase tracking-widest bg-[#00AAC7]/5 px-2 py-1 rounded-lg">
                    {product.category}
                  </span>
                  <span className="text-xl font-black text-black tracking-tighter">${product.price}</span>
                </div>
                <h3 className="text-lg font-black text-black uppercase mb-1">{product.name}</h3>
                <p className="text-[11px] text-gray-500 font-medium mb-6 flex-1 line-clamp-3 leading-relaxed">{product.description}</p>
                
                {(product.flavors || product.variants) && (product.flavors || product.variants)!.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-1">
                    {(product.flavors || product.variants)!.map((f, idx) => {
                      const vName = typeof f === 'string' ? f : (f as Variant).name;
                      return (
                        <span key={idx} className="text-[8px] font-bold text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-md uppercase">
                          {vName}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 border-t border-slate-50 pt-4">
                  <button
                    onClick={() => startEdit(product)}
                    className="flex-1 h-11 flex items-center justify-center bg-gray-50 hover:bg-black group/edit rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400 group-hover/edit:text-white transition-colors" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 h-11 flex items-center justify-center bg-gray-50 hover:bg-red-500 group/del rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/del:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      {(editingId || isAdding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setEditingId(null); setIsAdding(false); }} />
          <div className="relative bg-white w-full max-w-6xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-black text-black uppercase tracking-tighter">
                {isAdding ? "Nuevo Producto" : `Editando: ${formData.name || "..."}`}
              </h2>
              <button onClick={() => { setEditingId(null); setIsAdding(false); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Two-column body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

              {/* ── LEFT: Form ── */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide lg:border-r border-slate-100">
                <form onSubmit={handleFormSubmit} id="product-form" className="space-y-6">

                  {/* Name & Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest">① Título del producto</label>
                    <input
                      type="text" required value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Proteína ISO + Collagen"
                      className="w-full h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-black text-lg transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Tag className="w-3 h-3" /> Categoría</label>
                      <input type="text" required value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3" /> Badge</label>
                      <input type="text" placeholder="Ej: BEST SELLER" value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest">② Descripción</label>
                    <textarea required value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe el producto para el cliente..."
                      className="w-full h-20 p-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-medium text-xs text-gray-600 resize-none transition-all scrollbar-hide leading-relaxed"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest flex items-center gap-1"><DollarSign className="w-3 h-3" /> ③ Precio (MXN)</label>
                    <input type="text" required value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="890"
                      className="w-full h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-black text-2xl transition-all"
                    />
                  </div>

                  {/* Image */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest flex items-center gap-1"><ImageIcon className="w-3 h-3" /> ④ Imagen principal</label>
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload}
                      className="w-full file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-black file:text-white hover:file:bg-[#00AAC7] file:transition-colors text-xs text-gray-400 cursor-pointer"
                    />
                    <div className="flex gap-2 items-center">
                      <span className="text-[9px] font-black text-gray-300 whitespace-nowrap">O PEGA URL:</span>
                      <input type="text" value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 h-9 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-medium text-[10px] transition-all"
                      />
                    </div>
                    {!formData.image && <p className="text-[10px] text-red-500 font-bold uppercase">* Requerida</p>}
                  </div>

                  {/* Gallery */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Galería adicional (opcional)</label>
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileUpload(e, true)}
                      className="w-full file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-gray-100 file:text-black hover:file:bg-black hover:file:text-white file:transition-all text-xs text-gray-400 cursor-pointer"
                    />
                    {formData.images && formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-slate-100 w-16 h-16">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images?.filter((_, i) => i !== idx) }))}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Variants / Flavors */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest">⑤ Sabores / Variantes</label>
                    <div className="space-y-2">
                      {formData.variants?.map((v, idx) => {
                        const variant = typeof v === 'string' ? { name: v } : v;
                        return (
                          <div key={idx} className="flex flex-col gap-2 border border-gray-100 p-3 rounded-2xl bg-slate-50/50">
                            <div className="flex gap-2 items-center">
                              {variant.image && (
                                <img src={variant.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                              )}
                              <input type="text" placeholder="Nombre del sabor (ej. Fresa)" value={variant.name}
                                onChange={(e) => {
                                  const newVars = [...(formData.variants as Variant[] || [])];
                                  newVars[idx] = { ...variant, name: e.target.value };
                                  setFormData({ ...formData, variants: newVars });
                                }}
                                className="flex-1 h-9 px-3 bg-white border-2 border-transparent rounded-xl focus:border-[#00AAC7] outline-none font-bold text-xs"
                              />
                              <button type="button" onClick={() => { const nv = formData.variants?.filter((_, i) => i !== idx); setFormData({ ...formData, variants: nv }); }}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex gap-2 items-center pl-0">
                              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleVariantImageUpload(e, idx)}
                                className="flex-1 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-gray-100 file:text-black hover:file:bg-black hover:file:text-white file:transition-all text-[9px] text-gray-400 cursor-pointer"
                              />
                              <span className="text-[9px] font-bold text-gray-300 whitespace-nowrap">Ó URL:</span>
                              <input type="text" placeholder="URL imagen" value={variant.image || ""}
                                onChange={(e) => {
                                  const newVars = [...(formData.variants as Variant[] || [])];
                                  newVars[idx] = { ...variant, image: e.target.value };
                                  setFormData({ ...formData, variants: newVars });
                                }}
                                className="flex-1 h-7 px-2 bg-white border border-gray-200 rounded-lg focus:border-[#00AAC7] outline-none font-medium text-[9px] text-gray-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <button type="button" onClick={() => setFormData({ ...formData, variants: [...(formData.variants || []), { name: "" }] })}
                        className="w-full h-9 border-2 border-dashed border-gray-200 hover:border-[#00AAC7] hover:bg-[#00AAC7]/5 text-gray-400 hover:text-[#00AAC7] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" /> Añadir sabor
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Package className="w-3 h-3" /> Tallas / Tamaños (opcional)</label>
                    <input type="text" placeholder="Ej: 16 barras, 24 barras"
                      value={formData.sizes?.join(", ") || ""}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") })}
                      className="w-full h-10 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs transition-all"
                    />
                  </div>

                  {/* Nutritional Info */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest flex items-center gap-1"><Activity className="w-3 h-3" /> ⑥ Información Nutricional</label>
                    <div className="space-y-2">
                      {Object.entries(formData.nutrition || {}).map(([key, value], idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <div className="flex-1 flex items-center gap-1 bg-slate-50 rounded-xl px-3 py-2 border-2 border-transparent focus-within:border-[#00AAC7]">
                            <input type="text" placeholder="Nutriente" value={key}
                              onChange={(e) => {
                                const entries = Object.entries(formData.nutrition || {});
                                entries[idx] = [e.target.value, value];
                                setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                              }}
                              className="w-24 bg-transparent outline-none font-bold text-xs text-gray-500"
                            />
                            <span className="text-gray-300 text-xs">|</span>
                            <input type="text" placeholder="Valor" value={value}
                              onChange={(e) => {
                                const entries = Object.entries(formData.nutrition || {});
                                entries[idx] = [key, e.target.value];
                                setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                              }}
                              className="flex-1 bg-transparent outline-none font-black text-sm text-black"
                            />
                          </div>
                          <button type="button" onClick={() => {
                            const entries = Object.entries(formData.nutrition || {}).filter((_, i) => i !== idx);
                            setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                          }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const entries = Object.entries(formData.nutrition || {});
                        entries.push(["", ""]);
                        setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                      }} className="w-full h-9 border-2 border-dashed border-gray-200 hover:border-[#00AAC7] hover:bg-[#00AAC7]/5 text-gray-400 hover:text-[#00AAC7] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" /> Añadir nutriente
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase text-[#00AAC7] tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3" /> ⑦ Características / Beneficios</label>
                    <div className="space-y-2">
                      {(formData.features || []).map((feat, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border-2 border-transparent focus-within:border-[#00AAC7]">
                            <div className="w-5 h-5 rounded-full bg-[#00AAC7]/15 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-2.5 h-2.5 text-[#00AAC7]" />
                            </div>
                            <input type="text" placeholder="Ej: 28.5g de proteína por porción" value={feat}
                              onChange={(e) => {
                                const nf = [...(formData.features || [])];
                                nf[idx] = e.target.value;
                                setFormData({ ...formData, features: nf });
                              }}
                              className="flex-1 bg-transparent outline-none font-medium text-xs text-gray-700"
                            />
                          </div>
                          <button type="button" onClick={() => {
                            const nf = (formData.features || []).filter((_, i) => i !== idx);
                            setFormData({ ...formData, features: nf });
                          }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setFormData({ ...formData, features: [...(formData.features || []), ""] })}
                        className="w-full h-9 border-2 border-dashed border-gray-200 hover:border-[#00AAC7] hover:bg-[#00AAC7]/5 text-gray-400 hover:text-[#00AAC7] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" /> Añadir característica
                      </button>
                    </div>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-3 pt-4 pb-2">
                    <button type="submit"
                      className="flex-1 h-12 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#00AAC7] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                    <button type="button" onClick={() => { setEditingId(null); setIsAdding(false); }}
                      className="flex-1 h-12 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              {/* ── RIGHT: Live Preview ── */}
              <div className="hidden lg:flex lg:w-[420px] flex-col bg-gray-50 overflow-y-auto scrollbar-hide">
                {/* Preview header */}
                <div className="px-5 py-3 border-b border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Vista del cliente</span>
                </div>

                {/* Product Preview */}
                <div className="p-5 space-y-4 flex-1">

                  {/* Image */}
                  <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center">
                    {formData.image ? (
                      <img src={formData.image} alt={formData.name} className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center gap-2">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-xs font-bold">Sin imagen</span>
                      </div>
                    )}
                    {formData.badge && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] text-black px-2.5 py-1 font-black text-[9px] tracking-widest shadow-lg">
                        {formData.badge}
                      </div>
                    )}
                  </div>

                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-3.5 h-3.5 rounded-sm bg-gray-200" />)}
                    <span className="text-[10px] text-[#00AAC7] font-bold ml-1 underline cursor-pointer">Nuevo producto · Escribir reseña</span>
                  </div>

                  {/* Nutrition */}
                  {Object.keys(formData.nutrition || {}).length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-black text-black text-[10px] tracking-widest uppercase mb-3">Información Nutricional</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(formData.nutrition || {}).map(([k, v]) => (
                          <div key={k} className="bg-gray-50 rounded-xl p-2">
                            <p className="text-[9px] text-gray-400 font-medium">{k || "Nutriente"}</p>
                            <p className="text-sm font-black text-black">{v || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-200 my-1" />

                  {/* Title */}
                  <div>
                    {formData.category && (
                      <p className="text-[#00AAC7] font-black text-[10px] tracking-widest uppercase mb-1">{formData.category}</p>
                    )}
                    <h1 className="text-2xl font-black text-black tracking-tight leading-tight">
                      {formData.name || <span className="text-gray-300">Nombre del producto</span>}
                    </h1>
                  </div>

                  {/* Description */}
                  {formData.description && (
                    <p className="text-gray-500 text-xs leading-relaxed">{formData.description}</p>
                  )}

                  {/* Price */}
                  <div className="text-3xl font-black text-black tracking-tight">
                    {formData.price ? `$${Number(formData.price).toLocaleString()}` : <span className="text-gray-300 text-xl">$0</span>}
                  </div>

                  {/* Flavor selector preview */}
                  {(formData.variants || []).filter(v => (typeof v === 'string' ? v : (v as Variant).name)).length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-black">Selecciona tu sabor</p>
                      {(formData.variants as Variant[] || []).filter(v => v.name).map((v, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2.5 border-2 rounded-xl text-xs font-bold ${i === 0 ? 'border-[#00AAC7] bg-[#00AAC7]/5' : 'border-gray-100'}`}>
                          {v.image && <img src={v.image} alt="" className="w-7 h-7 rounded-md object-cover" />}
                          <span className="text-black">{v.name}</span>
                          {i === 0 && <div className="ml-auto w-3.5 h-3.5 rounded-full bg-[#00AAC7] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add to cart preview */}
                  <div className="space-y-2 pt-1">
                    <div className="w-full py-3.5 bg-black text-white text-[10px] font-black tracking-widest text-center rounded-none">
                      🛒 AGREGAR AL CARRITO — ${formData.price ? Number(formData.price).toLocaleString() : "0"}
                    </div>
                    <div className="w-full py-3 border-2 border-black text-black text-[10px] font-black tracking-widest text-center">
                      COMPRAR AHORA
                    </div>
                  </div>

                  {/* Features preview */}
                  {(formData.features || []).filter(f => f).length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-gray-100">
                      {(formData.features || []).filter(f => f).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#00AAC7]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-3 h-3 text-[#00AAC7]" />
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
