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

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
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

  /* ────────────────────────────────────────────────
     🔄 Chargement depuis localStorage
     ──────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      console.warn("Panier corrompu → reset");
      setItems([]);
    }
  }, []);

  /* ────────────────────────────────────────────────
     💾 Sauvegarde automatique
     ──────────────────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* ────────────────────────────────────────────────
     ➕ addToCart (one_shot uniquement)
     ──────────────────────────────────────────────── */
  const addToCart = useCallback<CartContextValue["addToCart"]>((item) => {
    if (item.type === "saas") {
      console.warn("❌ Impossible d'ajouter un service SaaS au panier.");
      return;
    }

    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;

      return [
        ...prev,
        {
          ...item,
          cycle: "monthly", // one_shot = prix unique
        },
      ];
    });
  }, []);

  /* ────────────────────────────────────────────────
     ❌ removeFromCart
     ──────────────────────────────────────────────── */
  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /* ────────────────────────────────────────────────
     🔄 setCycle (utile si tu veux un panier SaaS un jour)
     ──────────────────────────────────────────────── */
  const setCycle = useCallback((id: number, cycle: BillingCycle) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cycle } : p))
    );
  }, []);

  /* ────────────────────────────────────────────────
     🗑 clearCart
     ──────────────────────────────────────────────── */
  const clearCart = useCallback(() => setItems([]), []);

  /* ────────────────────────────────────────────────
     💰 total (one_shot = prix unique)
     ──────────────────────────────────────────────── */
  const total = useMemo(
    () =>
      items.reduce((sum, it) => {
        return sum + (it.cycle === "yearly" ? yearlyPrice(it.priceMonthly) : it.priceMonthly);
      }, 0),
    [items]
  );

  /* ────────────────────────────────────────────────
     📦 Valeur du contexte
     ──────────────────────────────────────────────── */
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      total,
      addToCart,
      removeFromCart,
      setCycle,
      clearCart,
      has: (id) => items.some((p) => p.id === id),
    }),
    [items, total, addToCart, removeFromCart, setCycle, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
