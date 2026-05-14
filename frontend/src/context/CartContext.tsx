import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export type BillingCycle = "monthly" | "yearly";

export interface CartItem {
  id: number;
  name: string;
  description: string;
  priceMonthly: number; // 🔥 utilisé comme prix unique pour one_shot
  cycle: BillingCycle;
  image?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (item: Omit<CartItem, "cycle"> & { cycle?: BillingCycle; type?: string }) => void;
  removeFromCart: (id: number) => void;
  setCycle: (id: number, cycle: BillingCycle) => void;
  clearCart: () => void;
  has: (id: number) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "cyna.cart";

const yearlyPrice = (monthly: number) =>
  Math.round(monthly * 12 * 0.83); // -17%

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Charger depuis localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        /* noop */
      }
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // 🔥 addToCart corrigé pour empêcher les SaaS d'aller dans le panier
  const addToCart: CartContextValue["addToCart"] = useCallback((item) => {
    // ❌ Si c'est un service SaaS → on bloque
    if (item.type === "saas") {
      console.warn("Impossible d'ajouter un service SaaS au panier.");
      return;
    }

    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;

      return [
        ...prev,
        {
          ...item,
          cycle: "monthly", // 🔥 one_shot = prix unique
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setCycle = useCallback((id: number, cycle: BillingCycle) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cycle } : p))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // 🔥 total corrigé : one_shot = prix unique
  const total = useMemo(
    () =>
      items.reduce((sum, it) => {
        if (it.cycle === "yearly") {
          return sum + yearlyPrice(it.priceMonthly);
        }
        return sum + it.priceMonthly;
      }, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    count: items.length,
    total,
    addToCart,
    removeFromCart,
    setCycle,
    clearCart,
    has: (id) => items.some((p) => p.id === id),
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
