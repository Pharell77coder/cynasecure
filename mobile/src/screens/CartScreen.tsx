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
          <Text style={styles.emptyTitle}>Panier vide</Text>
          <Text style={styles.emptySubtitle}>Découvrez notre collection</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.shopBtnText}>Découvrir la boutique</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (ordered) {
    return (
      <SafeAreaView style={[styles.safe, styles.confirmedSafe]}>
        <Text style={styles.confirmedEmoji}>✓</Text>
        <Text style={styles.confirmedTitle}>Commande confirmée !</Text>
        <Text style={styles.confirmedSubtitle}>Merci pour votre achat. Vous serez livré sous 2–4 jours.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Panier ({cart.reduce((s, i) => s + i.qty, 0)})</Text>
        <TouchableOpacity onPress={() => Alert.alert("Vider le panier", "Êtes-vous sûr ?", [
          { text: "Annuler", style: "cancel" },
          { text: "Vider", style: "destructive", onPress: clearCart },
        ])}>
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemImage}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price} €</Text>
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
              <Text style={styles.itemTotal}>{item.price * item.qty} €</Text>
              <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
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
  confirmedSafe: { alignItems: "center", justifyContent: "center", padding: 32 },
  confirmedEmoji: { fontSize: 64, marginBottom: 20 },
  confirmedTitle: { fontFamily: theme.fonts.serif, fontSize: 28, fontWeight: "700", color: theme.colors.ink, marginBottom: 12 },
  confirmedSubtitle: { fontSize: 15, color: theme.colors.muted, textAlign: "center", lineHeight: 22 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e4dc",
  },
  backText: { fontSize: 14, color: theme.colors.ink },
  navTitle: { fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: "600", color: theme.colors.ink },
  clearText: { fontSize: 13, color: "#dc2626" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: theme.fonts.serif, fontSize: 24, fontWeight: "600", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.colors.muted, marginBottom: 28 },
  shopBtn: {
    backgroundColor: theme.colors.ink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.radius.sm,
  },
  shopBtnText: { color: theme.colors.cream, fontSize: 14, fontWeight: "600" },
  list: { padding: 16, paddingBottom: 8 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#e8e4dc",
    marginBottom: 12,
    overflow: "hidden",
  },
  itemImage: {
    backgroundColor: theme.colors.sand,
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmoji: { fontSize: 36 },
  itemInfo: { flex: 1, padding: 12 },
  itemName: { fontFamily: theme.fonts.serif, fontSize: 15, fontWeight: "600", marginBottom: 4 },
  itemPrice: { fontSize: 13, color: theme.colors.muted, marginBottom: 10 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.stone,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 16, color: theme.colors.ink, lineHeight: 20 },
  qtyText: { fontSize: 15, fontWeight: "600", minWidth: 20, textAlign: "center" },
  itemRight: { padding: 12, alignItems: "flex-end", justifyContent: "space-between" },
  itemTotal: { fontFamily: theme.fonts.serif, fontSize: 16, fontWeight: "700" },
  removeBtn: { padding: 4 },
  removeText: { fontSize: 14, color: theme.colors.muted },
  summary: {
    margin: 16,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#e8e4dc",
    padding: 16,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: theme.colors.muted },
  summaryValue: { fontSize: 14, color: theme.colors.ink },
  totalRow: { borderTopWidth: 1, borderTopColor: "#e8e4dc", paddingTop: 12, marginBottom: 0 },
  totalLabel: { fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: "700" },
  totalValue: { fontFamily: theme.fonts.serif, fontSize: 18, fontWeight: "700" },
  bottomBar: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#e8e4dc",
    backgroundColor: theme.colors.cream,
  },
  orderBtn: {
    backgroundColor: theme.colors.ink,
    paddingVertical: 16,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  orderBtnText: { color: theme.colors.cream, fontSize: 15, fontWeight: "600", letterSpacing: 0.5 },
});
