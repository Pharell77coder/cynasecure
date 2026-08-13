import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext(null);

const STORAGE_KEY = 'cyna_cart';

// Prix d'un article selon sa période de facturation. L'annuel = 10 mois prépayés (-17%),
// c'est un paiement unique côté Stripe, pas un abonnement récurrent.
const unitPriceFor = (item) => (item.billing_period === 'annual' ? item.price_monthly * 10 : item.price_monthly);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + unitPriceFor(item) * item.quantity, 0);

  const itemKey = (productId, billingPeriod) => `${productId}-${billingPeriod}`;

  // product = { id, name, price_monthly }
  const addToCart = (product, quantity = 1, billingPeriod = 'monthly') => {
    setCart((prev) => {
      const key = itemKey(product.id, billingPeriod);
      const existing = prev.find((i) => itemKey(i.id, i.billing_period) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.id, i.billing_period) === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price_monthly: product.price_monthly, billing_period: billingPeriod, quantity }
      ];
    });
  };

  const updateQuantity = (productId, billingPeriod, quantity) => {
    if (quantity <= 0) return removeFromCart(productId, billingPeriod);
    const key = itemKey(productId, billingPeriod);
    setCart((prev) => prev.map((i) => (itemKey(i.id, i.billing_period) === key ? { ...i, quantity } : i)));
  };

  const updateBillingPeriod = (productId, oldPeriod, newPeriod) => {
    setCart((prev) => {
      const targetKey = itemKey(productId, newPeriod);
      const alreadyExists = prev.some((i) => itemKey(i.id, i.billing_period) === targetKey && i.id === productId);
      if (alreadyExists) {
        // Fusionne avec la ligne existante (même produit, même nouvelle période)
        const moving = prev.find((i) => i.id === productId && i.billing_period === oldPeriod);
        return prev
          .filter((i) => !(i.id === productId && i.billing_period === oldPeriod))
          .map((i) =>
            i.id === productId && i.billing_period === newPeriod
              ? { ...i, quantity: i.quantity + (moving?.quantity || 0) }
              : i
          );
      }
      return prev.map((i) =>
        i.id === productId && i.billing_period === oldPeriod ? { ...i, billing_period: newPeriod } : i
      );
    });
  };

  const removeFromCart = (productId, billingPeriod) => {
    setCart((prev) => prev.filter((i) => !(i.id === productId && i.billing_period === billingPeriod)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartTotal, unitPriceFor, addToCart, updateQuantity, updateBillingPeriod, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
