import { useState } from "react";
import { ArrowLeft, ShoppingCart, Check, Star, Zap, Truck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "../contexts/NavigationContext";

interface BarrasEnergeticasProps {
  onBack: () => void;
}

const flavors = [
  { id: "surtido", name: "Surtido", color: "#9333EA", image: "https://imagenes.inedito.digital/LITFIT/4-sabores.webp" },
  { id: "choco-peanutbutter", name: "Choco-Peanutbutter", color: "#00AAC7", image: "https://imagenes.inedito.digital/LITFIT/peanut-butter.webp" },
  { id: "chocolate-truffle", name: "Chocolate Truffle", color: "#8B5A3C", image: "https://imagenes.inedito.digital/LITFIT/trufa.webp" },
  { id: "tiramisu", name: "Tiramisú", color: "#DC2626", image: "https://imagenes.inedito.digital/LITFIT/tiramisu.webp" },
  { id: "vainilla", name: "Almond-Vainilla", color: "#EAB308", image: "https://imagenes.inedito.digital/LITFIT/vainilla.webp" },
];

const packageSizes = [
  { id: "16", name: "16 barras", price: 560, pricePerBar: "35.00" },
  { id: "24", name: "24 barras", price: 790, pricePerBar: "32.92" },
];

const productImages = [
  "https://imagenes.inedito.digital/LITFIT/4-sabores.webp",
  "https://imagenes.inedito.digital/LITFIT/peanut-butter.webp",
  "https://imagenes.inedito.digital/LITFIT/trufa.webp",
  "https://imagenes.inedito.digital/LITFIT/tiramisu.webp",
  "https://imagenes.inedito.digital/LITFIT/vainilla.webp",
];

const features = [
  { icon: Zap, text: "Mas proteína por barra" },
  { icon: Truck, text: "Envíos gratis en compras de $1000 o más" },
  { icon: Users, text: "Recomendado por atletas" },
];

export function BarrasEnergeticas({ onBack }: BarrasEnergeticasProps) {
  const { addItem } = useCart();
  const { navigateTo } = useNavigation();
  const [selectedFlavor, setSelectedFlavor] = useState("surtido");
  const [selectedPackage, setSelectedPackage] = useState("24");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedFlavorData = flavors.find((f) => f.id === selectedFlavor);
  const selectedPackageData = packageSizes.find((p) => p.id === selectedPackage);

  const currentPrice = selectedPackageData?.price || 600;

  const handleFlavorChange = (flavorId: string) => {
    setSelectedFlavor(flavorId);
    // Actualizar la imagen principal cuando se selecciona un sabor
    const flavorData = flavors.find((f) => f.id === flavorId);
    if (flavorData) {
      const imageIndex = productImages.findIndex(img => img === flavorData.image);
      if (imageIndex !== -1) {
        setSelectedImageIndex(imageIndex);
      }
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `barras-${selectedFlavor}-${selectedPackage}-${Date.now()}-${i}`,
        name: `Barras de Proteína`,
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
          {/* Image Section */}
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
                  alt={`LITFIT Energy Bars`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-[#00AAC7] text-black px-3 py-1.5 font-black text-xs tracking-widest shadow-xl">
                  BEST SELLER
                </div>
              </div>
            </div>

            {/* Image Carousel */}
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
                  <img
                    src={img}
                    alt={`Vista ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00AAC7] text-[#00AAC7]" />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                4.9 <span className="text-gray-400">(2,847 reviews)</span>
              </span>
            </div>

            {/* Nutrition Info - Desktop Only */}
            <div className="hidden lg:block mt-6 bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-200">
              <h3 className="font-black text-black mb-3 tracking-wide text-sm">INFORMACIÓN NUTRICIONAL</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Calorías</p>
                  <p className="font-bold text-black">210 kcal</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Proteína</p>
                  <p className="font-bold text-black">12g</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Carbohidratos</p>
                  <p className="font-bold text-black">28g</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Grasas</p>
                  <p className="font-bold text-black">6g</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black text-black mb-3 tracking-tight">
              Barras de Proteína
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-4 leading-relaxed text-sm">
              30gr. De proteína por porción + 5gr de bcaas que favorecen a una pronta recuperación.
            </p>

            {/* Package Size Selector */}
            <div className="mb-6">
              <label className="block text-xs font-black text-black mb-3 tracking-wide">
                TAMAÑO DEL PAQUETE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {packageSizes.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-3 border-2 transition-all duration-300 ${
                      selectedPackage === pkg.id
                        ? "border-[#00AAC7] bg-[#00AAC7]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-black">{pkg.name}</span>
                      <span className="text-xs text-gray-500">${pkg.price}</span>
                    </div>
                    {selectedPackage === pkg.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-[#00AAC7]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-black tracking-tight">${currentPrice}</span>
              </div>
            </div>

            {/* Flavor Selector */}
            <div className="mb-6">
              <label className="block text-xs font-black text-black mb-3 tracking-wide">
                SELECCIONA TU SABOR
              </label>
              <div className="grid grid-cols-2 gap-2">
                {flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => handleFlavorChange(flavor.id)}
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

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-xs font-black text-black mb-3 tracking-wide">
                CANTIDAD
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-gray-300 hover:border-[#00AAC7] transition-colors font-black text-lg"
                >
                  -
                </button>
                <span className="text-xl font-black min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-300 hover:border-[#00AAC7] transition-colors font-black text-lg"
                >
                  +
                </button>
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
            <div className="mt-6 space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#00AAC7]/10 flex items-center justify-center rounded-full flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#00AAC7]" />
                    </div>
                    <span className="text-xs text-gray-700 font-medium">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Nutrition Info - Mobile Only */}
            <div className="lg:hidden mt-6 bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-200">
              <h3 className="font-black text-black mb-3 tracking-wide text-sm">INFORMACIÓN NUTRICIONAL</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Calorías</p>
                  <p className="font-bold text-black">210 kcal</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Proteína</p>
                  <p className="font-bold text-black">12g</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Carbohidratos</p>
                  <p className="font-bold text-black">28g</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Grasas</p>
                  <p className="font-bold text-black">6g</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
