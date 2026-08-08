import { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('cyna_cart');
        if (saved) setCart(JSON.parse(saved));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('cyna_cart', JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.subscriptionType === 'annual' && item.priceAnnual
      ? Math.round(item.priceAnnual / 12)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const addToCart = (product, subscriptionType = 'monthly', quantity = 1) => {
    setCart(prev => {
      const key = `${product.id}-${subscriptionType}`;
      const existing = prev.find(i => `${i.id}-${i.subscriptionType}` === key);
      if (existing) {
        return prev.map(i =>
          `${i.id}-${i.subscriptionType}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, subscriptionType, quantity }];
    });
  };

  const updateQuantity = (productId, subscriptionType, quantity) => {
    if (quantity <= 0) { removeFromCart(productId, subscriptionType); return; }
    setCart(prev =>
      prev.map(item =>
        item.id === productId && item.subscriptionType === subscriptionType
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateSubscriptionType = (productId, oldType, newType) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId && item.subscriptionType === oldType
          ? { ...item, subscriptionType: newType }
          : item
      )
    );
  };

  const removeFromCart = (productId, subscriptionType) => {
    setCart(prev =>
      prev.filter(item =>
        !(item.id === productId && item.subscriptionType === subscriptionType)
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, updateQuantity, updateSubscriptionType,
      removeFromCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
