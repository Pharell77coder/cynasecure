import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { BADGE_COLORS } from "../data/products";
import { theme } from "../data/theme";
import { useCart } from "../data/CartContext";

type Props = {
  route: any;
  navigation: any;
};

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
      {/* Nav bar */}
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
        {/* Image area */}
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
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map((s) => (
              <Text key={s} style={[styles.star, { opacity: s <= Math.round(product.rating) ? 1 : 0.25 }]}>★</Text>
            ))}
            <Text style={styles.ratingLabel}>{product.rating} · {product.reviews} avis</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Composition & détails</Text>
            {product.details.map((d: string, i: number) => (
              <View key={i} style={styles.detailRow}>
                <View style={styles.dot} />
                <Text style={styles.detailText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Delivery */}
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

      {/* Bottom bar */}
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
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e4dc",
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 14, color: theme.colors.ink },
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
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  imageArea: {
    backgroundColor: theme.colors.sand,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: { fontSize: 100 },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  favBtn: { position: "absolute", top: 16, right: 16 },
  favIcon: { fontSize: 22 },
  content: { padding: 20, paddingBottom: 8 },
  category: {
    fontSize: 11,
    color: theme.colors.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.ink,
    marginBottom: 10,
    lineHeight: 34,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 2 },
  star: { fontSize: 16, color: "#d97706" },
  ratingLabel: { fontSize: 13, color: theme.colors.muted, marginLeft: 6 },
  description: {
    fontSize: 15,
    color: theme.colors.dimmed,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#e8e4dc",
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 12,
    color: theme.colors.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.stone },
  detailText: { fontSize: 14, color: theme.colors.ink, flex: 1 },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
    padding: 14,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#e8e4dc",
  },
  deliveryIcon: { fontSize: 20 },
  deliveryTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.ink, marginBottom: 2 },
  deliverySubtitle: { fontSize: 12, color: theme.colors.muted },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#e8e4dc",
    backgroundColor: theme.colors.cream,
  },
  bottomLabel: { fontSize: 11, color: theme.colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  bottomPrice: { fontFamily: theme.fonts.serif, fontSize: 24, fontWeight: "700", color: theme.colors.ink },
  addBtn: {
    backgroundColor: theme.colors.ink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.radius.sm,
  },
  addBtnSuccess: { backgroundColor: theme.colors.success },
  addBtnText: { color: theme.colors.cream, fontSize: 14, fontWeight: "600", letterSpacing: 0.5 },
});
