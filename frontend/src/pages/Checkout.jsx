import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext.jsx';
import { addressService, paymentService } from '../services/api.js';
import Button from '../components/Button.jsx';

const STEPS = ['Adresse', 'Paiement', 'Confirmation'];

let stripePromise = null;
function getStripePromise(key) {
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

/* ── Étape 1 : Adresse ── */
const StepAddress = ({ onNext, addresses, selectedId, onSelect, onCreated }) => {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({ first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: 'France' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
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
    <div className="space-y-4">
      {addresses.length > 0 && !showForm && (
        <div className="space-y-2">
          {addresses.map((a) => (
            <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${selectedId === a.id ? 'border-blue-600 bg-blue-950/30' : 'border-gray-800'}`}>
              <input type="radio" name="address" checked={selectedId === a.id} onChange={() => onSelect(a.id)} className="mt-1" />
              <span className="text-gray-300">
                {a.first_name} {a.last_name}<br />{a.address1}, {a.postal_code} {a.city}, {a.country}
              </span>
            </label>
          ))}
          <button type="button" onClick={() => setShowForm(true)} className="text-sm text-blue-400 hover:underline">
            + Ajouter une nouvelle adresse
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3">
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
          <select name="country" value={form.country} onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none">
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Luxembourg">Luxembourg</option>
          </select>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>Enregistrer l'adresse</Button>
            {addresses.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>}
          </div>
        </form>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!selectedId} size="lg">Continuer →</Button>
      </div>
    </div>
  );
};

/* ── Étape 2 : Paiement (vrai Stripe) ── */
const PaymentForm = ({ onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      setError('Le paiement est en cours de traitement.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-green-800/40 bg-green-950/20 px-4 py-2 text-sm text-green-400">
        🔒 Paiement sécurisé par Stripe – vos données bancaires ne transitent jamais par nos serveurs.
      </div>
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>← Retour</Button>
        <Button type="submit" size="lg" loading={submitting} disabled={!stripe}>Payer maintenant</Button>
      </div>
    </form>
  );
};

/* ── Étape 3 : Confirmation ── */
const StepConfirmation = ({ orderId }) => {
  const navigate = useNavigate();
  return (
    <div className="py-12 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="mt-4 text-2xl font-bold text-white">Commande confirmée !</h1>
      <p className="mt-2 text-gray-400">Un e-mail de confirmation vous a été envoyé. Bienvenue chez Cyna !</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button variant="primary" size="lg" onClick={() => navigate(`/compte?commande=${orderId}`)}>Voir ma commande</Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   Page Checkout principale
════════════════════════════════════════ */
const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && step !== 2) navigate('/catalogue');
  }, [cart, step, navigate]);

  useEffect(() => {
    paymentService.getConfig().then((d) => setPublishableKey(d.publishable_key));
    addressService.list().then((data) => {
      setAddresses(data);
      if (data.length > 0) setSelectedAddressId(data[0].id);
    });
  }, []);

  const handleAddressCreated = (address) => {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
  };

  const goToPayment = async () => {
    setPreparingPayment(true);
    setError('');
    try {
      const data = await paymentService.createPaymentIntent(
        cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        selectedAddressId
      );
      setClientSecret(data.client_secret);
      setOrderId(data.order_id);
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreparingPayment(false);
    }
  };

  const handleSuccess = () => {
    clearCart();
    setStep(2);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {step < 2 && (
        <div className="mb-10 flex items-center justify-center gap-4">
          {STEPS.slice(0, 2).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              {i < 1 && <div className="h-px w-8 bg-gray-800" />}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        {step < 2 && cart.length > 0 && (
          <div className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-4 text-sm">
            {cart.map((i) => (
              <div key={i.id} className="flex justify-between py-1 text-gray-300">
                <span>{i.name} × {i.quantity}</span><span>{i.price_monthly * i.quantity} €</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-gray-800 pt-2 font-semibold text-white">
              <span>Total / mois</span><span>{cartTotal} €</span>
            </div>
          </div>
        )}

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {step === 0 && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-white">Adresse de facturation</h2>
            <StepAddress
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onCreated={handleAddressCreated}
              onNext={goToPayment}
            />
            {preparingPayment && <p className="mt-4 text-sm text-gray-500">Préparation du paiement...</p>}
          </>
        )}

        {step === 1 && clientSecret && publishableKey && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-white">Paiement</h2>
            <Elements stripe={getStripePromise(publishableKey)} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <PaymentForm onSuccess={handleSuccess} onBack={() => setStep(0)} />
            </Elements>
          </>
        )}

        {step === 2 && <StepConfirmation orderId={orderId} />}
      </div>
    </div>
  );
};

export default Checkout;
