import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { BADGE_COLORS } from "../data/products";
import { theme } from "../data/theme";
import { useCart } from "../data/CartContext";

type Props = { route: any; navigation: any };

export const DetailScreen = ({ route, navigation }: Props) => {
  const { product } = route.params;
  const { addToCart, favorites, toggleFavorite, cartCount } = useCart();
  const isFav = favorites.includes(product.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛍</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image area — matches page.tsx: background #f0ede6, height ~260, emoji centered */}
        <View style={styles.imageArea}>
          <Text style={styles.emoji}>{product.emoji}</Text>
          {product.badge && (
            <View style={[styles.badge, { backgroundColor: BADGE_COLORS[product.badge] }]}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(product.id)}>
            <Text style={styles.favIcon}>{isFav ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category — DM Sans, uppercase, muted, letterSpacing */}
          <Text style={styles.category}>{product.category}</Text>

          {/* Name — Cormorant Garamond, large */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Text key={s} style={[styles.star, { opacity: s <= Math.round(product.rating) ? 1 : 0.25 }]}>
                ★
              </Text>
            ))}
            <Text style={styles.ratingLabel}>{product.rating} · {product.reviews} avis</Text>
          </View>

          {/* Description — DM Sans, light weight, dimmed */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Details card — thin border, sharp corners */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Composition & détails</Text>
            {product.details.map((d: string, i: number) => (
              <View key={i} style={styles.detailRow}>
                <View style={styles.dot} />
                <Text style={styles.detailText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Delivery cards */}
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryIcon}>🚚</Text>
            <View>
              <Text style={styles.deliveryTitle}>Livraison gratuite</Text>
              <Text style={styles.deliverySubtitle}>Livré en 2–4 jours ouvrés</Text>
            </View>
          </View>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryIcon}>↩</Text>
            <View>
              <Text style={styles.deliveryTitle}>Retours gratuits</Text>
              <Text style={styles.deliverySubtitle}>30 jours pour changer d'avis</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar — price (Cormorant) + CTA button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Prix</Text>
          <Text style={styles.bottomPrice}>{product.price} €</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, added && styles.addBtnSuccess]}
          onPress={handleAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>
            {added ? "✓ Ajouté !" : "Ajouter au panier"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.cream },

  // — Nav
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 14, fontFamily: theme.fonts.sansSerif, color: theme.colors.ink },
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

  // — Image area — matches page.tsx: #f0ede6, 260h
  imageArea: {
    backgroundColor: theme.colors.sand,    // #f0ede6
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: { fontSize: 96 },                  // matches "fontSize: 96" in page.tsx detail modal
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,                        // sharp
  },
  badgeText: {
    color: "#fff",
    fontFamily: theme.fonts.sansSerif,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  favBtn: { position: "absolute", top: 16, right: 16 },
  favIcon: { fontSize: 22 },

  // — Content
  content: { padding: 20, paddingBottom: 8 },

  // category — matches page.tsx: DM Sans 11px, uppercase, muted, letterSpacing 0.1em
  category: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 11,
    color: theme.colors.muted,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "300",
  },
  // name — Cormorant Garamond 32px like page.tsx detail modal
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    fontWeight: "600",
    color: theme.colors.ink,
    marginBottom: 10,
    lineHeight: 38,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 2 },
  star: { fontSize: 16, color: "#d97706" },
  ratingLabel: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 13,
    color: theme.colors.muted,
    marginLeft: 6,
  },
  // description — DM Sans, light, dimmed — matches page.tsx "fontWeight: 300, color: #4a4640"
  description: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 15,
    color: theme.colors.dimmed,
    lineHeight: 26,             // "lineHeight: 1.7" × 15
    marginBottom: 24,
    fontWeight: "300",
  },
  // Details card — thin border, sharp corners
  detailsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,           // 2px
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 11,
    color: theme.colors.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 10 },
  dot: { width: 5, height: 5, borderRadius: 2, backgroundColor: theme.colors.stone },
  detailText: { fontFamily: theme.fonts.sansSerif, fontSize: 14, color: theme.colors.ink, flex: 1 },
  // Delivery rows — thin border, sharp
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    padding: 14,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,           // 2px
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deliveryIcon: { fontSize: 20 },
  deliveryTitle: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.ink,
    marginBottom: 2,
  },
  deliverySubtitle: { fontFamily: theme.fonts.sansSerif, fontSize: 12, color: theme.colors.muted },

  // — Bottom bar — matches page.tsx: Cormorant price, uppercase CTA
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.cream,
  },
  bottomLabel: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 11,
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 2,
  },
  bottomPrice: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,                            // matches page.tsx "fontSize: 28"
    fontWeight: "600",
    color: theme.colors.ink,
  },
  addBtn: {
    backgroundColor: theme.colors.ink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.radius.sm,           // 2px — matches page.tsx buttons
  },
  addBtnSuccess: { backgroundColor: theme.colors.success },
  addBtnText: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.sansSerif,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",             // matches page.tsx CTA
  },
});
