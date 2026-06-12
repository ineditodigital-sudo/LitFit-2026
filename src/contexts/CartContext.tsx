import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string; // Para sabor de barras
  size?: string; // Para tamaño de paquete
  isGift?: boolean; // Para identificar productos de regalo
}

export interface PromoGiftData {
  enabled: boolean;
  threshold: number;
  product: CartItem | null;
}

export interface CouponData {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_purchase: number;
  allow_shaker: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  appliedCoupon: CouponData | null;
  applyCoupon: (coupon: CouponData) => void;
  removeCoupon: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  promoGift: PromoGiftData | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('litfit-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    const savedCoupon = localStorage.getItem('litfit-coupon');
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch(e) {}
    }
  }, []);

  const [promoGift, setPromoGift] = useState<PromoGiftData | null>(null);

  // Fetch promo gift settings
  useEffect(() => {
    const fetchPromoGift = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch(`https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`),
          fetch(`https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`)
        ]);
        
        const settings = await settingsRes.json();
        const productsData = await productsRes.json();
        
        if (settings.promo_gift_enabled === '1' && settings.promo_gift_product_id) {
          const productList = Array.isArray(productsData) ? productsData : (productsData.products || []);
          const product = productList.find((p: any) => p.id === settings.promo_gift_product_id);
          if (product) {
            setPromoGift({
              enabled: true,
              threshold: Number(settings.promo_gift_threshold || 1000),
              product: {
                id: `${product.id}-gift`, // ID modificado para no mezclarse
                name: product.name,
                price: 0,
                quantity: 1,
                image: product.image,
                variant: product.variant,
                size: product.size,
                isGift: true
              }
            });
            return;
          }
        }
        setPromoGift(null);
      } catch (error) {
        console.error("Error fetching promo gift:", error);
      }
    };
    fetchPromoGift();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('litfit-cart', JSON.stringify(items));
  }, [items]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('litfit-coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('litfit-coupon');
    }
  }, [appliedCoupon]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item => item.id === newItem.id && 
                item.variant === newItem.variant && 
                item.size === newItem.size
      );

      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...current, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(current => current.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: CouponData) => {
    setAppliedCoupon(coupon);
    if (!coupon.allow_shaker) {
      // Remover shaker si existe
      setItems(current => current.filter(item => item.id !== 'shaker-gratis'));
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto-remove coupon if minimum purchase is not met
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.min_purchase > 0 && subtotal < appliedCoupon.min_purchase) {
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  // Auto-remove promo gift if subtotal falls below threshold
  useEffect(() => {
    if (promoGift && promoGift.enabled) {
      const hasGiftInCart = items.some(item => item.isGift);
      if (hasGiftInCart && subtotal < promoGift.threshold) {
        setItems(current => current.filter(item => !item.isGift));
      }
    }
  }, [subtotal, promoGift, items]);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = subtotal * (appliedCoupon.value / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const finalTotal = subtotal - discountAmount;

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        finalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isOpen,
        openCart,
        closeCart,
        promoGift,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
