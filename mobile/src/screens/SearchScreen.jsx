import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { colors, spacing, typography, radius } from '../theme';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Cyna SOC Essential',  priceMonthly: 29900, available: true,  category: 'soc' },
  { id: 2, name: 'Cyna SOC Advanced',   priceMonthly: 49900, available: true,  category: 'soc' },
  { id: 3, name: 'Cyna SOC Enterprise', priceMonthly: 89900, available: false, category: 'soc' },
  { id: 4, name: 'Cyna EDR Pro',        priceMonthly: 19900, available: true,  category: 'edr' },
  { id: 5, name: 'Cyna EDR Business',   priceMonthly: 34900, available: true,  category: 'edr' },
  { id: 6, name: 'Cyna XDR Essential',  priceMonthly: 59900, available: true,  category: 'xdr' },
  { id: 7, name: 'Cyna XDR Enterprise', priceMonthly: 99900, available: false, category: 'xdr' },
];

const FILTERS = [
  { id: null,  label: 'Tous' },
  { id: 'soc', label: '🛡️ SOC' },
  { id: 'edr', label: '💻 EDR' },
  { id: 'xdr', label: '🔍 XDR' },
];

const SearchScreen = () => {
  const [query, setQuery]       = useState('');
  const [cat, setCat]           = useState(null);
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = DEMO_PRODUCTS;

      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.includes(q)
        );
        // Tri pertinence : exact > commence > contient
        filtered.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const score = (name) =>
            name === q ? 3 : name.startsWith(q) ? 2 : 1;
          return score(bName) - score(aName);
        });
      }

      if (cat)       filtered = filtered.filter(p => p.category === cat);
      if (onlyAvail) filtered = filtered.filter(p => p.available);

      // Épuisés en dernier
      filtered.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        return 0;
      });

      setResults(filtered);
      setLoading(false);
    }, 120); // < 200ms (CDC : < 100ms idéalement)

    return () => clearTimeout(timer);
  }, [query, cat, onlyAvail]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Barre de recherche */}
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

      {/* Filtres catégorie */}
      <View style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={String(f.id)}
            style={[styles.filterChip, cat === f.id && styles.filterChipActive]}
            onPress={() => setCat(f.id)}
          >
            <Text style={[styles.filterText, cat === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterChip, onlyAvail && styles.filterChipActive]}
          onPress={() => setOnlyAvail(!onlyAvail)}
        >
          <Text style={[styles.filterText, onlyAvail && styles.filterTextActive]}>
            Dispo uniquement
          </Text>
        </TouchableOpacity>
      </View>

      {/* Résultats */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing[8] }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing[4] }}>
              <ProductCard product={item} />
            </View>
          )}
          contentContainerStyle={{ paddingVertical: spacing[2], paddingBottom: spacing[8] }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.count}>
              {results.length} résultat{results.length > 1 ? 's' : ''}
              {query ? ` pour "${query}"` : ''}
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

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing[4],
    backgroundColor: colors.bgWhite,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  searchIcon: { fontSize: 16 },
  input: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  clearBtn:  { padding: spacing[1] },
  clearText: { color: colors.textMuted, fontSize: typography.base },

  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  filterChipActive:   { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText:         { fontSize: typography.sm, fontWeight: '600', color: colors.textMuted },
  filterTextActive:   { color: 'white' },

  count: {
    fontSize: typography.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },

  empty:      { alignItems: 'center', paddingVertical: spacing[16] },
  emptyIcon:  { fontSize: 48, marginBottom: spacing[3] },
  emptyTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary },
  emptyText:  { fontSize: typography.base, color: colors.textMuted, marginTop: spacing[2], textAlign: 'center' },
});

export default SearchScreen;
