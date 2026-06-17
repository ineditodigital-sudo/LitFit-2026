import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Check, Shield, Truck, Award, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "../contexts/NavigationContext";
import { ShareButton } from "../components/ShareButton";
import { useProductReviews, ReviewStars, ReviewSection } from "../components/ProductReviews";

interface ProteinaColagenoProps {
  onBack: () => void;
}

const DEFAULT_FLAVORS = [
  { id: "coco", name: "Coco" },
  { id: "fresa", name: "Fresa" },
  { id: "vainilla", name: "Vainilla" },
];

const DEFAULT_IMAGES = [
  "https://imagenes.inedito.digital/LITFIT/proteina-colageno.webp",
];

const DEFAULT_FEATURES = [
  "20g Proteína + 10g Colágeno",
  "Fórmula exclusiva antiedad",
  "Envío seguro a todo México",
];

const DEFAULT_NUTRITION: Record<string, string> = {
  "Proteína": "20g",
  "Colágeno": "10g",
  "Carbohidratos": "2g",
  "Calorías": "130 kcal",
};

const FEATURE_ICONS = [Shield, Award, Truck];

export function ProteinaColageno({ onBack }: ProteinaColagenoProps) {
  const { addItem } = useCart();
  const { navigateTo } = useNavigation();
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number>(890);
  const [productName, setProductName] = useState("Proteína ISO + Collagen");
  const [description, setDescription] = useState("");
  const [flavors, setFlavors] = useState(DEFAULT_FLAVORS);
  const [productImages, setProductImages] = useState(DEFAULT_IMAGES);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [nutrition, setNutrition] = useState(DEFAULT_NUTRITION);

  const { reviews, avgRating } = useProductReviews("proteina-colageno");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        const products = await response.json();
        const product = products.find((p: any) => p.id === "proteina-colageno");
        if (product) {
          setPrice(Number(product.price));
          if (product.name) setProductName(product.name);
          if (product.description) setDescription(product.description);
          if (product.nutrition && Object.keys(product.nutrition).length > 0) {
            setNutrition(product.nutrition);
          }
          if (product.features && product.features.length > 0) {
            setFeatures(product.features);
          }
          // Load flavors from variants or flavors array
          const rawFlavors = product.variants || product.flavors;
          if (rawFlavors && rawFlavors.length > 0) {
            const mapped = rawFlavors.map((f: any, i: number) => ({
              id: typeof f === 'string' ? f.toLowerCase().replace(/[^a-z0-9]/g, '-') : f.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `flavor-${i}`,
              name: typeof f === 'string' ? f : f.name,
              image: typeof f === 'object' ? f.image : undefined,
            }));
            setFlavors(mapped);
            setSelectedFlavor(mapped[0]?.id || "");
          } else {
            setSelectedFlavor(DEFAULT_FLAVORS[0].id);
          }
          // Load images from images array or main image
          const imgs = product.images && product.images.length > 0 ? product.images : [product.image];
          if (imgs[0]) setProductImages(imgs.filter(Boolean));
        } else {
          setSelectedFlavor(DEFAULT_FLAVORS[0].id);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setSelectedFlavor(DEFAULT_FLAVORS[0].id);
      }
    };
    fetchProduct();
  }, []);

  const selectedFlavorData = flavors.find((f) => f.id === selectedFlavor);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `proteina-colageno-${selectedFlavor}-${Date.now()}-${i}`,
        name: productName,
        price: price,
        image: productImages[0],
        variant: selectedFlavorData?.name,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigateTo('checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Back Button */}
      <div className="max-w-[1400px] mx-auto lg:px-8 pt-[80px] pb-[0px] pr-[24px] pl-[24px] px-[24px] py-[0px]">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-black hover:text-[#00AAC7] transition-colors group mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-wide">VOLVER</span>
        </motion.button>
      </div>

      {/* Product Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT COLUMN: Image Section ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Product Image */}
            <div className="relative aspect-square overflow-hidden bg-white">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={productImages[selectedImageIndex]}
                  alt={productName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] text-black px-3 py-1.5 font-black text-xs tracking-widest shadow-xl flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  PREMIUM
                </div>
              </div>
            </div>

            {/* Image Carousel */}
            {productImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 border-2 transition-all duration-300 overflow-hidden bg-white ${
                      selectedImageIndex === idx
                        ? 'border-[#00AAC7] scale-105'
                        : 'border-gray-200 hover:border-[#00AAC7]/50'
                    }`}
                  >
                    <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Rating */}
            <ReviewStars
              avgRating={avgRating}
              reviewCount={reviews.length}
              onWriteReview={() => {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Nutrition Info - Desktop Only */}
            {Object.keys(nutrition).length > 0 && (
              <div className="hidden lg:block mt-6 bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-200">
                <h3 className="font-black text-black mb-3 tracking-wide text-sm">INFORMACIÓN NUTRICIONAL</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(nutrition).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-gray-500 text-xs">{key}</p>
                      <p className="font-bold text-black">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* ── RIGHT COLUMN: Product Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            {/* Title & Share */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight">
                {productName}
              </h1>
              <ShareButton
                title={`LITFIT - ${productName}`}
                text={description || "Fórmula revolucionaria que combina proteína de suero premium con colágeno hidrolizado."}
              />
            </div>

            {description && (
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">{description}</p>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-black tracking-tight">${price}</span>
              </div>
            </div>

            {/* Flavor Selector */}
            {flavors.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-black text-black mb-3 tracking-wide">
                  SELECCIONA TU SABOR
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {flavors.map((flavor) => (
                    <button
                      key={flavor.id}
                      onClick={() => setSelectedFlavor(flavor.id)}
                      className={`relative p-3 border-2 transition-all duration-300 ${
                        selectedFlavor === flavor.id
                          ? "border-[#00AAC7] bg-[#00AAC7]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-black">{flavor.name}</span>
                      </div>
                      {selectedFlavor === flavor.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-[#00AAC7]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-xs font-black text-black mb-3 tracking-wide">CANTIDAD</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-gray-300 hover:border-[#00AAC7] transition-colors font-black text-lg"
                >-</button>
                <span className="text-xl font-black min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-300 hover:border-[#00AAC7] transition-colors font-black text-lg"
                >+</button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-black hover:bg-[#00AAC7] text-white py-4 font-black text-xs tracking-widest transition-all duration-300 shadow-lg hover:shadow-2xl mb-3 flex items-center justify-center gap-2 group"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              AGREGAR AL CARRITO - ${(price * quantity).toLocaleString()}
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full border-2 border-black text-black hover:bg-black hover:text-white py-4 font-black text-xs tracking-widest transition-all duration-300"
            >
              COMPRAR AHORA
            </button>

            {/* Features */}
            {features.length > 0 && (
              <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
                {features.map((feat, index) => {
                  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
                  return (
                    <div key={index} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#00AAC7]/10 flex items-center justify-center rounded-full flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#00AAC7]" />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">{feat}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Nutrition Info - Mobile Only */}
            {Object.keys(nutrition).length > 0 && (
              <div className="lg:hidden mt-6 bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-200">
                <h3 className="font-black text-black mb-3 tracking-wide text-sm">INFORMACIÓN NUTRICIONAL</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(nutrition).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-gray-500 text-xs">{key}</p>
                      <p className="font-bold text-black">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Dynamic Reviews */}
        <div id="reviews-section" className="mt-16">
          <ReviewSection productId="proteina-colageno" reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
