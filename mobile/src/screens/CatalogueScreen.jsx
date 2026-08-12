import { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { colors, spacing, typography, radius } from '../theme';

const sort = (products) =>
  [...products].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return b.price_monthly - a.price_monthly;
  });

const CatalogueScreen = ({ route }) => {
  const initialCat = route?.params?.cat || null;
  const [activeCatSlug, setActiveCatSlug] = useState(initialCat);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([catalogService.getCategories(), catalogService.getProducts()])
      .then(([cats, prods]) => { setCategories(cats); setProducts(prods); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Si on arrive via navigation.navigate('Catalogue', { cat }) depuis un autre écran
  useEffect(() => {
    if (route?.params?.cat !== undefined) setActiveCatSlug(route.params.cat);
  }, [route?.params?.cat]);

  const activeCategory = activeCatSlug ? categories.find((c) => c.slug === activeCatSlug) : null;

  const filteredProducts = useMemo(() => {
    const base = activeCategory ? products.filter((p) => p.category_id === activeCategory.id) : products;
    return sort(base);
  }, [products, activeCategory]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'Catalogue'}</Text>
        <Text style={styles.count}>{filteredProducts.length} service{filteredProducts.length > 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, !activeCatSlug && styles.tabActive]} onPress={() => setActiveCatSlug(null)}>
          <Text style={[styles.tabText, !activeCatSlug && styles.tabTextActive]}>Tous</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, activeCatSlug === cat.slug && styles.tabActive]}
            onPress={() => setActiveCatSlug(cat.slug)}
          >
            <Text style={[styles.tabText, activeCatSlug === cat.slug && styles.tabTextActive]}>
              {cat.icon} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <ProductCard product={item} categoryIcon={activeCategory?.icon} />
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Aucun service dans cette catégorie.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgLight },
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] },
  title: { fontSize: typography['3xl'], fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  count: { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },

  tabs: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[3], gap: spacing[2], flexWrap: 'wrap' },
  tab: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.bgWhite },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: typography.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: 'white' },

  list: { padding: spacing[4], paddingTop: 0 },
  item: { marginBottom: spacing[1] },

  empty: { alignItems: 'center', paddingVertical: spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: spacing[3] },
  emptyText: { fontSize: typography.base, color: colors.textMuted },
});

export default CatalogueScreen;
