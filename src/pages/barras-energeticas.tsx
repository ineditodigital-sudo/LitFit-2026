import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Check, Zap, Truck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "../contexts/NavigationContext";
import { ShareButton } from "../components/ShareButton";
import { useProductReviews, ReviewStars, ReviewSection } from "../components/ProductReviews";

interface BarrasEnergeticasProps {
  onBack: () => void;
}

const DEFAULT_FLAVORS = [
  { id: "surtido", name: "Surtido", image: "https://imagenes.inedito.digital/LITFIT/4-sabores.webp" },
  { id: "choco-peanutbutter", name: "Choco-Peanutbutter", image: "https://imagenes.inedito.digital/LITFIT/peanut-butter.webp" },
  { id: "chocolate-truffle", name: "Chocolate Truffle", image: "https://imagenes.inedito.digital/LITFIT/trufa.webp" },
  { id: "tiramisu", name: "Tiramisú", image: "https://imagenes.inedito.digital/LITFIT/tiramisu.webp" },
  { id: "vainilla", name: "Almond-Vainilla", image: "https://imagenes.inedito.digital/LITFIT/vainilla.webp" },
  { id: "fresa", name: "Strawberry Milkshake", image: "https://imagenes.inedito.digital/LITFIT/fresa.webp" },
];

const DEFAULT_IMAGES = [
  "https://imagenes.inedito.digital/LITFIT/4-sabores.webp",
  "https://imagenes.inedito.digital/LITFIT/peanut-butter.webp",
  "https://imagenes.inedito.digital/LITFIT/trufa.webp",
  "https://imagenes.inedito.digital/LITFIT/tiramisu.webp",
  "https://imagenes.inedito.digital/LITFIT/vainilla.webp",
  "https://imagenes.inedito.digital/LITFIT/fresa.webp",
];

const DEFAULT_FEATURES = [
  "Más proteína por barra",
  "Envíos seguros a todo México",
  "Recomendado por atletas",
];

const DEFAULT_NUTRITION: Record<string, string> = {
  "Calorías": "210 kcal",
  "Proteína": "12g",
  "Carbohidratos": "28g",
  "Grasas": "6g",
};

const FEATURE_ICONS = [Zap, Truck, Users];

export function BarrasEnergeticas({ onBack }: BarrasEnergeticasProps) {
  const { addItem } = useCart();
  const { navigateTo } = useNavigation();
  const [selectedFlavor, setSelectedFlavor] = useState("surtido");
  const [selectedPackage, setSelectedPackage] = useState("24");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [prices, setPrices] = useState({ 16: 560, 24: 790 });
  const [productName, setProductName] = useState("Barras de Proteína");
  const [description, setDescription] = useState("");
  const [flavors, setFlavors] = useState(DEFAULT_FLAVORS);
  const [productImages, setProductImages] = useState(DEFAULT_IMAGES);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [nutrition, setNutrition] = useState(DEFAULT_NUTRITION);

  const { reviews, avgRating } = useProductReviews("barras-energeticas");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`);
        const products = await response.json();

        // Main barras product for name, description, features, nutrition
        const mainProduct = products.find((p: any) => p.id === "barras-energeticas");
        // Price products
        const p24Data = products.find((p: any) => p.name?.includes("24 pzs") || p.id === "barras-energeticas");
        const p16Data = products.find((p: any) => p.name?.includes("16 pzs"));

        if (mainProduct) {
          if (mainProduct.name) setProductName(mainProduct.name);
          if (mainProduct.description) setDescription(mainProduct.description);
          if (mainProduct.nutrition && Object.keys(mainProduct.nutrition).length > 0) {
            setNutrition(mainProduct.nutrition);
          }
          if (mainProduct.features && mainProduct.features.length > 0) {
            setFeatures(mainProduct.features);
          }
          // Load flavors/variants with images from admin
          const rawFlavors = mainProduct.variants || mainProduct.flavors;
          if (rawFlavors && rawFlavors.length > 0) {
            const mapped = rawFlavors.map((f: any, i: number) => ({
              id: typeof f === 'string'
                ? f.toLowerCase().replace(/[^a-z0-9]/g, '-')
                : f.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `flavor-${i}`,
              name: typeof f === 'string' ? f : f.name,
              image: typeof f === 'object' ? f.image : undefined,
            }));
            setFlavors(mapped);
            setSelectedFlavor(mapped[0]?.id || "surtido");
            // Build images array from flavor images
            const flavorImages = mapped.filter((f: any) => f.image).map((f: any) => f.image);
            if (flavorImages.length > 0) {
              setProductImages(flavorImages);
            } else if (mainProduct.images && mainProduct.images.length > 0) {
              setProductImages(mainProduct.images);
            } else if (mainProduct.image) {
              setProductImages([mainProduct.image]);
            }
          }
        }

        // Update prices
        if (p24Data || p16Data) {
          const p16 = p16Data
            ? Number(p16Data.price)
            : (p24Data ? Math.round(Number(p24Data.price) * (560 / 790)) : 560);
          const p24 = p24Data
            ? Number(p24Data.price)
            : Math.round(p16 * (790 / 560));
          setPrices({ 16: p16, 24: p24 });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchProduct();
  }, []);

  // Sync flavor from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flavorParam = params.get('flavor');
    if (flavorParam && flavors.some(f => f.id === flavorParam)) {
      setSelectedFlavor(flavorParam);
      const flavorData = flavors.find((f) => f.id === flavorParam);
      if (flavorData?.image) {
        const imageIndex = productImages.indexOf(flavorData.image);
        if (imageIndex !== -1) setSelectedImageIndex(imageIndex);
      }
    }
  }, [flavors, productImages]);

  const packageSizes = [
    { id: "16", name: "16 barras", price: prices[16], pricePerBar: (prices[16] / 16).toFixed(2) },
    { id: "24", name: "24 barras", price: prices[24], pricePerBar: (prices[24] / 24).toFixed(2) },
  ];

  const selectedFlavorData = flavors.find((f) => f.id === selectedFlavor);
  const selectedPackageData = packageSizes.find((p) => p.id === selectedPackage);
  const currentPrice = selectedPackageData?.price || 790;

  const handleFlavorChange = (flavorId: string) => {
    setSelectedFlavor(flavorId);
    const flavorData = flavors.find((f) => f.id === flavorId);
    if (flavorData?.image) {
      const imageIndex = productImages.indexOf(flavorData.image);
      if (imageIndex !== -1) setSelectedImageIndex(imageIndex);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `barras-${selectedFlavor}-${selectedPackage}-${Date.now()}-${i}`,
        name: productName,
        price: currentPrice,
        image: selectedFlavorData?.image || productImages[0],
        variant: selectedFlavorData?.name,
        size: selectedPackageData?.name,
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

          {/* ── LEFT COLUMN: Image ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden bg-white">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={productImages[selectedImageIndex]}
                  alt={selectedFlavorData?.name || productName}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Flavor Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      // Sync flavor if possible
                      const matchFlavor = flavors.find(f => f.image === img);
                      if (matchFlavor) setSelectedFlavor(matchFlavor.id);
                    }}
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

            {/* Nutrition - Desktop */}
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
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight">
                {productName}
              </h1>
              <ShareButton
                title={`LITFIT - ${productName}`}
                text={description || "30gr. De proteína por porción + 5gr de bcaas para una pronta recuperación."}
              />
            </div>

            {description && (
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">{description}</p>
            )}

            {/* Package Size Selector */}
            <div className="mb-6">
              <label className="block text-xs font-black text-black mb-3 tracking-wide">
                SELECCIONA TU PAQUETE
              </label>
              <div className="grid grid-cols-2 gap-3">
                {packageSizes.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-4 border-2 transition-all duration-300 text-left ${
                      selectedPackage === pkg.id
                        ? "border-[#00AAC7] bg-[#00AAC7]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-black text-sm text-black">{pkg.name}</div>
                    <div className="text-2xl font-black text-black mt-1">${pkg.price}</div>
                    <div className="text-xs text-gray-500 font-medium">${pkg.pricePerBar}/barra</div>
                    {selectedPackage === pkg.id && (
                      <div className="mt-2 text-[#00AAC7]">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
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
                      onClick={() => handleFlavorChange(flavor.id)}
                      className={`relative p-3 border-2 transition-all duration-300 flex items-center gap-3 ${
                        selectedFlavor === flavor.id
                          ? "border-[#00AAC7] bg-[#00AAC7]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {flavor.image && (
                        <img
                          src={flavor.image}
                          alt={flavor.name}
                          className="w-10 h-10 object-cover rounded-sm flex-shrink-0"
                        />
                      )}
                      <span className="font-bold text-xs text-black">{flavor.name}</span>
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

            {/* Quantity */}
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
              AGREGAR AL CARRITO - ${(currentPrice * quantity).toLocaleString()}
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

            {/* Nutrition - Mobile */}
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

        {/* Reviews */}
        <div id="reviews-section" className="mt-16">
          <ReviewSection productId="barras-energeticas" reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
