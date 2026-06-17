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
          <div className="relative bg-white w-full max-w-2xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="overflow-y-auto pr-2 scrollbar-hide">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter">
                  {isAdding ? "Nuevo Producto" : "Editar"}
                </h2>
                <button onClick={() => { setEditingId(null); setIsAdding(false); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" /> Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 md:h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs md:text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Categoría
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-11 md:h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs md:text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Precio (MXN)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, "") })}
                      className="w-full h-11 md:h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs md:text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: BEST SELLER"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full h-11 md:h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs md:text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Imagen del Producto
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="flex-1 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-black file:text-white hover:file:bg-[#00AAC7] file:transition-colors text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-[10px] font-black text-gray-300">O PEGA UNA URL:</span>
                    <input
                      type="text"
                      className="flex-1 h-10 px-4 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-[10px] transition-all"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  {!formData.image && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">* Debes subir una imagen o poner una URL</p>
                  )}
                  {formData.image && (
                    <div className="mt-4 rounded-2xl overflow-hidden border-2 border-slate-100 max-w-[200px]">
                      <img src={formData.image} alt="Preview" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Galería Adicional (Opcional)
                    </label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="flex-1 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-gray-100 file:text-black hover:file:bg-black hover:file:text-white file:transition-all text-xs text-gray-400 cursor-pointer"
                      />
                    </div>
                    {formData.images && formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-slate-100 w-20 h-20">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, images: p.images?.filter((_, i) => i !== idx) }))}
                              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Sabores y Variantes (Opcional)
                    </label>
                    <div className="space-y-3">
                      {formData.variants?.map((v, idx) => {
                        const variant = typeof v === 'string' ? { name: v } : v;
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start border border-gray-200 p-3 rounded-xl bg-gray-50/50">
                            <div className="flex-1 w-full space-y-2">
                              <input
                                type="text"
                                placeholder="Nombre (ej. Fresa)"
                                value={variant.name}
                                onChange={(e) => {
                                  const newVars = [...(formData.variants as Variant[] || [])];
                                  newVars[idx] = { ...variant, name: e.target.value };
                                  setFormData({ ...formData, variants: newVars });
                                }}
                                className="w-full h-10 px-3 bg-white border-2 border-transparent rounded-lg focus:border-[#00AAC7] outline-none font-bold text-xs"
                              />
                              <div className="flex gap-2 items-center">
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={(e) => handleVariantImageUpload(e, idx)}
                                  className="flex-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-gray-100 file:text-black hover:file:bg-black hover:file:text-white file:transition-all text-[10px] text-gray-400 cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-gray-300">Ó URL:</span>
                                <input
                                  type="text"
                                  placeholder="URL (Opcional)"
                                  value={variant.image || ""}
                                  onChange={(e) => {
                                    const newVars = [...(formData.variants as Variant[] || [])];
                                    newVars[idx] = { ...variant, image: e.target.value };
                                    setFormData({ ...formData, variants: newVars });
                                  }}
                                  className="w-full h-8 px-2 bg-white border-2 border-transparent rounded-lg focus:border-[#00AAC7] outline-none font-medium text-[10px] text-gray-600"
                                />
                              </div>
                            </div>
                            {variant.image && (
                              <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={variant.image} alt="Sabor" className="w-full h-full object-contain p-1" />
                              </div>
                            )}
                            <button 
                              type="button" 
                              onClick={() => {
                                const newVars = formData.variants?.filter((_, i) => i !== idx);
                                setFormData({ ...formData, variants: newVars });
                              }} 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0 mt-1 sm:mt-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, variants: [...(formData.variants || []), { name: "" }] })}
                        className="w-full h-10 border-2 border-dashed border-gray-300 hover:border-[#00AAC7] hover:bg-[#00AAC7]/5 text-gray-500 hover:text-[#00AAC7] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3 h-3" /> Añadir sabor
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" /> Tallas / Tamaños (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 16 barras, 24 barras (Separados por coma)"
                      value={formData.sizes?.join(", ") || ""}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") })}
                      className="w-full h-12 px-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Nutritional Info */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Información Nutricional
                  </label>
                  <div className="space-y-2">
                    {Object.entries(formData.nutrition || {}).map(([key, value], idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Nombre (ej. Proteína)"
                          value={key}
                          onChange={(e) => {
                            const entries = Object.entries(formData.nutrition || {});
                            entries[idx] = [e.target.value, value];
                            setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                          }}
                          className="flex-1 h-9 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs transition-all"
                        />
                        <span className="text-gray-300 font-bold text-xs">:</span>
                        <input
                          type="text"
                          placeholder="Valor (ej. 20g)"
                          value={value}
                          onChange={(e) => {
                            const entries = Object.entries(formData.nutrition || {});
                            entries[idx] = [key, e.target.value];
                            setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                          }}
                          className="flex-1 h-9 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const entries = Object.entries(formData.nutrition || {}).filter((_, i) => i !== idx);
                            setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                          }}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const entries = Object.entries(formData.nutrition || {});
                        entries.push(["", ""]);
                        setFormData({ ...formData, nutrition: Object.fromEntries(entries) });
                      }}
                      className="w-full h-9 border-2 border-dashed border-gray-300 hover:border-[#00AAC7] hover:bg-[#00AAC7]/5 text-gray-500 hover:text-[#00AAC7] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Añadir nutriente
                    </button>
                  </div>
                </div>

                {/* Features / Benefits */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Características / Beneficios
                  </label>
                  <div className="space-y-2">
                    {(formData.features || []).map((feat, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Ej: 28.5g de proteína por porción"
                          value={feat}
                          onChange={(e) => {
                            const newFeats = [...(formData.features || [])];
                            newFeats[idx] = e.target.value;
                            setFormData({ ...formData, features: newFeats });
                          }}
                          className="flex-1 h-9 px-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeats = (formData.features || []).filter((_, i) => i !== idx);
                            setFormData({ ...formData, features: newFeats });
                          }}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, features: [...(formData.features || []), ""] })}
                      className="w-full h-9 border-2 border-dashed border-gray-300 hover:border-[#00AAC7] hover:bg-[#00AAC7]/5 text-gray-500 hover:text-[#00AAC7] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Añadir característica
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Descripción</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#00AAC7] focus:bg-white outline-none font-bold text-xs resize-none transition-all scrollbar-hide"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8 pb-4">
                  <button
                    type="submit"
                    className="flex-1 h-12 md:h-14 bg-black text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-2xl hover:bg-[#00AAC7] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                  >
                    <Save className="w-4 h-4" /> Guardar Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setIsAdding(false); }}
                    className="flex-1 h-12 md:h-14 bg-slate-100 text-slate-500 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
