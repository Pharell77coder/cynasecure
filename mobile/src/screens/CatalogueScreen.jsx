import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { colors, spacing, typography, radius } from '../theme';

const CATEGORIES = [
  { id: 0, slug: null, name: 'Tous' },
  { id: 1, slug: 'soc', name: '🛡️ SOC' },
  { id: 2, slug: 'edr', name: '💻 EDR' },
  { id: 3, slug: 'xdr', name: '🔍 XDR' },
];

const DEMO_PRODUCTS = [
  { id: 1, name: 'Cyna SOC Essential',  priceMonthly: 29900, available: true,  category: 'soc', priority: 2 },
  { id: 2, name: 'Cyna SOC Advanced',   priceMonthly: 49900, available: true,  category: 'soc', priority: 1 },
  { id: 3, name: 'Cyna SOC Enterprise', priceMonthly: 89900, available: false, category: 'soc', priority: 0 },
  { id: 4, name: 'Cyna EDR Pro',        priceMonthly: 19900, available: true,  category: 'edr', priority: 2 },
  { id: 5, name: 'Cyna EDR Business',   priceMonthly: 34900, available: true,  category: 'edr', priority: 1 },
  { id: 6, name: 'Cyna XDR Essential',  priceMonthly: 59900, available: true,  category: 'xdr', priority: 2 },
  { id: 7, name: 'Cyna XDR Enterprise', priceMonthly: 99900, available: false, category: 'xdr', priority: 0 },
];

const sort = (products) =>
  [...products].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return b.priority - a.priority;
  });

const CatalogueScreen = ({ route }) => {
  const initialCat = route?.params?.cat || null;
  const [activeCat, setActiveCat] = useState(initialCat);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const filtered = activeCat
        ? DEMO_PRODUCTS.filter(p => p.category === activeCat)
        : DEMO_PRODUCTS;
      setProducts(sort(filtered));
      setLoading(false);
    }, 300);
  }, [activeCat]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Titre */}
      <View style={styles.header}>
        <Text style={styles.title}>Catalogue</Text>
        <Text style={styles.count}>{products.length} service{products.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Filtres catégories */}
      <View style={styles.tabs}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, activeCat === cat.slug && styles.tabActive]}
            onPress={() => setActiveCat(cat.slug)}
          >
            <Text style={[styles.tabText, activeCat === cat.slug && styles.tabTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <ProductCard product={item} />
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
  safe:   { flex: 1, backgroundColor: colors.bgLight },
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] },
  title:  { fontSize: typography['3xl'], fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  count:  { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  tabActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText:       { fontSize: typography.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: 'white' },

  list:  { padding: spacing[4], paddingTop: 0 },
  item:  { marginBottom: spacing[1] },

  empty:     { alignItems: 'center', paddingVertical: spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: spacing[3] },
  emptyText: { fontSize: typography.base, color: colors.textMuted },
});

export default CatalogueScreen;
