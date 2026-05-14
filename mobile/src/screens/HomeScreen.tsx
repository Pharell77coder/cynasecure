import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { PRODUCTS, CATEGORIES } from "../data/products";
import { theme } from "../data/theme";
import { useCart } from "../data/CartContext";
import { ProductCard } from "../components/ProductCard";

type Props = { navigation: any };

export const HomeScreen = ({ navigation }: Props) => {
  const { cartCount } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState<"default" | "asc" | "desc">("default");

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const catOk = category === "Tous" || p.category === category;
      const searchOk = p.name.toLowerCase().includes(search.toLowerCase());
      return catOk && searchOk;
    });
    if (sortBy === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [search, category, sortBy]);

  const renderItem = ({ item }: any) => (
    <ProductCard product={item} onPress={() => navigation.navigate("Detail", { product: item })} />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.ink} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>MAISON</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.cartIcon}>🛍</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroSub}>Collection Printemps 2026</Text>
        <Text style={styles.heroTitle}>{"L'élégance\nau quotidien"}</Text>
      </View>

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={theme.colors.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortBy((s) => s === "asc" ? "desc" : s === "desc" ? "default" : "asc")}
        >
          <Text style={styles.sortText}>
            {sortBy === "asc" ? "↑ Prix" : sortBy === "desc" ? "↓ Prix" : "Trier"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.cream },

  // — Header (dark bar, serif logo, letterSpacing)
  header: {
    backgroundColor: theme.colors.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logo: {
    color: theme.colors.cream,
    fontSize: 20,
    fontFamily: theme.fonts.serif,
    fontWeight: "600",
    letterSpacing: 6,  // matches page.tsx letterSpacing: "0.12em"
  },
  cartBtn: { position: "relative" },
  cartIcon: { fontSize: 22 },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#dc2626",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontFamily: theme.fonts.sansSerif, fontWeight: "700" },

  // — Hero (dark, serif italic)
  hero: {
    backgroundColor: theme.colors.ink,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  heroSub: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.sansSerif,
    fontSize: 11,
    letterSpacing: 4,          // "0.15em"
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "300",
  },
  heroTitle: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.serif,
    fontSize: 30,
    fontStyle: "italic",
    lineHeight: 38,
  },

  // — Search + Sort
  searchRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingBottom: 4,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,          // 2px — sharp
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.sansSerif,
    color: theme.colors.ink,
    padding: 0,
  },
  sortBtn: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,          // 2px
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sortText: { fontSize: 13, fontFamily: theme.fonts.sansSerif, color: theme.colors.ink, fontWeight: "500" },

  // — Category chips — square (borderRadius: 2) like page.tsx .cat-btn
  catScroll: { paddingVertical: 12 },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,          // 2px — matches page.tsx
    borderWidth: 1,
    borderColor: theme.colors.ink,
  },
  catChipActive: { backgroundColor: theme.colors.ink },
  catChipText: {
    fontSize: 12,
    fontFamily: theme.fonts.sansSerif,
    color: theme.colors.ink,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  catChipTextActive: { color: theme.colors.cream },

  // — Grid
  grid: { paddingHorizontal: 16, paddingBottom: 32 },
  row: { justifyContent: "space-between" },
  empty: { flex: 1, alignItems: "center", paddingTop: 48 },
  emptyText: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    fontStyle: "italic",
    color: theme.colors.muted,
  },
});
