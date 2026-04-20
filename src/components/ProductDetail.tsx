import { ShoppingCart, Heart, Share2, Check, Truck, Shield, Award } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ProductDetailProps {
  name: string;
  description: string;
  price: string;
  oldPrice?: string;
  image: string;
  images?: string[];
  features: string[];
  benefits: string[];
  nutritionalInfo?: {
    label: string;
    value: string;
  }[];
  ingredients: string;
  variants?: {
    name: string;
    options: string[];
  }[];
}

export function ProductDetail({
  name,
  description,
  price,
  oldPrice,
  image,
  images = [],
  features,
  benefits,
  nutritionalInfo,
  ingredients,
  variants = [],
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const allImages = [image, ...images];

  const handleVariantChange = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8 text-gray-600">
            <a href="/" className="hover:text-[#00AAC7]">Inicio</a>
            <span className="mx-2">/</span>
            <a href="/#productos" className="hover:text-[#00AAC7]">Productos</a>
            <span className="mx-2">/</span>
            <span className="text-black">{name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="sticky top-32">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100">
                  <img
                    src={allImages[selectedImage]}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-[#00AAC7] hover:text-white transition-all duration-300 shadow-lg">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
                
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          selectedImage === index
                            ? "border-[#00AAC7]"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl mb-4">{name}</h1>
              <p className="text-xl text-gray-600 mb-6">{description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-5xl text-black">{price}</span>
                {oldPrice && (
                  <span className="text-2xl text-gray-400 line-through">{oldPrice}</span>
                )}
              </div>

              {/* Variants */}
              {variants.map((variant) => (
                <div key={variant.name} className="mb-6">
                  <label className="block mb-3">{variant.name}</label>
                  <div className="flex flex-wrap gap-3">
                    {variant.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleVariantChange(variant.name, option)}
                        className={`px-6 py-3 rounded-lg border-2 transition-all duration-300 ${
                          selectedVariants[variant.name] === option
                            ? "border-[#00AAC7] bg-[#00AAC7] text-white"
                            : "border-gray-300 hover:border-[#00AAC7]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-8">
                <label className="block mb-3">Cantidad</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-[#00AAC7] transition-colors"
                  >
                    -
                  </button>
                  <span className="text-2xl w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-[#00AAC7] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 mb-8">
                <button className="flex-1 bg-[#00AAC7] text-white px-8 py-4 rounded-lg hover:bg-[#008ca8] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-lg">
                  <ShoppingCart className="w-6 h-6" />
                  Agregar al Carrito
                </button>
                <button className="w-14 h-14 border-2 border-gray-300 rounded-lg hover:border-[#00AAC7] hover:text-[#00AAC7] transition-all duration-300 flex items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-[#00AAC7]" />
                  <p className="text-sm text-gray-600">Envío Gratis</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-[#00AAC7]" />
                  <p className="text-sm text-gray-600">Compra Segura</p>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-[#00AAC7]" />
                  <p className="text-sm text-gray-600">Calidad Premium</p>
                </div>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl mb-4">Características</h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#00AAC7] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl mb-6">Beneficios</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#00AAC7] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutritional Info */}
            {nutritionalInfo && (
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl mb-6">Información Nutricional</h3>
                <div className="space-y-3">
                  {nutritionalInfo.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-700">{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl mb-6">Ingredientes</h3>
              <p className="text-gray-700">{ingredients}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
