import { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { CartContext } from '../context/CartContext';
import { addressService, paymentService } from '../services/api';
import Button from '../components/Button';

const STEPS = ['Adresse', 'Paiement', 'Récapitulatif', 'Confirmation'];

/* ── Étape 1 : Adresse ── */
function StepAddress({ onNext, addresses, selectedId, onSelect, onCreated }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await addressService.create(form);
      onCreated(data.address);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {addresses.length > 0 && !showForm && (
        <View style={{ gap: 8 }}>
          {addresses.map((a) => (
            <View
              key={a.id}
              onTouchEnd={() => onSelect(a.id)}
              className={`rounded-lg border p-3 ${selectedId === a.id ? 'border-blue-600 bg-blue-950/30' : 'border-gray-800'}`}
            >
              <Text className="text-sm text-gray-300">
                {a.first_name} {a.last_name}{'\n'}{a.address1}, {a.postal_code} {a.city}, {a.country}
              </Text>
            </View>
          ))}
          <Text className="text-sm text-blue-400" onPress={() => setShowForm(true)}>
            + Ajouter une nouvelle adresse
          </Text>
        </View>
      )}

      {showForm && (
        <View style={{ gap: 12 }}>
          {error && <Text className="text-sm text-red-400">{error}</Text>}
          <View className="flex-row gap-3">
            <TextInput
              placeholder="Prénom" placeholderTextColor="#6b7280" value={form.first_name}
              onChangeText={(v) => setField('first_name', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
            <TextInput
              placeholder="Nom" placeholderTextColor="#6b7280" value={form.last_name}
              onChangeText={(v) => setField('last_name', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
          </View>
          <TextInput
            placeholder="Adresse" placeholderTextColor="#6b7280" value={form.address1}
            onChangeText={(v) => setField('address1', v)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
          />
          <View className="flex-row gap-3">
            <TextInput
              placeholder="Code postal" placeholderTextColor="#6b7280" value={form.postal_code}
              onChangeText={(v) => setField('postal_code', v)} keyboardType="numeric"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
            <TextInput
              placeholder="Ville" placeholderTextColor="#6b7280" value={form.city}
              onChangeText={(v) => setField('city', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
          </View>
          <View className="rounded-lg border border-gray-700 bg-gray-800">
            <Picker selectedValue={form.country} onValueChange={(v) => setField('country', v)} style={{ color: '#fff' }} dropdownIconColor="#fff">
              <Picker.Item label="France" value="France" />
              <Picker.Item label="Belgique" value="Belgique" />
              <Picker.Item label="Suisse" value="Suisse" />
              <Picker.Item label="Luxembourg" value="Luxembourg" />
            </Picker>
          </View>
          <View className="flex-row gap-2">
            <Button size="sm" loading={saving} onPress={handleCreate}>Enregistrer l'adresse</Button>
            {addresses.length > 0 && <Button variant="ghost" size="sm" onPress={() => setShowForm(false)}>Annuler</Button>}
          </View>
        </View>
      )}

      <View className="items-end pt-2">
        <Button onPress={onNext} disabled={!selectedId} size="lg">Continuer →</Button>
      </View>
    </View>
  );
}

/* ── Étapes 2 & 3 : Paiement puis Récapitulatif ── */
function PaymentAndReview({ address, cart, cartTotal, clientSecret, sub, setSub, onBack, onConfirmed }) {
  const { confirmPayment } = useStripe();
  const [cardComplete, setCardComplete] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Étape "Paiement" → juste vérifie que la carte est complète, ne débite rien encore
  const handleValidateCard = () => {
    if (!cardComplete) {
      setError('Veuillez compléter les informations de la carte.');
      return;
    }
    setError('');
    setSub('review');
  };

  // Étape "Récapitulatif" → débite réellement la carte
  const handleConfirmPurchase = async () => {
    setConfirming(true);
    setError('');
    const { error: confirmError, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card'
    });

    if (confirmError) {
      setError(confirmError.message);
      setConfirming(false);
      return;
    }
    if (paymentIntent?.status === 'Succeeded') {
      onConfirmed();
    } else {
      setError('Le paiement est en cours de traitement.');
      setConfirming(false);
    }
  };

  return (
    <View>
      {sub === 'card' && (
        <View style={{ gap: 16 }}>
          <View className="rounded-lg border border-green-800/40 bg-green-950/20 px-4 py-2">
            <Text className="text-sm text-green-400">
              🔒 Paiement sécurisé par Stripe – vos données bancaires ne transitent jamais par nos serveurs.
            </Text>
          </View>

          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: '4242 4242 4242 4242' }}
            cardStyle={{
              backgroundColor: '#1f2937',
              textColor: '#ffffff',
              borderRadius: 8,
              placeholderColor: '#6b7280'
            }}
            style={{ width: '100%', height: 50 }}
            onCardChange={(details) => setCardComplete(details.complete)}
          />

          {error && <Text className="text-sm text-red-400">{error}</Text>}

          <View className="flex-row justify-between pt-2">
            <Button variant="ghost" size="lg" onPress={onBack}>← Retour</Button>
            <Button size="lg" disabled={!cardComplete} onPress={handleValidateCard}>Voir le récapitulatif →</Button>
          </View>
        </View>
      )}

      {sub === 'review' && (
        <View style={{ gap: 24 }}>
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-400">Services commandés</Text>
            <View className="rounded-lg border border-gray-800 p-3" style={{ gap: 4 }}>
              {cart.map((i) => (
                <Text key={`${i.id}-${i.billing_period}`} className="text-sm text-gray-300">
                  {i.name} × {i.quantity} ({i.billing_period === 'annual' ? 'annuel' : 'mensuel'})
                </Text>
              ))}
              <View className="mt-2 flex-row justify-between border-t border-gray-800 pt-2">
                <Text className="font-semibold text-white">Total</Text>
                <Text className="font-semibold text-white">{cartTotal} €</Text>
              </View>
            </View>
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-400">Adresse de facturation</Text>
            <View className="rounded-lg border border-gray-800 p-3">
              <Text className="text-sm text-gray-300">{address.first_name} {address.last_name}</Text>
              <Text className="text-sm text-gray-300">{address.address1}</Text>
              <Text className="text-sm text-gray-300">{address.postal_code} {address.city}, {address.country}</Text>
            </View>
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-400">Paiement</Text>
            <View className="rounded-lg border border-gray-800 p-3">
              <Text className="text-sm text-gray-300">
                Votre carte a été vérifiée et sera débitée de <Text className="font-bold text-white">{cartTotal} €</Text> à la confirmation.
              </Text>
            </View>
          </View>

          {error && <Text className="text-sm text-red-400">{error}</Text>}

          <View className="flex-row justify-between pt-2">
            <Button variant="ghost" size="lg" onPress={() => setSub('card')}>← Modifier</Button>
            <Button size="lg" loading={confirming} onPress={handleConfirmPurchase}>✓ Confirmer l'achat</Button>
          </View>
        </View>
      )}
    </View>
  );
}

/* ── Étape 4 : Confirmation ── */
function StepConfirmation({ orderId }) {
  const navigation = useNavigation();
  return (
    <View className="items-center py-12">
      <Text style={{ fontSize: 48 }}>✅</Text>
      <Text className="mt-4 text-2xl font-bold text-white">Commande confirmée !</Text>
      <Text className="mt-2 text-center text-gray-400">
        Un e-mail de confirmation vous a été envoyé. Bienvenue chez Cyna !
      </Text>
      <View className="mt-8 flex-row gap-3">
        <Button variant="primary" size="lg" onPress={() => navigation.navigate('AccountTab', { screen: 'Orders', params: { commande: orderId } })}>
          Voir ma commande
        </Button>
        <Button variant="outline" size="lg" onPress={() => navigation.navigate('HomeTab')}>
          Retour à l'accueil
        </Button>
      </View>
    </View>
  );
}

/* ════════════════════════════════════════
   Page Checkout principale
════════════════════════════════════════ */
export default function Checkout() {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigation = useNavigation();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [reviewSub, setReviewSub] = useState('card');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && step !== 3) navigation.navigate('CatalogueTab');
  }, [cart, step]);

  useEffect(() => {
    addressService.list().then((data) => {
      setAddresses(data);
      if (data.length > 0) setSelectedAddressId(data[0].id);
    });
  }, []);

  const handleAddressCreated = (address) => {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const goToPayment = async () => {
    setPreparingPayment(true);
    setError('');
    try {
      const data = await paymentService.createPaymentIntent(
        cart.map((i) => ({ product_id: i.id, quantity: i.quantity, billing_period: i.billing_period })),
        selectedAddressId
      );
      setClientSecret(data.client_secret);
      setOrderId(data.order_id);
      setReviewSub('card');
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreparingPayment(false);
    }
  };

  const handleConfirmed = () => {
    clearCart();
    setStep(3);
  };

  const currentDisplayStep = step === 1 ? (reviewSub === 'review' ? 2 : 1) : step;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-950">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {step < 3 && (
          <View className="mb-10 flex-row flex-wrap items-center justify-center gap-3">
            {STEPS.slice(0, 3).map((s, i) => (
              <View key={s} className="flex-row items-center gap-2">
                <View className={`h-8 w-8 items-center justify-center rounded-full ${i === currentDisplayStep ? 'bg-blue-600' : i < currentDisplayStep ? 'bg-green-600' : 'bg-gray-800'}`}>
                  <Text className={`text-sm font-semibold ${i <= currentDisplayStep ? 'text-white' : 'text-gray-500'}`}>
                    {i < currentDisplayStep ? '✓' : i + 1}
                  </Text>
                </View>
                <Text className={`text-sm ${i === currentDisplayStep ? 'text-white' : 'text-gray-500'}`}>{s}</Text>
                {i < 2 && <View className="h-px w-8 bg-gray-800" />}
              </View>
            ))}
          </View>
        )}

        <View className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          {error && <Text className="mb-4 text-sm text-red-400">{error}</Text>}

          {step === 0 && (
            <>
              <Text className="mb-4 text-lg font-semibold text-white">Adresse de facturation</Text>
              <StepAddress
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onCreated={handleAddressCreated}
                onNext={goToPayment}
              />
              {preparingPayment && <Text className="mt-4 text-sm text-gray-500">Préparation du paiement...</Text>}
            </>
          )}

          {step === 1 && clientSecret && (
            <PaymentAndReview
              address={selectedAddress || {}}
              cart={cart}
              cartTotal={cartTotal}
              clientSecret={clientSecret}
              sub={reviewSub}
              setSub={setReviewSub}
              onBack={() => setStep(0)}
              onConfirmed={handleConfirmed}
            />
          )}

          {step === 3 && <StepConfirmation orderId={orderId} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}