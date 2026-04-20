import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function CartButton() {
  const { openCart, totalItems } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2 hover:bg-white/10 rounded-lg transition-colors group"
      aria-label="Abrir carrito"
    >
      <ShoppingCart className="w-6 h-6 text-white group-hover:text-[#00AAC7] transition-colors" />
      
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-[#00AAC7] text-black text-xs font-black rounded-full w-5 h-5 flex items-center justify-center"
          >
            {totalItems > 9 ? '9+' : totalItems}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
