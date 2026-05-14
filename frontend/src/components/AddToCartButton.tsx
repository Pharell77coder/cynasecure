"use client";
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ product }: {
  product: { productId: number; productName: string; productPrice: number }
}) {
  const { addToCart, count } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`px-4 py-2 rounded text-white transition-all ${added ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {added ? '✓ Ajouté !' : 'Ajouter au panier'}
    </button>
  );
}