import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { colors, spacing, typography, radius } from '../theme';

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

const SearchScreen = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [catSlug, setCatSlug] = useState(null);
  const [onlyAvail, setOnlyAvail] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([catalogService.getProducts(), catalogService.getCategories()])
      .then(([prods, cats]) => { setAllProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const results = useMemo(() => {
    let filtered = [...allProducts];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (catSlug) {
      const catObj = categories.find((c) => c.slug === catSlug);
      if (catObj) filtered = filtered.filter((p) => p.category_id === catObj.id);
    }
    if (onlyAvail) filtered = filtered.filter((p) => p.available);

    filtered.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (query.trim()) return relevanceScore(b, query) - relevanceScore(a, query);
      return b.price_monthly - a.price_monthly;
    });

    return filtered;
  }, [query, catSlug, onlyAvail, allProducts, categories]);

  const FILTERS = [{ slug: null, label: 'Tous' }, ...categories.map((c) => ({ slug: c.slug, label: `${c.icon} ${c.name}` }))];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Rechercher un service SaaS…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.slug)}
            style={[styles.filterChip, catSlug === f.slug && styles.filterChipActive]}
            onPress={() => setCatSlug(f.slug)}
          >
            <Text style={[styles.filterText, catSlug === f.slug && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.filterChip, onlyAvail && styles.filterChipActive]} onPress={() => setOnlyAvail(!onlyAvail)}>
          <Text style={[styles.filterText, onlyAvail && styles.filterTextActive]}>Dispo uniquement</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing[8] }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing[4] }}>
              <ProductCard product={item} categoryIcon={categoryById[item.category_id]?.icon} />
            </View>
          )}
          contentContainerStyle={{ paddingVertical: spacing[2], paddingBottom: spacing[8] }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.count}>
              {results.length} résultat{results.length > 1 ? 's' : ''}{query ? ` pour "${query}"` : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>Essayez un autre terme ou retirez les filtres.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgLight },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: spacing[4], backgroundColor: colors.bgWhite, borderRadius: radius.full, borderWidth: 2, borderColor: colors.border, paddingHorizontal: spacing[4], gap: spacing[2] },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, paddingVertical: spacing[3], fontSize: typography.base, color: colors.textPrimary },
  clearBtn: { padding: spacing[1] },
  clearText: { color: colors.textMuted, fontSize: typography.base },

  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[3] },
  filterChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgWhite },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: typography.sm, fontWeight: '600', color: colors.textMuted },
  filterTextActive: { color: 'white' },

  count: { fontSize: typography.sm, color: colors.textMuted, paddingHorizontal: spacing[4], marginBottom: spacing[2] },

  empty: { alignItems: 'center', paddingVertical: spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: spacing[3] },
  emptyTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary },
  emptyText: { fontSize: typography.base, color: colors.textMuted, marginTop: spacing[2], textAlign: 'center' },
});

export default SearchScreen;
