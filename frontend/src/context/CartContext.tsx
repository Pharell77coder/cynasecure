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
  priceMonthly: number; // utilisé aussi pour one_shot
  cycle: BillingCycle;
  image?: string;
}

export interface PromoState {
  code: string;
  discount: number;
  discountedTotal: number;
  type: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  promo: PromoState | null;
  setPromo: (promo: PromoState | null) => void;
  addToCart: (
    item: Omit<CartItem, "cycle"> & { cycle?: BillingCycle; type?: string }
  ) => void;
  removeFromCart: (id: number) => void;
  setCycle: (id: number, cycle: BillingCycle) => void;
  clearCart: () => void;
  has: (id: number) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "cyna.cart";

const yearlyPrice = (m: number) => Math.round(m * 12 * 0.83);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<PromoState | null>(null);

  // Chargement depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      console.warn("Panier illisible, réinitialisé");
      setItems([]);
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // addToCart — un seul exemplaire par service (id unique)
  const addToCart = useCallback<CartContextValue["addToCart"]>((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;

      return [
        ...prev,
        {
          ...item,
          cycle: item.cycle ?? "monthly",
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // setCycle : change le cycle de facturation d'un article
  const setCycle = useCallback((id: number, cycle: BillingCycle) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cycle } : p))
    );
  }, []);

  const clearCart = useCallback(() => { setItems([]); setPromo(null); }, []);

  // Total HT (yearly = mensuel × 12 × 0,83)
  const total = useMemo(
    () =>
      items.reduce((sum, it) => {
        return sum + (it.cycle === "yearly" ? yearlyPrice(it.priceMonthly) : it.priceMonthly);
      }, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      total,
      promo,
      setPromo,
      addToCart,
      removeFromCart,
      setCycle,
      clearCart,
      has: (id) => items.some((p) => p.id === id),
    }),
    [items, total, promo, addToCart, removeFromCart, setCycle, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
