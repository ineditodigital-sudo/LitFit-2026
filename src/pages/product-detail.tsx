import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Star, Zap, Truck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "../contexts/NavigationContext";

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
  const [loading, setLoading] = useState(true);
  
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        const data: Product[] = await response.json();
        
        // Búsqueda del producto
        let found = data.find(p => p.id === productId);

        // FORZADO PARA PRUEBAS LOCALES: Si es el producto de prueba y no está en la API aún
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
          setProduct(found);
          if (found.flavors && found.flavors.length > 0) {
            setSelectedFlavor(found.flavors[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

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

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
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
                  <Star key={i} className="w-4 h-4 fill-[#00AAC7] text-[#00AAC7]" />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">Nuevo producto</span>
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
            <h1 className="text-3xl lg:text-5xl font-black text-black mb-2 tracking-tight uppercase">
              {product.name}
            </h1>
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
              let flavorList: string[] = [];
              
              // Si es un producto de Barras de Proteína, forzamos la lista exacta de tu captura
              if (product.name.toLowerCase().includes('barras')) {
                flavorList = ["Surtido", "Choco-Peanutbutter", "Chocolate Truffle", "Tiramisú", "Almond-Vainilla"];
              }
              // Para otros productos, intentamos los métodos dinámicos
              else if (Array.isArray(product.flavors) && product.flavors.length > 0) {
                flavorList = product.flavors;
              } 
              else if (typeof product.flavors === 'string' && (product.flavors as string).length > 0) {
                flavorList = (product.flavors as string).split(',').map(f => f.trim()).filter(f => f !== "");
              }

              if (flavorList.length === 0) return null;

              return (
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="font-black text-sm tracking-wide uppercase">SELECCIONA TU SABOR</h3>
                    <span className="text-xs font-bold text-[#00AAC7] uppercase">{selectedFlavor || flavorList[0]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {flavorList.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`relative p-3 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-2 group ${
                          (selectedFlavor || flavorList[0]) === flavor
                            ? 'border-[#00AAC7] bg-[#00AAC7]/5'
                            : 'border-gray-200 hover:border-[#00AAC7]/50 bg-white'
                        }`}
                      >
                        <span className={`text-[12px] font-black uppercase text-center transition-colors ${
                          (selectedFlavor || flavorList[0]) === flavor ? 'text-[#00AAC7]' : 'text-gray-900 group-hover:text-black'
                        }`}>
                          {flavor}
                        </span>
                        {(selectedFlavor || flavorList[0]) === flavor && (
                           <div className="absolute top-1 right-2">
                             <div className="w-1.5 h-1.5 bg-[#00AAC7] rounded-full" />
                           </div>
                        )}
                      </button>
                    ))}
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
                  className="flex-1 bg-black hover:bg-gray-900 text-white font-black tracking-wide text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-black/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  AGREGAR AL CARRITO
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full h-14 bg-[#00AAC7] hover:bg-[#0091AB] text-white font-black tracking-wide text-sm rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-[#00AAC7]/20"
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
      </div>
    </div>
  );
}
