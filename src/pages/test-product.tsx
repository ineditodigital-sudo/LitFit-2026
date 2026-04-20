import { ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { motion } from "motion/react";

interface TestProductProps {
  onBack: () => void;
}

export function TestProduct({ onBack }: TestProductProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: "test-product",
      name: "🚀 PRODUCTO DE PRUEBA",
      price: 0, // Gratutito para pruebas
      quantity: 1,
      image: "https://imagenes.inedito.digital/LITFIT/BARRASPAGINA-13.jpg",
      variant: "Prueba Técnica" /*, size: "Único" */
    });
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-[30px] border border-gray-100 shadow-xl"
      >
         <h1 className="text-3xl font-black uppercase text-black mb-4">Producto de Prueba</h1>
         <p className="text-sm font-medium text-gray-500 mb-8">
           Agrega este producto de $0 MXN a tu carrito para probar todo el flujo de checkout, correos (notificaciones) y sincronización con Envíos Internacionales sin hacer un pago real en MercadoPago.
         </p>
         
         <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-3 bg-[#00AAC7] hover:bg-[#0091AB] text-white py-4 px-6 rounded-2xl font-black uppercase text-sm tracking-wider shadow-lg transition-transform hover:scale-[1.02]"
         >
           <ShoppingCart className="w-5 h-5" />
           AGREGAR AL CARRITO ($0)
         </button>

         <button
            onClick={onBack}
            className="mt-6 w-full text-black font-black uppercase text-xs hover:text-[#00AAC7]"
         >
           VOLVER AL INICIO
         </button>
      </motion.div>
    </div>
  );
}
