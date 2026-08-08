import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = 'http://localhost:5000';
let stripePromise = null;

function getStripePromise(publishableKey) {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

function AddressPicker({ addresses, selectedId, onSelect, onCreated }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({
    first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onCreated(data.address);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Adresse de facturation</h2>

      {addresses.length > 0 && !showForm && (
        <div className="space-y-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                selectedId === a.id ? 'border-blue-600 bg-blue-950/30' : 'border-gray-800'
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === a.id}
                onChange={() => onSelect(a.id)}
                className="mt-1"
              />
              <span className="text-gray-300">
                {a.first_name} {a.last_name}<br />
                {a.address1}, {a.postal_code} {a.city}, {a.country}
              </span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm text-blue-400 hover:underline"
          >
            + Ajouter une nouvelle adresse
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input name="first_name" placeholder="Prénom" required value={form.first_name} onChange={handleChange}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
            <input name="last_name" placeholder="Nom" required value={form.last_name} onChange={handleChange}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <input name="address1" placeholder="Adresse" required value={form.address1} onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input name="postal_code" placeholder="Code postal" required value={form.postal_code} onChange={handleChange}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
            <input name="city" placeholder="Ville" required value={form.city} onChange={handleChange}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <input name="country" placeholder="Pays" required value={form.country} onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              {saving ? 'Enregistrement...' : "Enregistrer l'adresse"}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                Annuler
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function PaymentForm({ orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(orderId);
    } else {
      setError('Le paiement est en cours de traitement.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {submitting ? 'Paiement en cours...' : 'Payer maintenant'}
      </button>
      <p className="text-center text-xs text-gray-500">
        Paiement sécurisé par Stripe. Vos données bancaires ne transitent jamais par nos serveurs.
      </p>
    </form>
  );
}

export default function Checkout() {
  const { items, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) navigate('/catalogue');
  }, [items, navigate]);

  useEffect(() => {
    fetch(`${API_URL}/api/payments/config`)
      .then((r) => r.json())
      .then((d) => setPublishableKey(d.publishable_key));

    fetch(`${API_URL}/api/addresses`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddressId(data[0].id);
      });
  }, []);

  const handleAddressCreated = (address) => {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
  };

  const startPayment = async () => {
    setLoadingIntent(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          billing_address_id: selectedAddressId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClientSecret(data.client_secret);
      setOrderId(data.order_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingIntent(false);
    }
  };

  const handleSuccess = () => {
    clearCart();
    navigate(`/compte?commande=${orderId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-gray-100">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Paiement</h1>

          {/* RÉCAPITULATIF PANIER */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Votre commande</h2>
            <ul className="divide-y divide-gray-800 text-sm">
              {items.map((i) => (
                <li key={i.product_id} className="flex justify-between py-2">
                  <span className="text-gray-300">{i.name} × {i.quantity}</span>
                  <span className="text-gray-100">{i.price_monthly * i.quantity} €</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-gray-800 pt-4 font-semibold text-white">
              <span>Total / mois</span>
              <span>{total} €</span>
            </div>
          </div>

          <AddressPicker
            addresses={addresses}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
            onCreated={handleAddressCreated}
          />
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 h-fit">
          <h2 className="mb-4 text-lg font-semibold text-white">Paiement par carte</h2>

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          {!clientSecret ? (
            <button
              onClick={startPayment}
              disabled={!selectedAddressId || loadingIntent || !publishableKey}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loadingIntent ? 'Préparation du paiement...' : 'Continuer vers le paiement'}
            </button>
          ) : (
            <Elements
              stripe={getStripePromise(publishableKey)}
              options={{ clientSecret, appearance: { theme: 'night' } }}
            >
              <PaymentForm orderId={orderId} onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
