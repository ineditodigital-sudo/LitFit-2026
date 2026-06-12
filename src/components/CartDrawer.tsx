import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingCart, Trash2, ArrowRight, Truck, Gift, Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, addItem, subtotal, discountAmount, finalTotal, totalItems, appliedCoupon, applyCoupon, removeCoupon, promoGift } = useCart();
  const { navigateTo } = useNavigation();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const hasGift = promoGift?.enabled ? items.some(item => item.isGift) : false;
  const progress = promoGift?.enabled ? Math.min((subtotal / promoGift.threshold) * 100, 100) : 0;
  const remainingForGift = promoGift?.enabled ? promoGift.threshold - subtotal : 0;

  const handleAddGift = () => {
    if (promoGift?.enabled && promoGift.product && !hasGift && subtotal >= promoGift.threshold) {
      if (appliedCoupon && !appliedCoupon.allow_shaker) {
        toast.error("Tu cupón actual no permite combinar con artículos de regalo.");
        return;
      }
      addItem(promoGift.product);
      toast.success(`¡${promoGift.product.name} añadido!`);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await fetch(`https://litfitmexico.com/envios/api-coupons.php?code=${encodeURIComponent(couponCode)}&cart_total=${subtotal}`);
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.data);
        setCouponCode('');
        toast.success(`Cupón ${data.data.code} aplicado con éxito`);
      } else {
        toast.error(data.message || "Cupón inválido");
      }
    } catch (err) {
      toast.error("Error al validar cupón");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

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

            {/* Sticky Gift Box */}
            <div className="p-4 border-b border-gray-100 shrink-0">
              {items.length > 0 && promoGift?.enabled && promoGift.product && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={promoGift.product.image} alt={promoGift.product.name} className="w-full h-full object-cover" />
                      <div className="absolute -top-1 -right-1 bg-[#00AAC7] text-white p-0.5 rounded-full shadow-sm">
                        <Gift className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">
                        {progress >= 100 
                          ? `¡Felicidades! Ganaste tu ${promoGift.product.name} Gratis` 
                          : `Estás a $${remainingForGift.toLocaleString()} de tu ${promoGift.product.name} Gratis`}
                      </h4>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      className="bg-[#00AAC7] h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  {progress >= 100 && !hasGift && (
                    <button
                      onClick={handleAddGift}
                      className="w-full bg-[#00AAC7] text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-[#0092ab] transition-colors flex items-center justify-center gap-2"
                    >
                      Añadir Regalo Gratis aquí
                    </button>
                  )}
                  {hasGift && (
                    <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                      ¡Regalo Añadido!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">

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
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover bg-white rounded border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-black text-sm text-gray-900 mb-0.5 truncate">
                            {item.name}
                          </h3>
                          {item.variant && (
                            <p className="text-xs text-gray-600 mb-0.5">
                              Sabor: {item.variant}
                            </p>
                          )}
                          {item.size && (
                            <p className="text-xs text-gray-600 mb-0.5">
                              Tamaño: {item.size}
                            </p>
                          )}
                          <p className="text-base font-black text-[#00AAC7]">
                            ${item.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.isGift ? (
                              <div className="text-xs font-bold text-[#00AAC7]">Gratis</div>
                            ) : (
                              <div className="flex items-center border border-gray-200 bg-white rounded">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-1 hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center font-bold text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-6 space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-10 relative">
                {/* Totals */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-sm text-emerald-600 font-medium">
                      <span>Descuento ({appliedCoupon.code}):</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-lg pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-black text-[#00AAC7]">
                      ${finalTotal.toLocaleString()}
                    </span>
                  </div>
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
