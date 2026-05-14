import { apiFetch } from "./apiFetch";

/**
 * API Panier — version propre, humaine, et prête pour un backend réel.
 * 
 * Le backend doit exposer :
 *  - GET    /cart
 *  - POST   /cart/items
 *  - DELETE /cart/items/:id
 *  - DELETE /cart
 *  - POST   /cart/checkout
 */

export interface CartItemPayload {
  serviceId: string;
  billing: "mensuel" | "annuel";
  price: number;
  quantity?: number;
  
}

export interface CartItemResponse {
  id: string;
  serviceId: string;
  name: string;
  image?: string;
  billing: "mensuel" | "annuel";
  price: number;
  quantity: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number;
}

export const cartApi = {
  /**
   * Récupérer le panier complet
   */
  get: () => apiFetch<CartResponse>("/cart"),

  /**
   * Ajouter un service au panier
   */
  add: (item: CartItemPayload) =>
    apiFetch<CartResponse>("/cart/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  /**
   * Supprimer un item du panier
   */
  remove: (id: string) =>
    apiFetch<CartResponse>(`/cart/items/${id}`, {
      method: "DELETE",
    }),

  /**
   * Vider le panier
   */
  clear: () =>
    apiFetch<CartResponse>("/cart", {
      method: "DELETE",
    }),

  /**
   * Passer commande
   */
  checkout: () =>
    apiFetch("/cart/checkout", {
      method: "POST",
    }),
};
