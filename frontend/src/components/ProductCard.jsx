import { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';

const CATEGORY_ICONS = { soc: '🛡️', edr: '💻', xdr: '🔍' };

export default function ProductCard({ product, categorySlug }) {
  const { addItem } = useContext(CartContext);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-700/60">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-2xl">{CATEGORY_ICONS[categorySlug] || '🔒'}</span>
          {!product.available && (
            <span className="rounded border border-red-800/40 bg-red-950/50 px-2 py-0.5 text-xs text-red-400">
              Indisponible
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        <p className="mt-1 text-sm uppercase tracking-wide text-gray-500">{categorySlug}</p>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-white">{product.price_monthly} €</span>
          <span className="text-sm text-gray-500"> / mois</span>
        </div>
        <button
          onClick={() => addItem(product)}
          disabled={!product.available}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
