import { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext(null);

const STORAGE_KEY = 'cyna_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setCart(JSON.parse(saved));
      } catch {
        // panier vide par défaut
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
    }
  }, [cart, hydrated]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price_monthly * item.quantity, 0);

  // product = { id, name, price_monthly } — même shape que le backend Product.to_dict()
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { id: product.id, name: product.name, price_monthly: product.price_monthly, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) => prev.map((i) => (i.id === productId ? { ...i, quantity } : i)));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
