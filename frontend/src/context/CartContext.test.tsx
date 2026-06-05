import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, act, renderHook } from "@testing-library/react";
import React from "react";
import { CartProvider, useCartContext, BillingCycle } from "./CartContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

beforeEach(() => {
  localStorage.clear();
});

const makeItem = (id: number, name = `Service ${id}`, price = 100) => ({
  id,
  name,
  description: "desc",
  priceMonthly: price,
});

describe("CartContext", () => {
  describe("addToCart", () => {
    it("ajoute un article au panier", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.addToCart(makeItem(1)));

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(1);
    });

    it("n'ajoute pas deux fois le même article", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => {
        result.current.addToCart(makeItem(1));
        result.current.addToCart(makeItem(1));
      });

      expect(result.current.items).toHaveLength(1);
    });

    it("utilise le cycle monthly par défaut", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.addToCart(makeItem(1)));

      expect(result.current.items[0].cycle).toBe("monthly");
    });

    it("respecte le cycle fourni", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.addToCart({ ...makeItem(1), cycle: "yearly" }));

      expect(result.current.items[0].cycle).toBe("yearly");
    });
  });

  describe("removeFromCart", () => {
    it("retire l'article avec l'id donné", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => {
        result.current.addToCart(makeItem(1));
        result.current.addToCart(makeItem(2));
      });
      act(() => result.current.removeFromCart(1));

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(2);
    });
  });

  describe("setCycle", () => {
    it("change le cycle d'un article existant", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.addToCart(makeItem(1)));
      act(() => result.current.setCycle(1, "yearly"));

      expect(result.current.items[0].cycle).toBe("yearly");
    });
  });

  describe("total", () => {
    it("retourne 0 pour un panier vide", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });
      expect(result.current.total).toBe(0);
    });

    it("calcule le total en cycle monthly", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => {
        result.current.addToCart(makeItem(1, "A", 50));
        result.current.addToCart(makeItem(2, "B", 100));
      });

      expect(result.current.total).toBe(150);
    });

    it("applique la remise yearly (83% de prix mensuel x12)", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.addToCart({ ...makeItem(1, "A", 100), cycle: "yearly" }));

      expect(result.current.total).toBe(Math.round(100 * 12 * 0.83));
    });
  });

  describe("count", () => {
    it("retourne le nombre d'articles", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => {
        result.current.addToCart(makeItem(1));
        result.current.addToCart(makeItem(2));
      });

      expect(result.current.count).toBe(2);
    });
  });

  describe("has", () => {
    it("retourne true si l'article est dans le panier", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.addToCart(makeItem(5)));

      expect(result.current.has(5)).toBe(true);
    });

    it("retourne false si l'article n'est pas dans le panier", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });
      expect(result.current.has(99)).toBe(false);
    });
  });

  describe("clearCart", () => {
    it("vide le panier et réinitialise le promo", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => {
        result.current.addToCart(makeItem(1));
        result.current.setPromo({ code: "TEST", discount: 10, discountedTotal: 90, type: "percent" });
      });
      act(() => result.current.clearCart());

      expect(result.current.items).toHaveLength(0);
      expect(result.current.promo).toBeNull();
    });
  });

  describe("setPromo", () => {
    it("stocke le promo dans le contexte", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });
      const promo = { code: "SAVE10", discount: 10, discountedTotal: 90, type: "percent" };

      act(() => result.current.setPromo(promo));

      expect(result.current.promo).toEqual(promo);
    });

    it("peut effacer le promo avec null", () => {
      const { result } = renderHook(() => useCartContext(), { wrapper });

      act(() => result.current.setPromo({ code: "X", discount: 5, discountedTotal: 95, type: "fixed" }));
      act(() => result.current.setPromo(null));

      expect(result.current.promo).toBeNull();
    });
  });

  it("lève une erreur si utilisé hors CartProvider", () => {
    const consoleError = console.error;
    console.error = () => {};
    expect(() => renderHook(() => useCartContext())).toThrow();
    console.error = consoleError;
  });
});
