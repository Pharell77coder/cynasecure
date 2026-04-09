import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { theme } from "../data/theme";
import { useCart } from "../data/CartContext";

type Props = { navigation: any };

export const CartScreen = ({ navigation }: Props) => {
  const { cart, removeFromCart, changeQty, clearCart, total } = useCart();
  const [ordered, setOrdered] = useState(false);

  const handleOrder = () => {
    setOrdered(true);
    setTimeout(() => {
      clearCart();
      setOrdered(false);
      navigation.navigate("Home");
    }, 2000);
  };

  // — Empty state
  if (cart.length === 0 && !ordered) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Panier</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛍</Text>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>Découvrez notre collection</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.shopBtnText}>Découvrir la boutique</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // — Order confirmation
  if (ordered) {
    return (
      <SafeAreaView style={[styles.safe, styles.confirmedSafe]}>
        <Text style={styles.confirmedEmoji}>✓</Text>
        <Text style={styles.confirmedTitle}>Commande confirmée !</Text>
        <Text style={styles.confirmedSubtitle}>
          Merci pour votre achat. Vous serez livré sous 2–4 jours.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          Panier ({cart.reduce((s, i) => s + i.qty, 0)})
        </Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Vider le panier", "Êtes-vous sûr ?", [
              { text: "Annuler", style: "cancel" },
              { text: "Vider", style: "destructive", onPress: clearCart },
            ])
          }
        >
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          // Cart item — matches page.tsx cart panel row layout
          <View style={styles.cartItem}>
            {/* Image thumbnail — #f0ede6 background, emoji 32px, borderRadius 2 */}
            <View style={styles.itemImage}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.itemInfo}>
              {/* Name — Cormorant Garamond */}
              <Text style={styles.itemName}>{item.name}</Text>
              {/* Price — DM Sans, muted */}
              <Text style={styles.itemPrice}>{item.price} €</Text>
              {/* Qty controls — thin border, sharp (26×26 like page.tsx) */}
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemRight}>
              {/* Total — Cormorant */}
              <Text style={styles.itemTotal}>{item.price * item.qty} €</Text>
              {/* Remove — underline text like page.tsx "Retirer" */}
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeText}>Retirer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          // Summary block — matches page.tsx cart panel summary layout
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{total} €</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>Gratuite</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total} €</Text>
            </View>
          </View>
        }
      />

      {/* CTA — matches page.tsx: full-width, ink bg, DM Sans uppercase */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} activeOpacity={0.85}>
          <Text style={styles.orderBtnText}>Commander — {total} €</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.cream },

  // — Confirmation
  confirmedSafe: { alignItems: "center", justifyContent: "center", padding: 32 },
  confirmedEmoji: { fontSize: 64, marginBottom: 20 },
  confirmedTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.ink,
    marginBottom: 12,
  },
  confirmedSubtitle: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 15,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "300",
  },

  // — Nav
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backText: { fontFamily: theme.fonts.sansSerif, fontSize: 14, color: theme.colors.ink },
  navTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.ink,
  },
  clearText: { fontFamily: theme.fonts.sansSerif, fontSize: 13, color: "#dc2626" },

  // — Empty
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    fontStyle: "italic",           // matches page.tsx "Votre panier est vide" italic
    color: theme.colors.muted,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 28,
    fontWeight: "300",
  },
  shopBtn: {
    backgroundColor: theme.colors.ink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.radius.sm,           // 2px
  },
  shopBtnText: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.sansSerif,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // — List
  list: { padding: 16, paddingBottom: 8 },

  // Cart item — matches page.tsx row: #f0ede6 thumb 70×70, Cormorant name, DM Sans meta
  cartItem: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,           // 2px
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    overflow: "hidden",
    alignItems: "center",
  },
  itemImage: {
    backgroundColor: theme.colors.sand,     // #f0ede6
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemEmoji: { fontSize: 32 },
  itemInfo: { flex: 1, padding: 12 },
  itemName: {
    fontFamily: theme.fonts.serif,
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.ink,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 10,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  // Qty buttons — matches page.tsx: 26×26, border #c8c4ba, transparent bg, borderRadius 2
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.sm,           // 2px
    borderWidth: 1,
    borderColor: theme.colors.stone,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  qtyBtnText: { fontSize: 16, color: theme.colors.ink, lineHeight: 20 },
  qtyText: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 14,
    minWidth: 20,
    textAlign: "center",
  },
  itemRight: { padding: 12, alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" },
  itemTotal: {
    fontFamily: theme.fonts.serif,
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.ink,
    marginBottom: 8,
  },
  // Remove — underline text like page.tsx "Retirer"
  removeText: {
    fontFamily: theme.fonts.sansSerif,
    fontSize: 12,
    color: theme.colors.muted,
    textDecorationLine: "underline",
  },

  // — Summary — matches page.tsx cart panel summary section
  summary: {
    margin: 16,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,           // 2px
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontFamily: theme.fonts.sansSerif, fontSize: 14, color: theme.colors.muted },
  summaryValue: { fontFamily: theme.fonts.sansSerif, fontSize: 14, color: theme.colors.ink },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginBottom: 0 },
  // Total — Cormorant, 22px like page.tsx
  totalLabel: { fontFamily: theme.fonts.serif, fontSize: 22, fontWeight: "600", color: theme.colors.ink },
  totalValue: { fontFamily: theme.fonts.serif, fontSize: 22, fontWeight: "600", color: theme.colors.ink },

  // — Bottom CTA — matches page.tsx: full-width, ink, DM Sans uppercase letterSpacing
  bottomBar: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.cream,
  },
  orderBtn: {
    backgroundColor: theme.colors.ink,
    paddingVertical: 16,
    borderRadius: theme.radius.sm,           // 2px
    alignItems: "center",
  },
  orderBtnText: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.sansSerif,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",             // matches page.tsx CTA
  },
});
