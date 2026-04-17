import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingCart, Trash2, ArrowRight, Truck, Gift } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const { navigateTo } = useNavigation();



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Close Button - Top Right */}
            <button
              onClick={closeCart}
              className="absolute top-4 right-4 z-10 p-2 bg-black/80 hover:bg-black rounded-full transition-all hover:scale-110 group"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Header */}
            <div className="bg-black p-6 flex items-center gap-3 border-b border-white/10">
              <div className="bg-[#00AAC7] p-2">
                <ShoppingCart className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  TU CARRITO
                </h2>
                <p className="text-sm text-white/60">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                </p>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-8 rounded-full mb-4">
                    <ShoppingCart className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Agrega productos para comenzar tu compra
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-3 bg-black text-white font-black tracking-wide hover:bg-gray-900 transition-colors"
                  >
                    SEGUIR COMPRANDO
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="bg-gray-50 p-4 border border-gray-200 hover:border-[#00AAC7] transition-colors"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-sm text-gray-900 mb-1 truncate">
                          {item.name}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-gray-600 mb-1">
                            Sabor: {item.variant}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-xs text-gray-600 mb-1">
                            Tamaño: {item.size}
                          </p>
                        )}
                        <p className="text-lg font-black text-[#00AAC7]">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="w-12 text-center font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-6 space-y-4">


                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg pt-3 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-black text-gray-900">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  El envío se calculará en el checkout
                </p>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    closeCart();
                    navigateTo('checkout');
                  }}
                  className="group relative overflow-hidden block w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00AAC7] to-[#00d4ff] transition-transform duration-300 group-hover:scale-105" />
                  <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                    <span className="text-black font-black tracking-wide uppercase">
                      Proceder al Checkout
                    </span>
                    <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full py-3 text-sm font-black text-gray-700 hover:text-black transition-colors"
                >
                  SEGUIR COMPRANDO
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
