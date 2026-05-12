"use client";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const total = items.reduce((acc, i) => acc + i.productPrice * i.quantity, 0);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl font-bold mb-8">Mon Panier 🛒</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">Votre panier est vide.</p>
      ) : (
        <div className="w-full max-w-2xl">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-4">
              <div>
                <p className="font-bold">{item.productName}</p>
                <p className="text-gray-500">{item.productPrice} €</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-2 py-1 bg-gray-200 rounded">−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded">+</button>
                <button onClick={() => removeFromCart(item.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded">🗑</button>
              </div>
            </div>
          ))}
          <div className="mt-8 text-right">
            <p className="text-xl font-bold">Total : {total.toFixed(2)} €</p>
          </div>
        </div>
      )}

      <button onClick={() => router.push('/dashboard')}
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Retour
      </button>
    </main>
  );
}