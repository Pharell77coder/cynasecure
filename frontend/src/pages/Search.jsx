import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Button from '../components/Button.jsx';
import { catalogService } from '../services/api.js';

const relevanceScore = (product, q) => {
  const name = product.name.toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const term = q.toLowerCase();
  if (name === term) return 4;
  if (name.startsWith(term)) return 3;
  if (name.includes(term)) return 2;
  if (desc.includes(term)) return 1;
  return 0;
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [cat, setCat] = useState(searchParams.get('cat') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');
  const [onlyAvail, setOnlyAvail] = useState(searchParams.get('avail') === '1');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([catalogService.getProducts(), catalogService.getCategories()])
      .then(([prods, cats]) => { setAllProducts(prods); setCategories(cats); })
      .finally(() => setLoading(false));
  }, []);

  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.id, c]));

  const runSearch = useCallback(() => {
    let filtered = [...allProducts];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (cat) {
      const catObj = categories.find((c) => c.slug === cat);
      if (catObj) filtered = filtered.filter((p) => p.category_id === catObj.id);
    }
    if (minPrice) filtered = filtered.filter((p) => p.price_monthly >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price_monthly <= Number(maxPrice));
    if (onlyAvail) filtered = filtered.filter((p) => p.available);

    filtered.sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case 'price': diff = a.price_monthly - b.price_monthly; break;
        case 'avail': diff = (b.available ? 1 : 0) - (a.available ? 1 : 0); break;
        default: diff = relevanceScore(b, query) - relevanceScore(a, query); break;
      }
      if (sortOrder === 'asc') diff = -diff;
      if (a.available !== b.available) return a.available ? -1 : 1;
      return diff;
    });

    setResults(filtered);

    const p = {};
    if (query) p.q = query;
    if (cat) p.cat = cat;
    if (minPrice) p.min = minPrice;
    if (maxPrice) p.max = maxPrice;
    if (onlyAvail) p.avail = '1';
    if (sortBy !== 'relevance') p.sort = sortBy;
    if (sortOrder !== 'desc') p.order = sortOrder;
    setSearchParams(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cat, minPrice, maxPrice, onlyAvail, sortBy, sortOrder, allProducts, categories]);

  useEffect(() => {
    const t = setTimeout(runSearch, 80);
    return () => clearTimeout(t);
  }, [runSearch]);

  const resetFilters = () => {
    setCat(''); setMinPrice(''); setMaxPrice('');
    setOnlyAvail(false); setSortBy('relevance'); setSortOrder('desc');
  };

  const hasFilters = cat || minPrice || maxPrice || onlyAvail || sortBy !== 'relevance';

  return (
    <div>
      <div className="border-b border-gray-800 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-white">Recherche</h1>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2">
            <span className="text-gray-500">🔍</span>
            <input
              type="search" autoFocus placeholder="Rechercher un service SaaS..." value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none"
            />
            {query && <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white">✕</button>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Filtres</h2>
              {hasFilters && <button onClick={resetFilters} className="text-xs text-blue-400 hover:underline">Réinitialiser</button>}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-400">Catégorie</h3>
              <label className="flex items-center gap-2 py-1 text-sm text-gray-300">
                <input type="radio" name="cat" checked={cat === ''} onChange={() => setCat('')} /> Toutes
              </label>
              {categories.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 py-1 text-sm text-gray-300">
                  <input type="radio" name="cat" checked={cat === c.slug} onChange={() => setCat(c.slug)} /> {c.icon} {c.name}
                </label>
              ))}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-400">Prix mensuel (€)</h3>
              <div className="flex items-center gap-2">
                <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white focus:outline-none" />
                <span className="text-gray-500">–</span>
                <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white focus:outline-none" />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-400">Disponibilité</h3>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} /> Services disponibles uniquement
              </label>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-400">Trier par</h3>
              {[{ v: 'relevance', l: 'Pertinence' }, { v: 'price', l: 'Prix' }, { v: 'avail', l: 'Disponibilité' }].map(({ v, l }) => (
                <label key={v} className="flex items-center gap-2 py-1 text-sm text-gray-300">
                  <input type="radio" name="sort" checked={sortBy === v} onChange={() => setSortBy(v)} /> {l}
                </label>
              ))}
              <div className="mt-2 flex gap-2">
                <button onClick={() => setSortOrder('desc')} className={`rounded px-2 py-1 text-xs ${sortOrder === 'desc' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>↓ Décroissant</button>
                <button onClick={() => setSortOrder('asc')} className={`rounded px-2 py-1 text-xs ${sortOrder === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>↑ Croissant</button>
              </div>
            </div>
          </aside>

          <div>
            <p className="mb-4 text-sm text-gray-500">
              <strong className="text-gray-300">{loading ? '...' : results.length}</strong> résultat{results.length > 1 ? 's' : ''}
              {query && <> pour <em>« {query} »</em></>}
            </p>

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {results.map((p) => <ProductCard key={p.id} product={p} categoryIcon={categoryBySlug[p.category_id]?.icon} variant="grid" />)}
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="py-16 text-center">
                <span className="text-3xl">🔍</span>
                <h3 className="mt-4 font-semibold text-white">Aucun résultat</h3>
                <p className="mt-2 text-gray-500">Essayez un autre terme ou retirez certains filtres.</p>
                {hasFilters && <Button variant="outline" className="mt-4" onClick={resetFilters}>Réinitialiser les filtres</Button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
