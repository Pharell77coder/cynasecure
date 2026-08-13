import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { catalogService } from '../services/api.js';
import { CATEGORY_DESCRIPTIONS } from '../constants/categories.js';

const sortProducts = (products) =>
  [...products].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return b.price_monthly - a.price_monthly;
  });

const Catalogue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catSlug = searchParams.get('cat');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([catalogService.getCategories(), catalogService.getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCategory = catSlug ? categories.find((c) => c.slug === catSlug) : null;

  const filteredProducts = useMemo(() => {
    const base = activeCategory ? products.filter((p) => p.category_id === activeCategory.id) : products;
    return sortProducts(base);
  }, [products, activeCategory]);

  const selectCategory = (cat) => setSearchParams(cat ? { cat: cat.slug } : {});

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <span className="text-3xl">⚠️</span>
        <p className="mt-4 text-gray-400">Impossible de charger le catalogue ({error}).</p>
      </div>
    );
  }

  return (
    <div>
      {activeCategory ? (
        <div className="border-b border-gray-800 bg-gradient-to-br from-[#0D0B3B] to-[#1E1B74] px-4 py-16 text-center">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm text-blue-300">
              <button onClick={() => selectCategory(null)} className="hover:underline">Catalogue</button> / {activeCategory.name}
            </p>
            <div className="mt-4 text-5xl">{activeCategory.icon}</div>
            <h1 className="mt-4 text-3xl font-bold text-white">{activeCategory.name}</h1>
            <p className="mt-3 text-gray-300">{CATEGORY_DESCRIPTIONS[activeCategory.slug] || activeCategory.name}</p>
          </div>
        </div>
      ) : (
        <div className="border-b border-gray-800 px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-white">Nos solutions SaaS</h1>
          <p className="mt-2 text-gray-400">Sécurisez votre infrastructure avec nos services de cybersécurité</p>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!catSlug ? 'bg-blue-600 text-white' : 'border border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${catSlug === cat.slug ? 'bg-blue-600 text-white' : 'border border-gray-800 bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-500">
          {loading ? 'Chargement...' : `${filteredProducts.length} service${filteredProducts.length > 1 ? 's' : ''} disponible${filteredProducts.length > 1 ? 's' : ''}`}
        </p>

        {!loading && filteredProducts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return <ProductCard key={p.id} product={p} categoryIcon={cat?.icon} variant="grid" />;
            })}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="mt-16 text-center">
            <span className="text-3xl">🔍</span>
            <p className="mt-4 text-gray-500">Aucun service dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogue;
