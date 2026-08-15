import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext.jsx';
import { addressService, paymentService } from '../services/api.js';
import Button from '../components/Button.jsx';

const STEPS = ['Adresse', 'Paiement', 'Récapitulatif', 'Confirmation'];

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

/* ── Étapes 2 & 3 : Paiement puis Récapitulatif (même contexte Stripe, pas de double montage) ── */
const PaymentAndReview = ({ address, cart, cartTotal, sub, setSub, onBack, onConfirmed }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [validating, setValidating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Étape "Paiement" → valide le formulaire de carte SANS débiter (elements.submit()).
  const handleValidateCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setValidating(true);
    setError('');
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setValidating(false);
      return;
    }
    setValidating(false);
    setSub('review');
  };

  // Étape "Récapitulatif" → débite réellement la carte déjà validée.
  const handleConfirmPurchase = async () => {
    setConfirming(true);
    setError('');
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (confirmError) {
      setError(confirmError.message);
      setConfirming(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onConfirmed();
    } else {
      setError('Le paiement est en cours de traitement.');
      setConfirming(false);
    }
  };

  return (
    <div>
      {/* Le PaymentElement reste TOUJOURS monté dans le DOM (même à l'étape récap) :
          Stripe a besoin de son iframe pour pouvoir confirmer le paiement ensuite.
          Le démonter est ce qui causait le bouton "Confirmer l'achat" bloqué en boucle. */}
      <form onSubmit={handleValidateCard} className={sub === 'card' ? 'space-y-4' : 'hidden'}>
        <div className="rounded-lg border border-green-800/40 bg-green-950/20 px-4 py-2 text-sm text-green-400">
          🔒 Paiement sécurisé par Stripe – vos données bancaires ne transitent jamais par nos serveurs.
        </div>
        <PaymentElement />
        {sub === 'card' && error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="ghost" size="lg" onClick={onBack}>← Retour</Button>
          <Button type="submit" size="lg" loading={validating} disabled={!stripe}>Voir le récapitulatif →</Button>
        </div>
      </form>

      {sub === 'review' && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-400">Services commandés</h3>
            <div className="space-y-1 rounded-lg border border-gray-800 p-3 text-sm">
              {cart.map((i) => (
                <div key={`${i.id}-${i.billing_period}`} className="flex justify-between text-gray-300">
                  <span>{i.name} × {i.quantity} ({i.billing_period === 'annual' ? 'annuel' : 'mensuel'})</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-gray-800 pt-2 font-semibold text-white">
                <span>Total</span><span>{cartTotal} €</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-400">Adresse de facturation</h3>
            <div className="rounded-lg border border-gray-800 p-3 text-sm text-gray-300">
              <p>{address.first_name} {address.last_name}</p>
              <p>{address.address1}</p>
              <p>{address.postal_code} {address.city}, {address.country}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-400">Paiement</h3>
            <div className="rounded-lg border border-gray-800 p-3 text-sm text-gray-300">
              Votre carte a été vérifiée et sera débitée de <strong className="text-white">{cartTotal} €</strong> à la confirmation.
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" size="lg" onClick={() => setSub('card')}>← Modifier</Button>
            <Button size="lg" loading={confirming} onClick={handleConfirmPurchase}>✓ Confirmer l'achat</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Étape 4 : Confirmation ── */
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

  const [step, setStep] = useState(0); // 0 adresse, 1 paiement+récap (interne), 3 confirmation
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [reviewSub, setReviewSub] = useState('card'); // 'card' | 'review', pour le step Paiement/Récapitulatif combiné
  const [error, setError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && step !== 3) navigate('/catalogue');
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      {step < 3 && (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i === currentDisplayStep ? 'bg-blue-600 text-white' : i < currentDisplayStep ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {i < currentDisplayStep ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i === currentDisplayStep ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              {i < 2 && <div className="h-px w-8 bg-gray-800" />}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
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
          <Elements stripe={getStripePromise(publishableKey)} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <PaymentAndReview
              address={selectedAddress || {}}
              cart={cart}
              cartTotal={cartTotal}
              sub={reviewSub}
              setSub={setReviewSub}
              onBack={() => setStep(0)}
              onConfirmed={handleConfirmed}
            />
          </Elements>
        )}

        {step === 3 && <StepConfirmation orderId={orderId} />}
      </div>
    </div>
  );
};

export default Checkout;