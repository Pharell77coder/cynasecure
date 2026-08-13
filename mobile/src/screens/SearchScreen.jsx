import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { catalogService } from '../services/api';
import { colors, spacing, typography, radius } from '../theme';

// Même normalisation que web/pages/Search.jsx : "securite" doit trouver "sécurité"
const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const searchableText = (product, category) =>
  normalize([product.name, product.description, category?.name, category?.slug].filter(Boolean).join(' '));

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

const SORT_OPTIONS = [
  { v: 'relevance', l: 'Pertinence' },
  { v: 'price', l: 'Prix' },
  { v: 'avail', l: 'Disponibilité' },
];

const SearchScreen = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [catSlug, setCatSlug] = useState(null);
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
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
      const q = normalize(query.trim());
      filtered = filtered.filter((p) => searchableText(p, categoryById[p.category_id]).includes(q));
    }
    if (catSlug) {
      const catObj = categories.find((c) => c.slug === catSlug);
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

    return filtered;
  }, [query, catSlug, onlyAvail, minPrice, maxPrice, sortBy, sortOrder, allProducts, categories]);

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

      {/* Filtre prix min/max, absent de la version précédente */}
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Prix / mois :</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="Min"
          placeholderTextColor={colors.textMuted}
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="number-pad"
        />
        <Text style={styles.priceDash}>–</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="Max"
          placeholderTextColor={colors.textMuted}
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="number-pad"
        />
      </View>

      {/* Tri, absent de la version précédente */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(({ v, l }) => (
          <TouchableOpacity key={v} style={[styles.sortChip, sortBy === v && styles.sortChipActive]} onPress={() => setSortBy(v)}>
            <Text style={[styles.sortText, sortBy === v && styles.sortTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} style={styles.sortOrderBtn}>
          <Text style={styles.sortOrderText}>{sortOrder === 'desc' ? '↓' : '↑'}</Text>
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

  priceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[3] },
  priceLabel: { fontSize: typography.sm, color: colors.textMuted, marginRight: spacing[1] },
  priceInput: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2], fontSize: typography.sm, color: colors.textPrimary, backgroundColor: colors.bgWhite },
  priceDash: { color: colors.textMuted },

  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[3] },
  sortChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgWhite },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortText: { fontSize: typography.xs, fontWeight: '600', color: colors.textMuted },
  sortTextActive: { color: 'white' },
  sortOrderBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgWhite },
  sortOrderText: { fontSize: typography.sm, fontWeight: '700', color: colors.textPrimary },

  count: { fontSize: typography.sm, color: colors.textMuted, paddingHorizontal: spacing[4], marginBottom: spacing[2] },

  empty: { alignItems: 'center', paddingVertical: spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: spacing[3] },
  emptyTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary },
  emptyText: { fontSize: typography.base, color: colors.textMuted, marginTop: spacing[2], textAlign: 'center' },
});

export default SearchScreen;
