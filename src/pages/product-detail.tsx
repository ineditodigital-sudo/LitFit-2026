import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Star, Zap, Truck, Users, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "../contexts/NavigationContext";
import { ShareButton } from "../components/ShareButton";

export interface Variant {
  name: string;
  image?: string;
  available?: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  image: string;
  images?: string[];
  badge?: string;
  description: string;
  flavors?: string[];
  variants?: (string | Variant)[];
  sizes?: string[];
  nutrition?: Record<string, string>;
}

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const { addItem } = useCart();
  const { navigateTo } = useNavigation();
  const [product, setProduct] = useState<Product | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const [loading, setLoading] = useState(true);
  
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        const data: any = await response.json();
        
        let found = Array.isArray(data) ? data.find(p => p.id === productId) : (data.id === productId ? data : null);

        if (!found && productId === 'test-pago-real') {
          found = {
            id: "test-pago-real",
            name: "PRODUCTO DE PRUEBA $15",
            category: "TEST",
            description: "Usa este producto para realizar una prueba con dinero real ($15 MXN) y verificar que la guía de envío se genera automáticamente. Incluye ENVÍO GRATIS.",
            price: "15",
            image: "https://imagenes.inedito.digital/LITFIT/BARRASPAGINA-13.jpg",
          };
        }

        if (found) {
          setProduct({
            ...found,
            price: Number(found.price),
            variants: found.flavors || found.variants || []
          });
          const vars = found.variants || found.flavors || [];
          if (vars.length > 0) {
            const normalized = vars.map((v: any) => typeof v === 'string' ? { name: v } : v);
            const firstAvailable = normalized.find((v: any) => v.available !== false) || normalized[0];
            setSelectedFlavor(firstAvailable.name);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`https://litfitmexico.com/envios/api-reviews.php?product_id=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch("https://litfitmexico.com/envios/api-reviews.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          ...reviewForm
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowReviewModal(false);
        setReviewForm({ author: '', rating: 5, comment: '' });
      } else {
        toast.error(data.message || "Error al enviar reseña");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-4xl font-black text-gray-200 tracking-tighter">
        CARGANDO...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-black mb-4">Producto no encontrado</h2>
        <button onClick={onBack} className="text-[#00AAC7] uppercase font-bold text-sm">Volver al inicio</button>
      </div>
    );
  }

  // Galeria: la imagen principal primero y luego las adicionales del admin.
  const baseImages = [product.image, ...(product.images || [])]
    .filter(Boolean)
    .filter((img, i, arr) => arr.indexOf(img) === i);

  const normalizedVariants: Variant[] = (product.variants || product.flavors || []).map(v => 
    typeof v === 'string' ? { name: v } : v
  );

  const allImages = [...baseImages];
  const variantImageIndices: Record<string, number> = {};

  normalizedVariants.forEach(v => {
    if (v.image) {
      const existingIdx = allImages.indexOf(v.image);
      if (existingIdx !== -1) {
        variantImageIndices[v.name] = existingIdx;
      } else {
        variantImageIndices[v.name] = allImages.length;
        allImages.push(v.image);
      }
    }
  });

  const selectedFlavorAvailable = normalizedVariants.length === 0 || normalizedVariants.find(v => v.name === selectedFlavor)?.available !== false;

  const handleAddToCart = () => {
    if ((product as any).available === false || !selectedFlavorAvailable) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${product.id}-${selectedFlavor || 'default'}-${Date.now()}-${i}`,
        name: product.name,
        price: Number(product.price),
        image: allImages[selectedImageIndex] || product.image,
        variant: selectedFlavor || undefined,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigateTo('checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-[80px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-black hover:text-[#00AAC7] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-wide">VOLVER</span>
        </motion.button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* SECCIÓN DE IMAGEN */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative">
            <div className="relative aspect-square overflow-hidden bg-white rounded-3xl border-2 border-slate-100">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={allImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {product.badge && (
                <div className="absolute top-4 right-4 bg-[#00AAC7] text-black px-3 py-1.5 font-black text-xs tracking-widest shadow-xl uppercase">
                  {product.badge}
                </div>
              )}
            </div>

            {/* CARRUSEL DE IMÁGENES */}
            {allImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-xl transition-all duration-300 overflow-hidden bg-white ${
                      selectedImageIndex === idx ? 'border-[#00AAC7] scale-105 shadow-md' : 'border-gray-200 hover:border-[#00AAC7]/50'
                    }`}
                  >
                    <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
            
            {/* VALORACIÓN */}
            <div className="flex items-center gap-3 mt-4 px-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-[#00AAC7] text-[#00AAC7]' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {reviews.length > 0 ? `${avgRating} (${reviews.length} reseñas)` : 'Nuevo producto'}
              </span>
              <button 
                onClick={() => setShowReviewModal(true)}
                className="text-xs font-bold text-[#00AAC7] hover:underline ml-2"
              >
                Escribir reseña
              </button>
            </div>

            {/* TABLA NUTRICIONAL (SI EXISTE) */}
            {product.nutrition && Object.keys(product.nutrition).length > 0 && (
              <div className="hidden lg:block mt-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                <h3 className="font-black text-black mb-4 tracking-wide text-sm">INFORMACIÓN NUTRICIONAL</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(product.nutrition).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">{key}</p>
                      <p className="font-black text-black text-lg">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl lg:text-5xl font-black text-black tracking-tight uppercase">
                {product.name}
              </h1>
              <ShareButton
                title={`LITFIT - ${product.name}`}
                text={product.description}
                url={`${window.location.origin}/?p=${product.id}`}
              />
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm lg:text-base font-medium">
              {product.description}
            </p>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl lg:text-5xl font-black tracking-tighter text-[#00AAC7]">
                ${product.price}
              </span>
              <span className="text-sm text-gray-500 font-bold mb-2">MXN</span>
            </div>

            {/* SELECTOR DE SABOR DINÁMICO */}
            {(() => {
              if (normalizedVariants.length === 0) return null;
              const flavorList = normalizedVariants;

              return (
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="font-black text-sm tracking-wide uppercase">SELECCIONA TU SABOR</h3>
                    <span className="text-xs font-bold text-[#00AAC7] uppercase">{selectedFlavor || flavorList[0].name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {flavorList.map((flavor) => {
                      const isOut = flavor.available === false;
                      return (
                        <button
                          key={flavor.name}
                          disabled={isOut}
                          onClick={() => {
                            setSelectedFlavor(flavor.name);
                            if (variantImageIndices[flavor.name] !== undefined) {
                              setSelectedImageIndex(variantImageIndices[flavor.name]);
                            } else {
                              // No image for this flavor, show main product image
                              setSelectedImageIndex(0);
                            }
                          }}
                          className={`relative p-3 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-2 group ${
                            isOut
                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              : (selectedFlavor || flavorList[0].name) === flavor.name
                                ? 'border-[#00AAC7] bg-[#00AAC7]/5'
                                : 'border-gray-200 hover:border-[#00AAC7]/50 bg-white'
                          }`}
                        >
                          <span className={`text-[12px] font-black uppercase text-center transition-colors ${
                            isOut
                              ? 'text-gray-400 line-through'
                              : (selectedFlavor || flavorList[0].name) === flavor.name ? 'text-[#00AAC7]' : 'text-gray-900 group-hover:text-black'
                          }`}>
                            {flavor.name}
                          </span>
                          {isOut ? (
                            <span className="absolute top-1 right-2 text-[8px] font-black text-red-500 uppercase tracking-widest">Agotado</span>
                          ) : (selectedFlavor || flavorList[0].name) === flavor.name && (
                             <div className="absolute top-1 right-2">
                               <div className="w-1.5 h-1.5 bg-[#00AAC7] rounded-full" />
                             </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* CANTIDAD Y BOTONES */}
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-2xl bg-white w-32 h-14">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-black text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors rounded-r-xl"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={(product as any).available === false || !selectedFlavorAvailable}
                  className="flex-1 bg-black hover:bg-gray-900 text-white font-black tracking-wide text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-black/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {(product as any).available === false || !selectedFlavorAvailable ? "AGOTADO" : "AGREGAR AL CARRITO"}
                </button>
              </div>

              {(product as any).available === false ? (
                <div className="w-full py-3 bg-red-50 border-2 border-red-200 text-red-600 font-black text-sm tracking-widest text-center uppercase rounded-2xl">
                  Producto agotado por el momento
                </div>
              ) : !selectedFlavorAvailable && (
                <div className="w-full py-3 bg-red-50 border-2 border-red-200 text-red-600 font-black text-sm tracking-widest text-center uppercase rounded-2xl">
                  Este sabor está agotado
                </div>
              )}
              <button
                onClick={handleBuyNow}
                disabled={(product as any).available === false || !selectedFlavorAvailable}
                className="w-full h-14 bg-[#00AAC7] hover:bg-[#0091AB] text-white font-black tracking-wide text-sm rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-[#00AAC7]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#00AAC7]"
              >
                COMPRAR AHORA
              </button>
            </div>

            {/* BULLET POINTS */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#00AAC7]" />
                </div>
                <div>
                  <h4 className="font-black text-black">Máxima Calidad</h4>
                  <p className="text-gray-500 font-medium">Ingredientes premium seleccionados.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-black text-black">A Todo México</h4>
                  <p className="text-gray-500 font-medium">Envíos rápidos y seguros.</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
        {/* RESEÑAS */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-black tracking-tighter uppercase italic">Reseñas del Producto</h2>
              <p className="text-gray-500 font-medium">Lo que dicen nuestros clientes</p>
            </div>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="bg-[#0F172A] text-white px-6 py-3 font-bold text-xs tracking-widest uppercase hover:bg-black transition-colors"
            >
              Escribir una reseña
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center border-2 border-dashed border-gray-200">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-gray-50 p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-black uppercase">{review.author}</h4>
                      <p className="text-xs text-gray-500 font-medium">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex text-[#00AAC7]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current text-[#00AAC7]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Escribir Reseña */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 md:p-8 max-w-md w-full relative"
          >
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black uppercase italic mb-6">Escribir Reseña</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tu Calificación</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                      className={`transition-colors ${star <= reviewForm.rating ? 'text-[#00AAC7]' : 'text-gray-300'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tu Nombre</label>
                <input 
                  type="text" 
                  required
                  value={reviewForm.author}
                  onChange={e => setReviewForm(p => ({ ...p, author: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 outline-none focus:border-[#00AAC7] transition-colors font-medium text-sm"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Comentario (Opcional)</label>
                <textarea 
                  rows={4}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 outline-none focus:border-[#00AAC7] transition-colors font-medium text-sm resize-none"
                  placeholder="¿Qué te pareció el producto?"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-[#00AAC7] text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-[#00d4ff] transition-colors flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? "Enviando..." : "Enviar Reseña"}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4">Tu reseña será revisada antes de ser publicada.</p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
