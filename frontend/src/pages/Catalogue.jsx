import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

const API_URL = 'http://localhost:5000';

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('categorie') || 'all';

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/products`).then((r) => r.json()),
      fetch(`${API_URL}/api/categories`).then((r) => r.json())
    ])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => setError('Impossible de charger le catalogue.'))
      .finally(() => setLoading(false));
  }, []);

  const categoryBySlug = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c.slug));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => categoryBySlug[p.category_id] === activeCategory);
  }, [products, categoryBySlug, activeCategory]);

  const setCategory = (slug) => {
    if (slug === 'all') {
      searchParams.delete('categorie');
    } else {
      searchParams.set('categorie', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white">Catalogue</h1>
        <p className="mt-2 text-gray-400">Choisissez les services adaptés à votre organisation.</p>

        {/* FILTRES */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            Tout
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === c.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* GRILLE PRODUITS */}
        {error && <p className="mt-8 text-red-400">{error}</p>}
        {loading ? (
          <p className="mt-8 text-gray-400">Chargement...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="mt-8 text-gray-500">Aucun produit dans cette catégorie.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} categorySlug={categoryBySlug[p.category_id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
