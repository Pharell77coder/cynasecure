import { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { AuthContext } from '../context/AuthContext';
import { addressService, orderService, paymentMethodService, paymentService } from '../services/api';
import Button from '../components/Button';

const TABS = [
  { id: 'profile', label: '👤 Informations' },
  { id: 'subscriptions', label: '📋 Commandes' },
  { id: 'addresses', label: '🏠 Adresses' },
  { id: 'payments', label: '💳 Paiement' }
];

const STATUS_LABELS = {
  pending: { label: 'En attente', className: 'bg-yellow-950/50 text-yellow-400' },
  paid: { label: 'Payée', className: 'bg-green-950/50 text-green-400' },
  failed: { label: 'Échouée', className: 'bg-red-950/50 text-red-400' },
  cancelled: { label: 'Annulée', className: 'bg-gray-800 text-gray-400' }
};

/* ── Onglet Informations ── */
function ProfileSection({ user, updateProfile, changePassword }) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile({ username, email });
      setProfileMsg({ ok: true, text: "Profil mis à jour ! (si vous avez changé d'email, une nouvelle vérification est requise)" });
    } catch (err) {
      setProfileMsg({ ok: false, text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ ok: true, text: 'Mot de passe modifié !' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg({ ok: false, text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <View style={{ gap: 32 }}>
      <View>
        <Text className="text-lg font-semibold text-white">Informations personnelles</Text>
        <View className="mt-4" style={{ gap: 16 }}>
          <View>
            <Text className="mb-1 text-sm text-gray-400">Nom d'utilisateur</Text>
            <TextInput
              value={username} onChangeText={setUsername}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholderTextColor="#6b7280"
            />
          </View>
          <View>
            <Text className="mb-1 text-sm text-gray-400">Adresse e-mail</Text>
            <TextInput
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholderTextColor="#6b7280"
            />
          </View>
          {profileMsg && (
            <Text className={`text-sm ${profileMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{profileMsg.text}</Text>
          )}
          <Button loading={savingProfile} onPress={handleSaveProfile}>Sauvegarder les modifications</Button>
        </View>
      </View>

      <View>
        <Text className="text-lg font-semibold text-white">Changer le mot de passe</Text>
        <View className="mt-4" style={{ gap: 16 }}>
          <View>
            <Text className="mb-1 text-sm text-gray-400">Mot de passe actuel</Text>
            <TextInput
              secureTextEntry value={currentPassword} onChangeText={setCurrentPassword}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholderTextColor="#6b7280"
            />
          </View>
          <View>
            <Text className="mb-1 text-sm text-gray-400">Nouveau mot de passe</Text>
            <TextInput
              secureTextEntry value={newPassword} onChangeText={setNewPassword}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholderTextColor="#6b7280"
            />
          </View>
          {passwordMsg && (
            <Text className={`text-sm ${passwordMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{passwordMsg.text}</Text>
          )}
          <Button variant="secondary" loading={savingPassword} onPress={handleChangePassword}>Modifier le mot de passe</Button>
        </View>
      </View>
    </View>
  );
}

/* ── Onglet Commandes ── */
function SubscriptionsSection({ highlightedOrder }) {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderService.list().then(setOrders).finally(() => setLoading(false)); }, []);

  if (loading) return <Text className="text-gray-400">Chargement...</Text>;

  if (orders.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className="text-3xl">📦</Text>
        <Text className="mt-4 text-gray-400">Aucune commande pour le moment.</Text>
        <View className="mt-4">
          <Button variant="primary" onPress={() => navigation.navigate('CatalogueTab')}>Voir le catalogue</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {orders.map((o) => {
        const status = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
        const isHighlighted = highlightedOrder == o.id;
        return (
          <View
            key={o.id}
            className={`rounded-xl border bg-gray-900 p-4 ${isHighlighted ? 'border-blue-600' : 'border-gray-800'}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-white">Commande #{o.id}</Text>
                <Text className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString('fr-FR')}</Text>
              </View>
              <View className={`rounded-full px-3 py-1 ${status.className}`}>
                <Text className="text-xs font-medium">{status.label}</Text>
              </View>
            </View>
            <Text className="mt-2 text-sm text-gray-400">
              {o.items.map((i) => `${i.product_name} × ${i.quantity} (${i.billing_period === 'annual' ? 'annuel' : 'mensuel'})`).join(', ')}
            </Text>
            <Text className="mt-1 font-semibold text-white">{o.total_amount} € / mois</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ── Onglet Adresses ── */
function AddressesSection() {
  const [addresses, setAddresses] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
  const [loading, setLoading] = useState(true);

  const load = () => addressService.list().then(setAddresses).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleAdd = async () => {
    await addressService.create(form);
    setAdding(false);
    setForm({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
    load();
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer cette adresse ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await addressService.remove(id); load(); } }
    ]);
  };

  if (loading) return <Text className="text-gray-400">Chargement...</Text>;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">Carnet d'adresses</Text>
        <Button variant="outline" size="sm" onPress={() => setAdding(!adding)}>{adding ? 'Annuler' : '+ Ajouter'}</Button>
      </View>

      {adding && (
        <View className="mt-4 rounded-lg border border-gray-800 bg-gray-900 p-4" style={{ gap: 12 }}>
          <View className="flex-row gap-3">
            <TextInput
              placeholder="Prénom" placeholderTextColor="#6b7280" onChangeText={(v) => setField('first_name', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
            <TextInput
              placeholder="Nom" placeholderTextColor="#6b7280" onChangeText={(v) => setField('last_name', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
          </View>
          <TextInput
            placeholder="Adresse" placeholderTextColor="#6b7280" onChangeText={(v) => setField('address1', v)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
          />
          <View className="flex-row gap-3">
            <TextInput
              placeholder="Code postal" placeholderTextColor="#6b7280" keyboardType="numeric" onChangeText={(v) => setField('postal_code', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
            <TextInput
              placeholder="Ville" placeholderTextColor="#6b7280" onChangeText={(v) => setField('city', v)}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
            />
          </View>
          <Button size="sm" onPress={handleAdd}>Enregistrer</Button>
        </View>
      )}

      <View className="mt-4" style={{ gap: 12 }}>
        {addresses.map((a) => (
          <View key={a.id} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <Text className="font-medium text-white">{a.first_name} {a.last_name}</Text>
            <Text className="text-sm text-gray-400">{a.address1}</Text>
            <Text className="text-sm text-gray-400">{a.postal_code} {a.city}, {a.country}</Text>
            <Text className="mt-2 text-xs text-red-400" onPress={() => handleDelete(a.id)}>Supprimer</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Onglet Paiement ── */
function AddCardForm({ setupSecret, onSuccess }) {
  const { confirmSetupIntent } = useStripe();
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!cardComplete) {
      setError('Veuillez compléter les informations de la carte.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: confirmError, setupIntent } = await confirmSetupIntent(setupSecret, { paymentMethodType: 'Card' });
    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
      return;
    }
    if (setupIntent?.status === 'Succeeded') {
      setTimeout(onSuccess, 1200); // laisse le webhook Stripe créer l'enregistrement
    } else {
      setSubmitting(false);
    }
  };

  return (
    <View className="mt-4" style={{ gap: 12 }}>
      <View className="rounded-lg border border-blue-800/40 bg-blue-950/20 px-4 py-2">
        <Text className="text-xs text-blue-300">🔒 Paiement sécurisé PCI-DSS via Stripe</Text>
      </View>
      <CardField
        postalCodeEnabled={false}
        placeholders={{ number: '4242 4242 4242 4242' }}
        cardStyle={{ backgroundColor: '#1f2937', textColor: '#ffffff', borderRadius: 8, placeholderColor: '#6b7280' }}
        style={{ width: '100%', height: 50 }}
        onCardChange={(details) => setCardComplete(details.complete)}
      />
      {error && <Text className="text-sm text-red-400">{error}</Text>}
      <Button size="sm" loading={submitting} onPress={handleSubmit}>Enregistrer la carte</Button>
    </View>
  );
}

function PaymentsSection() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [setupSecret, setSetupSecret] = useState(null);

  const load = () => paymentMethodService.list().then(setMethods).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const deleteMethod = async (id) => { await paymentMethodService.remove(id); load(); };
  const setDefault = async (id) => { await paymentMethodService.setDefault(id); load(); };

  const startAddCard = async () => {
    setAdding(true);
    const data = await paymentService.createSetupIntent();
    setSetupSecret(data.client_secret);
  };

  const handleCardAdded = () => { setAdding(false); setSetupSecret(null); load(); };

  if (loading) return <Text className="text-gray-400">Chargement...</Text>;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">Méthodes de paiement</Text>
        <Button variant="outline" size="sm" onPress={() => setAdding(!adding)}>{adding ? 'Annuler' : '+ Ajouter une carte'}</Button>
      </View>

      <View className="mt-4" style={{ gap: 8 }}>
        {methods.map((m) => (
          <View key={m.id} className="flex-row items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4">
            <Text className="text-sm capitalize text-gray-300">💳 {m.brand} •••• {m.last4}</Text>
            <View className="flex-row items-center gap-3">
              {m.is_default ? (
                <Text className="text-xs text-blue-400">Par défaut</Text>
              ) : (
                <Text className="text-xs text-blue-400" onPress={() => setDefault(m.id)}>Définir par défaut</Text>
              )}
              <Text className="text-xs text-red-400" onPress={() => deleteMethod(m.id)}>Supprimer</Text>
            </View>
          </View>
        ))}
      </View>

      {adding && !setupSecret && (
        <View className="mt-4">
          <Button size="sm" onPress={startAddCard}>Préparer le formulaire</Button>
        </View>
      )}
      {adding && setupSecret && (
        <AddCardForm setupSecret={setupSecret} onSuccess={handleCardAdded} />
      )}
    </View>
  );
}

/* ════════════════════════════════════════
   Page Account principale
════════════════════════════════════════ */
export default function Account() {
  const { user, logout, updateProfile, changePassword } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const highlightedOrder = route.params?.commande;
  const [activeTab, setActiveTab] = useState(highlightedOrder ? 'subscriptions' : 'profile');

  if (!user) return null;

  const initials = (user.username || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('HomeTab');
  };

  return (
    <ScrollView className="flex-1 bg-gray-950">
      <View className="border-b border-gray-800 bg-gray-900 px-4 py-8">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-blue-600">
            <Text className="text-lg font-bold text-white">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">{user.username}</Text>
            <Text className="text-sm text-gray-400">{user.email}</Text>
          </View>
          <Button variant="ghost" size="sm" onPress={handleLogout}>Se déconnecter</Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6">
          <View className="flex-row gap-2">
            {TABS.map((tab) => (
              <Text
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                {tab.label}
              </Text>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="px-4 py-8">
        {activeTab === 'profile' && <ProfileSection user={user} updateProfile={updateProfile} changePassword={changePassword} />}
        {activeTab === 'subscriptions' && <SubscriptionsSection highlightedOrder={highlightedOrder} />}
        {activeTab === 'addresses' && <AddressesSection />}
        {activeTab === 'payments' && <PaymentsSection />}
      </View>
    </ScrollView>
  );
}