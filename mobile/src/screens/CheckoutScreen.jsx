import { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import { CartContext } from '../context/CartContext';
import { addressService, paymentService } from '../services/api';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme';

const STEPS = ['Adresse', 'Paiement', 'Confirmation'];

const Field = ({ label, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const Stepper = ({ current }) => (
  <View style={styles.stepper}>
    {STEPS.slice(0, 2).map((s, i) => (
      <View key={i} style={styles.stepItem}>
        <View style={[styles.stepDot, i <= current && styles.stepDotActive, i < current && styles.stepDotDone]}>
          <Text style={[styles.stepDotText, i <= current && styles.stepDotTextActive]}>{i < current ? '✓' : i + 1}</Text>
        </View>
        <Text style={[styles.stepLabel, i === current && styles.stepLabelActive]}>{s}</Text>
        {i < 1 && <View style={[styles.stepLine, i < current && styles.stepLineDone]} />}
      </View>
    ))}
  </View>
);

/* ── Étape 0 : Adresse ── */
const StepAddress = ({ addresses, selectedId, onSelect, onCreated, onNext, loading }) => {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await addressService.create(form);
      onCreated(data.address);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'adresse.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      {addresses.length > 0 && !showForm && (
        <View style={{ gap: spacing[2] }}>
          {addresses.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.addressCard, selectedId === a.id && styles.addressCardActive]}
              onPress={() => onSelect(a.id)}
            >
              <View style={[styles.radio, selectedId === a.id && styles.radioActive]} />
              <Text style={styles.addressText}>
                {a.first_name} {a.last_name}{'\n'}{a.address1}, {a.postal_code} {a.city}, {a.country}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setShowForm(true)}>
            <Text style={styles.link}>+ Ajouter une nouvelle adresse</Text>
          </TouchableOpacity>
        </View>
      )}

      {showForm && (
        <View style={{ gap: spacing[1] }}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.row2}>
            <View style={{ flex: 1 }}><Field label="Prénom" value={form.first_name} onChangeText={(v) => handleChange('first_name', v)} placeholder="Jean" /></View>
            <View style={{ flex: 1 }}><Field label="Nom" value={form.last_name} onChangeText={(v) => handleChange('last_name', v)} placeholder="Dupont" /></View>
          </View>
          <Field label="Adresse" value={form.address1} onChangeText={(v) => handleChange('address1', v)} placeholder="10 rue de la Paix" />
          <View style={styles.row2}>
            <View style={{ flex: 1 }}><Field label="Code postal" value={form.postal_code} onChangeText={(v) => handleChange('postal_code', v)} keyboardType="number-pad" placeholder="75001" /></View>
            <View style={{ flex: 1 }}><Field label="Ville" value={form.city} onChangeText={(v) => handleChange('city', v)} placeholder="Paris" /></View>
          </View>
          <Field label="Pays" value={form.country} onChangeText={(v) => handleChange('country', v)} placeholder="France" />

          <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] }}>
            <Button onPress={handleCreate} size="md" loading={saving}>Enregistrer l'adresse</Button>
            {addresses.length > 0 && <Button onPress={() => setShowForm(false)} variant="ghost" size="md">Annuler</Button>}
          </View>
        </View>
      )}

      <Button onPress={onNext} variant="primary" size="lg" fullWidth disabled={!selectedId} loading={loading} style={{ marginTop: spacing[5] }}>
        Continuer →
      </Button>
    </View>
  );
};

/* ── Étape 2 : Confirmation ── */
const StepConfirmation = ({ orderId }) => {
  const navigation = useNavigation();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing[10] }}>
      <Text style={{ fontSize: 60 }}>✅</Text>
      <Text style={styles.confirmTitle}>Commande confirmée !</Text>
      <Text style={styles.confirmText}>Un e-mail de confirmation vous a été envoyé. Bienvenue chez Cyna !</Text>
      <Button onPress={() => navigation.navigate('AccountTab', { screen: 'Orders' })} variant="primary" size="lg" fullWidth style={{ marginTop: spacing[6] }}>
        Voir ma commande
      </Button>
      <Button onPress={() => navigation.navigate('HomeTab')} variant="outline" size="lg" fullWidth style={{ marginTop: spacing[3] }}>
        Retour à l'accueil
      </Button>
    </View>
  );
};

/* ════════════════════════════════════════
   Écran principal
════════════════════════════════════════ */
const CheckoutScreen = () => {
  // unitPriceFor : indispensable pour que le récap affiche le bon prix par ligne
  // quand un article est en facturation annuelle (x10, -17%), pas juste price_monthly.
  const { cart, cartTotal, unitPriceFor, clearCart } = useContext(CartContext);
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && step !== 2) navigation.navigate('CatalogueTab');
  }, [cart, step]);

  useEffect(() => {
    addressService.list()
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddressId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleAddressCreated = (address) => {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
  };

  const goToPayment = async () => {
    setPreparingPayment(true);
    setError('');
    try {
      // billing_period ajouté ici : sans lui, le backend calcule le PaymentIntent
      // au tarif mensuel même pour les lignes souscrites en annuel (cf. Checkout.jsx web).
      const items = cart.map((i) => ({ product_id: i.id, quantity: i.quantity, billing_period: i.billing_period }));
      const data = await paymentService.createPaymentIntent(items, selectedAddressId);
      setOrderId(data.order_id);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Cyna',
        paymentIntentClientSecret: data.client_secret,
        allowsDelayedPaymentMethods: false,
        returnURL: 'cyna://stripe-redirect',
      });
      if (initError) throw new Error(initError.message);

      setStep(1);
      setProcessingPayment(true);
      const { error: presentError } = await presentPaymentSheet();
      setProcessingPayment(false);

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          setError(presentError.message);
        }
        return;
      }

      clearCart();
      setStep(2);
    } catch (err) {
      const detail = err.error ? `${err.message} : ${err.error}` : err.message;
      setError(detail || 'Erreur lors de la préparation du paiement.');
    } finally {
      setPreparingPayment(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing[8] }}>
        {step < 2 && <Stepper current={step} />}

        <View style={styles.card}>
          {step < 2 && cart.length > 0 && (
            <View style={styles.recapBox}>
              {cart.map((i) => (
                <View key={`${i.id}-${i.billing_period}`} style={styles.recapLine}>
                  <Text style={styles.recapLabel}>
                    {i.name} × {i.quantity} ({i.billing_period === 'annual' ? 'annuel' : 'mensuel'})
                  </Text>
                  <Text style={styles.recapValue}>{unitPriceFor(i) * i.quantity} €</Text>
                </View>
              ))}
              <View style={[styles.recapLine, { borderBottomWidth: 0, paddingTop: spacing[2] }]}>
                <Text style={styles.recapTotalLabel}>Total</Text>
                <Text style={styles.recapTotalValue}>{cartTotal} €</Text>
              </View>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {step === 0 && (
            <>
              <Text style={styles.cardTitle}>Adresse de facturation</Text>
              <StepAddress
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onCreated={handleAddressCreated}
                onNext={goToPayment}
                loading={preparingPayment}
              />
            </>
          )}

          {step === 1 && processingPayment && (
            <View style={{ alignItems: 'center', padding: spacing[8] }}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={{ marginTop: spacing[4], color: colors.textMuted }}>Ouverture du paiement sécurisé Stripe…</Text>
            </View>
          )}

          {step === 2 && <StepConfirmation orderId={orderId} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgLight },

  stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: spacing[5] },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { fontSize: typography.sm, fontWeight: '700', color: colors.textMuted },
  stepDotTextActive: { color: 'white' },
  stepLabel: { fontSize: typography.xs, color: colors.textMuted, marginHorizontal: spacing[2], fontWeight: '500' },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  stepLine: { width: 30, height: 2, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: colors.success },

  card: { margin: spacing[4], backgroundColor: colors.bgWhite, borderRadius: radius.xl, padding: spacing[5] },
  cardTitle: { fontSize: typography.xl, fontWeight: '800', color: colors.primary, marginBottom: spacing[4] },

  recapBox: { backgroundColor: colors.bgLight, borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[4] },
  recapLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[1], borderBottomWidth: 1, borderColor: colors.border },
  recapLabel: { fontSize: typography.sm, color: colors.textMuted, flex: 1 },
  recapValue: { fontSize: typography.sm, color: colors.textMuted },
  recapTotalLabel: { fontSize: typography.base, fontWeight: '800', color: colors.primary },
  recapTotalValue: { fontSize: typography.base, fontWeight: '900', color: colors.primary },

  row2: { flexDirection: 'row', gap: spacing[3] },
  field: { marginBottom: spacing[3] },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[1] },
  input: { borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, padding: spacing[3], fontSize: typography.base, color: colors.textPrimary, backgroundColor: colors.bgLight },

  addressCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, padding: spacing[3] },
  addressCardActive: { borderColor: colors.primary, backgroundColor: colors.bgLight },
  radio: { width: 18, height: 18, borderRadius: radius.full, borderWidth: 2, borderColor: colors.border, marginTop: 2 },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  addressText: { fontSize: typography.sm, color: colors.textPrimary, flex: 1, lineHeight: 20 },
  link: { fontSize: typography.sm, color: colors.secondary, fontWeight: '700' },

  errorText: { fontSize: typography.sm, color: colors.danger, marginBottom: spacing[3] },

  confirmTitle: { fontSize: typography['2xl'], fontWeight: '900', color: colors.primary, marginTop: spacing[4] },
  confirmText: { fontSize: typography.base, color: colors.textMuted, textAlign: 'center', marginTop: spacing[2], paddingHorizontal: spacing[6] },
});

export default CheckoutScreen;
