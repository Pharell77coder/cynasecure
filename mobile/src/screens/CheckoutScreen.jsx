import { useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme';

const STEPS = ['Adresse', 'Paiement', 'Confirmation'];

const Field = ({ label, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

/* ── Stepper ── */
const Stepper = ({ current }) => (
  <View style={styles.stepper}>
    {STEPS.map((s, i) => (
      <View key={i} style={styles.stepItem}>
        <View style={[styles.stepDot, i <= current && styles.stepDotActive, i < current && styles.stepDotDone]}>
          <Text style={[styles.stepDotText, i <= current && styles.stepDotTextActive]}>
            {i < current ? '✓' : i + 1}
          </Text>
        </View>
        <Text style={[styles.stepLabel, i === current && styles.stepLabelActive]}>{s}</Text>
        {i < STEPS.length - 1 && <View style={[styles.stepLine, i < current && styles.stepLineDone]} />}
      </View>
    ))}
  </View>
);

const CheckoutScreen = () => {
  const [step, setStep]       = useState(0);
  const [address, setAddress] = useState({});
  const [payment, setPayment] = useState({});
  const [loading, setLoading] = useState(false);
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    clearCart();
    Alert.alert(
      '✅ Commande confirmée !',
      'Un e-mail de confirmation vous a été envoyé. Vos services sont maintenant actifs.',
      [{ text: 'Retour à l\'accueil', onPress: () => navigation.navigate('HomeTab') }]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing[8] }}>

        <Stepper current={step} />

        {/* ── Étape 0 : Adresse ── */}
        {step === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Adresse de facturation</Text>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Prénom" value={address.firstName || ''} onChangeText={v => setAddress({ ...address, firstName: v })} placeholder="Jean" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Nom" value={address.lastName || ''} onChangeText={v => setAddress({ ...address, lastName: v })} placeholder="Dupont" />
              </View>
            </View>
            <Field label="Adresse" value={address.address1 || ''} onChangeText={v => setAddress({ ...address, address1: v })} placeholder="10 rue de la Paix" />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Code postal" value={address.postalCode || ''} onChangeText={v => setAddress({ ...address, postalCode: v })} keyboardType="number-pad" placeholder="75001" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Ville" value={address.city || ''} onChangeText={v => setAddress({ ...address, city: v })} placeholder="Paris" />
              </View>
            </View>
            <Field label="Téléphone" value={address.phone || ''} onChangeText={v => setAddress({ ...address, phone: v })} keyboardType="phone-pad" placeholder="+33 6 12 34 56 78" />
            <Button onPress={() => setStep(1)} variant="primary" size="lg" fullWidth style={{ marginTop: spacing[4] }}>
              Continuer →
            </Button>
          </View>
        )}

        {/* ── Étape 1 : Paiement ── */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeText}>🔒 Paiement sécurisé SSL via Stripe</Text>
            </View>
            <Text style={styles.cardTitle}>Informations de paiement</Text>
            <Field label="Nom sur la carte" value={payment.cardName || ''} onChangeText={v => setPayment({ ...payment, cardName: v })} placeholder="JEAN DUPONT" autoCapitalize="characters" />
            <Field label="Numéro de carte" value={payment.cardNumber || ''} onChangeText={v => setPayment({ ...payment, cardNumber: v })} keyboardType="number-pad" placeholder="1234 5678 9012 3456" maxLength={19} />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Expiration" value={payment.expiry || ''} onChangeText={v => setPayment({ ...payment, expiry: v })} placeholder="MM/AA" maxLength={5} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="CVV" value={payment.cvv || ''} onChangeText={v => setPayment({ ...payment, cvv: v })} keyboardType="number-pad" placeholder="•••" maxLength={4} secureTextEntry />
              </View>
            </View>
            <View style={styles.navRow}>
              <Button onPress={() => setStep(0)} variant="ghost" size="md">← Retour</Button>
              <Button onPress={() => setStep(2)} variant="primary" size="md">Récapitulatif →</Button>
            </View>
          </View>
        )}

        {/* ── Étape 2 : Confirmation ── */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Récapitulatif</Text>

            {/* Services */}
            <Text style={styles.recapSection}>Services commandés</Text>
            {cart.map(item => (
              <View key={`${item.id}-${item.subscriptionType}`} style={styles.recapLine}>
                <Text style={styles.recapLabel}>{item.name} × {item.quantity}</Text>
                <Text style={styles.recapValue}>{item.price * item.quantity} € / mois</Text>
              </View>
            ))}
            <View style={styles.recapTotal}>
              <Text style={styles.recapTotalLabel}>Total TTC</Text>
              <Text style={styles.recapTotalValue}>{Math.round(cartTotal * 1.2)} € / mois</Text>
            </View>

            {/* Adresse */}
            <Text style={styles.recapSection}>Adresse de facturation</Text>
            <Text style={styles.recapInfo}>{address.firstName} {address.lastName}</Text>
            <Text style={styles.recapInfo}>{address.address1}</Text>
            <Text style={styles.recapInfo}>{address.postalCode} {address.city}</Text>

            {/* Paiement */}
            <Text style={styles.recapSection}>Paiement</Text>
            <Text style={styles.recapInfo}>•••• •••• •••• {(payment.cardNumber || '').replace(/\s/g, '').slice(-4) || '****'}</Text>

            <View style={styles.navRow}>
              <Button onPress={() => setStep(1)} variant="ghost" size="md">← Modifier</Button>
              <Button onPress={handleConfirm} variant="primary" size="md" loading={loading}>✓ Confirmer</Button>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgLight },

  stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: spacing[5] },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot:  { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone:   { backgroundColor: colors.success },
  stepDotText:   { fontSize: typography.sm, fontWeight: '700', color: colors.textMuted },
  stepDotTextActive: { color: 'white' },
  stepLabel: { fontSize: typography.xs, color: colors.textMuted, marginHorizontal: spacing[2], fontWeight: '500' },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  stepLine: { width: 30, height: 2, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: colors.success },

  card: { margin: spacing[4], backgroundColor: colors.bgWhite, borderRadius: radius.xl, padding: spacing[5] },
  cardTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary, marginBottom: spacing[5] },

  row2:  { flexDirection: 'row', gap: spacing[3] },
  field: { marginBottom: spacing[4] },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[1] },
  input: {
    borderWidth: 2, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing[3], fontSize: typography.base, color: colors.textPrimary,
    backgroundColor: colors.bgLight,
  },

  secureBadge: { backgroundColor: '#D1FAE5', borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[4] },
  secureBadgeText: { color: '#065F46', fontSize: typography.sm, fontWeight: '600' },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[5] },

  recapSection: { fontSize: typography.sm, fontWeight: '700', color: colors.textMuted, marginTop: spacing[4], marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 },
  recapLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderColor: colors.border },
  recapLabel:{ fontSize: typography.sm, color: colors.textMuted },
  recapValue:{ fontSize: typography.sm, color: colors.textMuted },
  recapTotal:{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing[3] },
  recapTotalLabel: { fontSize: typography.lg, fontWeight: '800', color: colors.primary },
  recapTotalValue: { fontSize: typography.lg, fontWeight: '900', color: colors.primary },
  recapInfo: { fontSize: typography.sm, color: colors.textMuted, lineHeight: 20 },
});

export default CheckoutScreen;
