import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { catalogService } from '../services/api';
import { CATEGORY_DESCRIPTIONS } from '../constants/categories';

const normalize = (str) =>
  (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const searchableText = (product, category) =>
  normalize([product.name, product.description, category?.name, category?.slug, category ? CATEGORY_DESCRIPTIONS[category.slug] : null].filter(Boolean).join(' '));

const relevanceScore = (product, category, q) => {
  const name = normalize(product.name);
  const text = searchableText(product, category);
  const term = normalize(q);
  if (name === term) return 5;
  if (name.startsWith(term)) return 4;
  if (name.includes(term)) return 3;
  if (normalize(category?.name).includes(term)) return 2;
  if (text.includes(term)) return 1;
  return 0;
};

export default function Search() {
  const route = useRoute();
  const navigation = useNavigation();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [query, setQuery] = useState(route.params?.q || '');
  const [cat, setCat] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([catalogService.getProducts(), catalogService.getCategories()])
      .then(([prods, cats]) => { setAllProducts(prods); setCategories(cats); })
      .finally(() => setLoading(false));
  }, []);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const runSearch = useCallback(() => {
    let filtered = [...allProducts];
    if (query.trim()) filtered = filtered.filter((p) => searchableText(p, categoryById[p.category_id]).includes(normalize(query.trim())));
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
        default: diff = relevanceScore(b, categoryById[b.category_id], query) - relevanceScore(a, categoryById[a.category_id], query); break;
      }
      if (sortOrder === 'asc') diff = -diff;
      if (a.available !== b.available) return a.available ? -1 : 1;
      return diff;
    });

    setResults(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cat, minPrice, maxPrice, onlyAvail, sortBy, sortOrder, allProducts, categories]);

  useEffect(() => {
    const t = setTimeout(runSearch, 80);
    return () => clearTimeout(t);
  }, [runSearch]);

  const resetFilters = () => { setCat(''); setMinPrice(''); setMaxPrice(''); setOnlyAvail(false); setSortBy('relevance'); setSortOrder('desc'); };
  const hasFilters = cat || minPrice || maxPrice || onlyAvail || sortBy !== 'relevance';

  return (
    <ScrollView className="flex-1 bg-gray-950">
      <View className="border-b border-gray-800 px-4 py-10">
        <Text className="text-2xl font-bold text-white">Recherche</Text>
        <View className="mt-4 flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2">
          <Text className="text-gray-500">🔍</Text>
          <TextInput
            autoFocus placeholder="Rechercher un service SaaS..." placeholderTextColor="#6b7280"
            value={query} onChangeText={setQuery} className="flex-1 text-white"
          />
        </View>
      </View>

      <View className="px-4 py-8">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-semibold text-white" onPress={() => setShowFilters((v) => !v)}>
            Filtres {showFilters ? '▲' : '▼'}
          </Text>
          {hasFilters && <Text className="text-xs text-blue-400" onPress={resetFilters}>Réinitialiser</Text>}
        </View>

        {showFilters && (
          <View className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4" style={{ gap: 16 }}>
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-400">Catégorie</Text>
              <View className="flex-row flex-wrap gap-2">
                <Text
                  onPress={() => setCat('')}
                  className={`rounded-full px-3 py-1 text-xs ${cat === '' ? 'bg-blue-600 text-white' : 'border border-gray-700 text-gray-400'}`}
                >
                  Toutes
                </Text>
                {categories.map((c) => (
                  <Text
                    key={c.slug}
                    onPress={() => setCat(c.slug)}
                    className={`rounded-full px-3 py-1 text-xs ${cat === c.slug ? 'bg-blue-600 text-white' : 'border border-gray-700 text-gray-400'}`}
                  >
                    {c.icon} {c.name}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-400">Prix mensuel (€)</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  keyboardType="numeric" placeholder="Min" placeholderTextColor="#6b7280"
                  value={minPrice} onChangeText={setMinPrice}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white"
                />
                <Text className="text-gray-500">–</Text>
                <TextInput
                  keyboardType="numeric" placeholder="Max" placeholderTextColor="#6b7280"
                  value={maxPrice} onChangeText={setMaxPrice}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white"
                />
              </View>
            </View>

            <View className="flex-row items-center gap-2" onTouchEnd={() => setOnlyAvail((v) => !v)}>
              <View className={`h-4 w-4 rounded border ${onlyAvail ? 'border-blue-600 bg-blue-600' : 'border-gray-600'}`} />
              <Text className="text-sm text-gray-300">Services disponibles uniquement</Text>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-400">Trier par</Text>
              <View className="flex-row flex-wrap gap-2">
                {[{ v: 'relevance', l: 'Pertinence' }, { v: 'price', l: 'Prix' }, { v: 'avail', l: 'Disponibilité' }].map(({ v, l }) => (
                  <Text
                    key={v}
                    onPress={() => setSortBy(v)}
                    className={`rounded-full px-3 py-1 text-xs ${sortBy === v ? 'bg-blue-600 text-white' : 'border border-gray-700 text-gray-400'}`}
                  >
                    {l}
                  </Text>
                ))}
              </View>
              <View className="mt-2 flex-row gap-2">
                <Text onPress={() => setSortOrder('desc')} className={`rounded px-2 py-1 text-xs ${sortOrder === 'desc' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>↓ Décroissant</Text>
                <Text onPress={() => setSortOrder('asc')} className={`rounded px-2 py-1 text-xs ${sortOrder === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>↑ Croissant</Text>
              </View>
            </View>
          </View>
        )}

        <Text className="mb-4 text-sm text-gray-500">
          {loading ? '...' : results.length} résultat{results.length > 1 ? 's' : ''}
          {query ? ` pour « ${query} »` : ''}
        </Text>

        {!loading && results.length > 0 && (
          <View style={{ gap: 16 }}>
            {results.map((p) => <ProductCard key={p.id} product={p} categoryIcon={categoryById[p.category_id]?.icon} variant="grid" />)}
          </View>
        )}

        {!loading && results.length === 0 && (
          <View className="items-center py-16">
            <Text className="text-3xl">🔍</Text>
            <Text className="mt-4 font-semibold text-white">Aucun résultat</Text>
            <Text className="mt-2 text-gray-500">Essayez un autre terme ou retirez certains filtres.</Text>
            {hasFilters && (
              <View className="mt-4">
                <Button variant="outline" onPress={resetFilters}>Réinitialiser les filtres</Button>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}