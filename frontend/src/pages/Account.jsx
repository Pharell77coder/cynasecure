import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = 'http://localhost:5000';
let stripePromise = null;
function getStripePromise(key) {
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

const STATUS_LABELS = {
  pending: { label: 'En attente', className: 'text-yellow-400' },
  paid: { label: 'Payée', className: 'text-green-400' },
  failed: { label: 'Échouée', className: 'text-red-400' },
  cancelled: { label: 'Annulée', className: 'text-gray-500' }
};

function AddCardForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError('');

    const { error: confirmError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required'
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
      return;
    }

    if (setupIntent && setupIntent.status === 'succeeded') {
      // Laisse un court instant au webhook Stripe pour créer l'enregistrement côté back.
      setTimeout(() => onSuccess(), 1200);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={!stripe || submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
        {submitting ? 'Ajout en cours...' : 'Enregistrer la carte'}
      </button>
    </form>
  );
}

export default function Account() {
  const { user, logout } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const highlightedOrder = searchParams.get('commande');

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cards, setCards] = useState([]);
  const [publishableKey, setPublishableKey] = useState(null);
  const [addingCard, setAddingCard] = useState(false);
  const [setupSecret, setSetupSecret] = useState(null);

  const loadAll = () => {
    fetch(`${API_URL}/api/addresses`, { credentials: 'include' }).then((r) => r.json()).then(setAddresses);
    fetch(`${API_URL}/api/orders`, { credentials: 'include' }).then((r) => r.json()).then(setOrders);
    fetch(`${API_URL}/api/payment-methods`, { credentials: 'include' }).then((r) => r.json()).then(setCards);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/payments/config`).then((r) => r.json()).then((d) => setPublishableKey(d.publishable_key));
    loadAll();
  }, []);

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Supprimer cette adresse ?')) return;
    await fetch(`${API_URL}/api/addresses/${id}`, { method: 'DELETE', credentials: 'include' });
    loadAll();
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Supprimer ce moyen de paiement ?')) return;
    await fetch(`${API_URL}/api/payment-methods/${id}`, { method: 'DELETE', credentials: 'include' });
    loadAll();
  };

  const handleSetDefaultCard = async (id) => {
    await fetch(`${API_URL}/api/payment-methods/${id}/default`, { method: 'PUT', credentials: 'include' });
    loadAll();
  };

  const startAddCard = async () => {
    setAddingCard(true);
    const res = await fetch(`${API_URL}/api/payments/create-setup-intent`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    setSetupSecret(data.client_secret);
  };

  const handleCardAdded = () => {
    setAddingCard(false);
    setSetupSecret(null);
    loadAll();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-gray-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mon compte</h1>
            <p className="mt-1 text-sm text-gray-400">{user.username} · {user.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
          >
            Se déconnecter
          </button>
        </div>

        {/* COMMANDES */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Mes commandes</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className={`py-3 text-sm ${highlightedOrder == o.id ? 'rounded-lg bg-blue-950/30 px-3' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Commande #{o.id} · {new Date(o.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className={STATUS_LABELS[o.status]?.className || 'text-gray-400'}>
                      {STATUS_LABELS[o.status]?.label || o.status}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-500">
                    {o.items.map((i) => i.product_name).join(', ')} — {o.total_amount} €/mois
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ADRESSES */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Mes adresses</h2>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune adresse enregistrée. Elles se créent automatiquement au paiement.</p>
          ) : (
            <ul className="space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="flex items-start justify-between rounded-lg border border-gray-800 p-3 text-sm">
                  <span className="text-gray-300">
                    {a.first_name} {a.last_name}<br />
                    {a.address1}, {a.postal_code} {a.city}, {a.country}
                  </span>
                  <button
                    onClick={() => handleDeleteAddress(a.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* MOYENS DE PAIEMENT */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Moyens de paiement</h2>

          {cards.length > 0 && (
            <ul className="mb-4 space-y-2">
              {cards.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-gray-800 p-3 text-sm">
                  <span className="text-gray-300 capitalize">
                    {c.brand} •••• {c.last4} {c.is_default && <span className="ml-2 text-xs text-blue-400">(par défaut)</span>}
                  </span>
                  <div className="flex gap-3 text-xs">
                    {!c.is_default && (
                      <button onClick={() => handleSetDefaultCard(c.id)} className="text-blue-400 hover:underline">
                        Définir par défaut
                      </button>
                    )}
                    <button onClick={() => handleDeleteCard(c.id)} className="text-red-400 hover:underline">
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!addingCard ? (
            <button
              onClick={startAddCard}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              + Ajouter une carte
            </button>
          ) : setupSecret && publishableKey ? (
            <Elements stripe={getStripePromise(publishableKey)} options={{ clientSecret: setupSecret, appearance: { theme: 'night' } }}>
              <AddCardForm onSuccess={handleCardAdded} />
            </Elements>
          ) : (
            <p className="text-sm text-gray-500">Préparation du formulaire...</p>
          )}
        </section>
      </div>
    </div>
  );
}
