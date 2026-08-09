import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext.jsx';
import { addressService, orderService, paymentMethodService, paymentService } from '../services/api.js';
import Button from '../components/Button.jsx';

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

let stripePromise = null;
function getStripePromise(key) {
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

/* ── Onglet Informations ── */
const ProfileSection = ({ user, updateProfile, changePassword }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
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
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white">Informations personnelles</h2>
        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Nom d'utilisateur</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Adresse e-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none" />
            </div>
          </div>
          {profileMsg && <p className={`text-sm ${profileMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{profileMsg.text}</p>}
          <Button type="submit" loading={savingProfile}>Sauvegarder les modifications</Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">Changer le mot de passe</h3>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Mot de passe actuel</label>
              <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Nouveau mot de passe</label>
              <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none" />
            </div>
          </div>
          {passwordMsg && <p className={`text-sm ${passwordMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{passwordMsg.text}</p>}
          <Button type="submit" variant="secondary" loading={savingPassword}>Modifier le mot de passe</Button>
        </form>
      </div>
    </div>
  );
};

/* ── Onglet Commandes ── */
const SubscriptionsSection = ({ highlightedOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { orderService.list().then(setOrders).finally(() => setLoading(false)); }, []);

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="text-3xl">📦</span>
        <p className="mt-4 text-gray-400">Aucune commande pour le moment.</p>
        <Link to="/catalogue" className="mt-4 inline-block"><Button variant="primary">Voir le catalogue</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const status = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
        return (
          <div key={o.id} className={`rounded-xl border border-gray-800 bg-gray-900 p-4 ${highlightedOrder == o.id ? 'ring-2 ring-blue-600' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Commande #{o.id}</p>
                <p className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {o.items.map((i) => `${i.product_name} × ${i.quantity}`).join(', ')}
            </p>
            <p className="mt-1 font-semibold text-white">{o.total_amount} € / mois</p>
          </div>
        );
      })}
    </div>
  );
};

/* ── Onglet Adresses ── */
const AddressesSection = () => {
  const [addresses, setAddresses] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
  const [loading, setLoading] = useState(true);

  const load = () => addressService.list().then(setAddresses).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addressService.create(form);
    setAdding(false);
    setForm({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette adresse ?')) return;
    await addressService.remove(id);
    load();
  };

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Carnet d'adresses</h2>
        <Button variant="outline" size="sm" onClick={() => setAdding(!adding)}>{adding ? 'Annuler' : '+ Ajouter'}</Button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" required onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
            <input placeholder="Nom" required onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <input placeholder="Adresse" required onChange={(e) => setForm({ ...form, address1: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Code postal" required onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
            <input placeholder="Ville" required onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <Button type="submit" size="sm">Enregistrer</Button>
        </form>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm">
            <p className="font-medium text-white">{a.first_name} {a.last_name}</p>
            <p className="text-gray-400">{a.address1}</p>
            <p className="text-gray-400">{a.postal_code} {a.city}, {a.country}</p>
            <button onClick={() => handleDelete(a.id)} className="mt-2 text-xs text-red-400 hover:underline">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Onglet Paiement ── */
const AddCardForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError('');
    const { error: confirmError, setupIntent } = await stripe.confirmSetup({ elements, redirect: 'if_required' });
    if (confirmError) { setError(confirmError.message); setSubmitting(false); return; }
    if (setupIntent?.status === 'succeeded') {
      setTimeout(onSuccess, 1200); // laisse le webhook Stripe créer l'enregistrement
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="rounded-lg border border-blue-800/40 bg-blue-950/20 px-4 py-2 text-xs text-blue-300">
        🔒 Paiement sécurisé PCI-DSS via Stripe
      </div>
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" size="sm" loading={submitting}>Enregistrer la carte</Button>
    </form>
  );
};

const PaymentsSection = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishableKey, setPublishableKey] = useState(null);
  const [adding, setAdding] = useState(false);
  const [setupSecret, setSetupSecret] = useState(null);

  const load = () => paymentMethodService.list().then(setMethods).finally(() => setLoading(false));
  useEffect(() => {
    load();
    paymentService.getConfig().then((d) => setPublishableKey(d.publishable_key));
  }, []);

  const deleteMethod = async (id) => { await paymentMethodService.remove(id); load(); };
  const setDefault = async (id) => { await paymentMethodService.setDefault(id); load(); };

  const startAddCard = async () => {
    setAdding(true);
    const data = await paymentService.createSetupIntent();
    setSetupSecret(data.client_secret);
  };

  const handleCardAdded = () => { setAdding(false); setSetupSecret(null); load(); };

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Méthodes de paiement</h2>
        <Button variant="outline" size="sm" onClick={() => setAdding(!adding)}>{adding ? 'Annuler' : '+ Ajouter une carte'}</Button>
      </div>

      <div className="mt-4 space-y-2">
        {methods.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm">
            <span className="text-gray-300 capitalize">💳 {m.brand} •••• {m.last4}</span>
            <div className="flex items-center gap-3">
              {m.is_default ? (
                <span className="text-xs text-blue-400">Par défaut</span>
              ) : (
                <button onClick={() => setDefault(m.id)} className="text-xs text-blue-400 hover:underline">Définir par défaut</button>
              )}
              <button onClick={() => deleteMethod(m.id)} className="text-xs text-red-400 hover:underline">Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {adding && !setupSecret && (
        <div className="mt-4">
          <Button size="sm" onClick={startAddCard}>Préparer le formulaire</Button>
        </div>
      )}
      {adding && setupSecret && publishableKey && (
        <Elements stripe={getStripePromise(publishableKey)} options={{ clientSecret: setupSecret, appearance: { theme: 'night' } }}>
          <AddCardForm onSuccess={handleCardAdded} />
        </Elements>
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   Page Account principale
════════════════════════════════════════ */
const Account = () => {
  const { user, logout, updateProfile, changePassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedOrder = searchParams.get('commande');
  const [activeTab, setActiveTab] = useState(highlightedOrder ? 'subscriptions' : 'profile');

  if (!user) return null;

  const initials = (user.username || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">{initials}</div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.username}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => { logout(); navigate('/'); }}>
              Se déconnecter
            </Button>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {activeTab === 'profile' && <ProfileSection user={user} updateProfile={updateProfile} changePassword={changePassword} />}
        {activeTab === 'subscriptions' && <SubscriptionsSection highlightedOrder={highlightedOrder} />}
        {activeTab === 'addresses' && <AddressesSection />}
        {activeTab === 'payments' && <PaymentsSection />}
      </div>
    </div>
  );
};

export default Account;
