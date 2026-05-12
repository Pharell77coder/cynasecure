"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  addToCart: (product: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const token = () => localStorage.getItem('token');
  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token()}`
  });

  const fetchCart = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, { headers: headers() });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []); 
  };

  const addToCart = async (product: Omit<CartItem, 'id' | 'quantity'>) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ...product, quantity: 1 }),
    });
    await fetchCart();
  };

  const removeFromCart = async (id: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    await fetchCart();
  };

  const updateQuantity = async (id: number, quantity: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ quantity }),
    });
    await fetchCart();
  };

  useEffect(() => { fetchCart(); }, []);

  return (
    <CartContext.Provider value={{ items, count: items.reduce((acc, i) => acc + i.quantity, 0), addToCart, removeFromCart, updateQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext)!;