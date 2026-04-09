import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Product, BADGE_COLORS } from "../data/products";
import { theme } from "../data/theme";
import { useCart } from "../data/CartContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type Props = {
  product: Product;
  onPress: () => void;
};

export const ProductCard = ({ product, onPress }: Props) => {
  const { addToCart, favorites, toggleFavorite } = useCart();
  const isFav = favorites.includes(product.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image area */}
      <View style={styles.imageArea}>
        <Text style={styles.emoji}>{product.emoji}</Text>
        {product.badge && (
          <View style={[styles.badge, { backgroundColor: BADGE_COLORS[product.badge] }]}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => toggleFavorite(product.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.favIcon}>{isFav ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      {/* Info area */}
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{product.rating} ({product.reviews})</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>{product.price} €</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#e8e4dc",
    overflow: "hidden",
    marginBottom: 16,
  },
  imageArea: {
    backgroundColor: theme.colors.sand,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: {
    fontSize: 56,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  favIcon: {
    fontSize: 16,
  },
  info: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    color: theme.colors.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.ink,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  star: {
    fontSize: 11,
    color: "#d97706",
  },
  ratingText: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  addBtn: {
    backgroundColor: theme.colors.ink,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: theme.colors.cream,
    fontSize: 18,
    fontWeight: "300",
    lineHeight: 22,
  },
});
