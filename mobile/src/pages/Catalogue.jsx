import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { CATEGORY_DESCRIPTIONS } from '../constants/categories';

const sortProducts = (products) =>
  [...products].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return b.price_monthly - a.price_monthly;
  });

export default function Catalogue() {
  const route = useRoute();
  const navigation = useNavigation();
  const catSlug = route.params?.cat;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([catalogService.getCategories(), catalogService.getProducts()])
      .then(([cats, prods]) => { setCategories(cats); setProducts(prods); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCategory = catSlug ? categories.find((c) => c.slug === catSlug) : null;

  const filteredProducts = useMemo(() => {
    const base = activeCategory ? products.filter((p) => p.category_id === activeCategory.id) : products;
    return sortProducts(base);
  }, [products, activeCategory]);

  const selectCategory = (cat) => navigation.setParams({ cat: cat ? cat.slug : undefined });

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 px-4 py-16">
        <Text className="text-3xl">⚠️</Text>
        <Text className="mt-4 text-center text-gray-400">Impossible de charger le catalogue ({error}).</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-950">
      {activeCategory ? (
        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={{ paddingVertical: 60, paddingHorizontal: 16 }}>
          <Text className="text-center text-sm text-blue-300" onPress={() => selectCategory(null)}>
            Catalogue / {activeCategory.name}
          </Text>
          <Text className="mt-4 text-center text-5xl">{activeCategory.icon}</Text>
          <Text className="mt-4 text-center text-3xl font-bold text-white">{activeCategory.name}</Text>
          <Text className="mt-3 text-center text-gray-300">
            {CATEGORY_DESCRIPTIONS[activeCategory.slug] || activeCategory.name}
          </Text>
        </LinearGradient>
      ) : (
        <View className="border-b border-gray-800 px-4 py-12">
          <Text className="text-center text-3xl font-bold text-white">Nos solutions SaaS</Text>
          <Text className="mt-2 text-center text-gray-400">Sécurisez votre infrastructure avec nos services de cybersécurité</Text>
        </View>
      )}

      <View className="px-4 py-8">
        <View className="flex-row flex-wrap gap-2">
          <Text
            onPress={() => selectCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${!catSlug ? 'bg-blue-600 text-white' : 'border border-gray-800 bg-gray-900 text-gray-400'}`}
          >
            Tous
          </Text>
          {categories.map((cat) => (
            <Text
              key={cat.id}
              onPress={() => selectCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${catSlug === cat.slug ? 'bg-blue-600 text-white' : 'border border-gray-800 bg-gray-900 text-gray-400'}`}
            >
              {cat.icon} {cat.name}
            </Text>
          ))}
        </View>

        <Text className="mt-6 text-sm text-gray-500">
          {loading ? 'Chargement...' : `${filteredProducts.length} service${filteredProducts.length > 1 ? 's' : ''} disponible${filteredProducts.length > 1 ? 's' : ''}`}
        </Text>

        {!loading && filteredProducts.length > 0 && (
          <View className="mt-6" style={{ gap: 16 }}>
            {filteredProducts.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return <ProductCard key={p.id} product={p} categoryIcon={cat?.icon} variant="grid" />;
            })}
          </View>
        )}

        {!loading && filteredProducts.length === 0 && (
          <View className="mt-16 items-center">
            <Text className="text-3xl">🔍</Text>
            <Text className="mt-4 text-gray-500">Aucun service dans cette catégorie.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}