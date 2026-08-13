import { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme';

const icon = (name) => (name?.includes('SOC') ? '🛡️' : name?.includes('EDR') ? '💻' : '🔍');

const CartScreen = () => {
  // unitPriceFor / updateBillingPeriod : mêmes fonctions que sur le web (CartContext.jsx),
  // nécessaires pour gérer correctement le tarif annuel (x10, -17%) vs mensuel.
  const { cart, cartTotal, unitPriceFor, updateQuantity, updateBillingPeriod, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>Découvrez nos solutions de sécurité</Text>
          <Button onPress={() => navigation.navigate('CatalogueTab')} variant="primary" size="lg" style={{ marginTop: spacing[5] }}>
            Voir le catalogue
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Retire un article : il faut préciser id + billing_period, sinon on peut supprimer
  // la mauvaise ligne si le même produit existe en mensuel ET en annuel dans le panier.
  const handleRemove = (item) => {
    Alert.alert('Supprimer', `Retirer "${item.name}" du panier ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeFromCart(item.id, item.billing_period) },
    ]);
  };

  const goToCheckout = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Mon panier</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => `${item.id}-${item.billing_period}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const unitPrice = unitPriceFor(item);
          const lineTotal = unitPrice * item.quantity;
          const isAnnual = item.billing_period === 'annual';
          return (
            <View style={styles.card}>
              <View style={styles.iconBox}><Text style={styles.iconText}>{icon(item.name)}</Text></View>
              <View style={styles.info}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>

                {/* Sélecteur mensuel / annuel, équivalent du <select> web */}
                <View style={styles.periodRow}>
                  <TouchableOpacity
                    style={[styles.periodChip, !isAnnual && styles.periodChipActive]}
                    onPress={() => updateBillingPeriod(item.id, item.billing_period, 'monthly')}
                  >
                    <Text style={[styles.periodText, !isAnnual && styles.periodTextActive]}>Mensuel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.periodChip, isAnnual && styles.periodChipActive]}
                    onPress={() => updateBillingPeriod(item.id, item.billing_period, 'annual')}
                  >
                    <Text style={[styles.periodText, isAnnual && styles.periodTextActive]}>Annuel (−17%)</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.billing_period, item.quantity - 1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.billing_period, item.quantity + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={styles.price}>{lineTotal} €</Text>
                <Text style={styles.perMonth}>{isAnnual ? '/ an' : '/ mois'}</Text>
                <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Sous-total</Text><Text style={styles.summaryVal}>{cartTotal} €</Text></View>
            <View style={styles.summaryLine}><Text style={styles.summaryLabel}>TVA (20%)</Text><Text style={styles.summaryVal}>{Math.round(cartTotal * 0.2)} €</Text></View>
            <View style={[styles.summaryLine, styles.totalLine]}><Text style={styles.totalLabel}>Total TTC</Text><Text style={styles.totalVal}>{Math.round(cartTotal * 1.2)} €</Text></View>

            {!user && (
              <View style={styles.loginHint}>
                <Text style={styles.loginHintText}>
                  💡 <Text style={styles.loginHintLink} onPress={() => navigation.navigate('Login')}>Connectez-vous</Text> pour finaliser votre commande.
                </Text>
              </View>
            )}

            <Button onPress={goToCheckout} variant="primary" size="lg" fullWidth style={{ marginTop: spacing[4] }}>
              Passer à la caisse →
            </Button>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgLight },
  title: { fontSize: typography['3xl'], fontWeight: '900', color: colors.primary, letterSpacing: -0.5, padding: spacing[5], paddingBottom: spacing[3] },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8] },
  emptyIcon: { fontSize: 60, marginBottom: spacing[4] },
  emptyTitle: { fontSize: typography['2xl'], fontWeight: '800', color: colors.primary },
  emptySubtitle: { fontSize: typography.base, color: colors.textMuted, marginTop: spacing[2] },

  list: { padding: spacing[4], paddingTop: 0 },

  card: { backgroundColor: colors.bgWhite, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3], ...shadow.sm, borderWidth: 1, borderColor: colors.border },
  iconBox: { width: 52, height: 52, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 24 },

  info: { flex: 1 },
  itemName: { fontSize: typography.base, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },

  periodRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[2] },
  periodChip: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: typography.xs, fontWeight: '600', color: colors.textMuted },
  periodTextActive: { color: 'white' },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  qtyBtn: { width: 28, height: 28, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: typography.lg, fontWeight: '700', color: colors.secondary },
  qtyVal: { fontSize: typography.base, fontWeight: '700', minWidth: 24, textAlign: 'center' },

  right: { alignItems: 'flex-end' },
  price: { fontSize: typography.xl, fontWeight: '900', color: colors.primary },
  perMonth: { fontSize: typography.xs, color: colors.textMuted },
  removeBtn: { marginTop: spacing[3], padding: spacing[1] },
  removeText: { fontSize: typography.base, color: colors.textMuted },

  summary: { backgroundColor: colors.bgWhite, borderRadius: radius.xl, padding: spacing[5], ...shadow.md, borderWidth: 1, borderColor: colors.border },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderColor: colors.border },
  summaryLabel: { fontSize: typography.sm, color: colors.textMuted },
  summaryVal: { fontSize: typography.sm, color: colors.textMuted },
  totalLine: { borderBottomWidth: 0, paddingTop: spacing[3] },
  totalLabel: { fontSize: typography.lg, fontWeight: '800', color: colors.primary },
  totalVal: { fontSize: typography.lg, fontWeight: '900', color: colors.primary },

  loginHint: { backgroundColor: colors.bgLight, borderRadius: radius.md, padding: spacing[3], marginTop: spacing[3] },
  loginHintText: { fontSize: typography.sm, color: colors.textMuted },
  loginHintLink: { color: colors.secondary, fontWeight: '700' },
});

export default CartScreen;
