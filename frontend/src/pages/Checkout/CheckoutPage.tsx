import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Lock,
  ChevronRight,
  Download,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { checkoutApi, CheckoutAddress } from "../../api/checkout";
import { formatPrice } from "../../lib/utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

type Step = "auth" | "address" | "payment" | "confirmation";

interface AddressFormData {
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

const EMPTY_ADDRESS: AddressFormData = {
  firstName: "",
  lastName: "",
  company: "",
  address: "",
  city: "",
  zipCode: "",
  country: "France",
  phone: "",
};

/* ── Step indicator ─────────────────────────────── */
function StepIndicator({ step, isAuthenticated }: { step: Step; isAuthenticated: boolean }) {
  const allSteps: { key: Step; label: string }[] = [
    { key: "auth", label: "Compte" },
    { key: "address", label: "Adresse" },
    { key: "payment", label: "Paiement" },
    { key: "confirmation", label: "Confirmation" },
  ];

  const visibleSteps = isAuthenticated
    ? allSteps.filter((s) => s.key !== "auth")
    : allSteps;

  const idx = visibleSteps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-0 mb-10">
      {visibleSteps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold border ${
                i < idx
                  ? "bg-blue-600 border-blue-600 text-white"
                  : i === idx
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-500"
              }`}
            >
              {i < idx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-xs font-mono tracking-widest ${
                i === idx ? "text-white" : "text-gray-500"
              }`}
            >
              {s.label.toUpperCase()}
            </span>
          </div>
          {i < visibleSteps.length - 1 && (
            <div
              className={`flex-1 mx-3 h-px ${i < idx ? "bg-blue-600" : "bg-gray-800"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Auth step ───────────────────────────────────── */
function AuthStep({ onGuest }: { onGuest: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleGuest = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Adresse e-mail invalide.");
      return;
    }
    setEmailError(null);
    onGuest(email.trim());
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <User className="h-4 w-4 text-blue-500" />
        <h2 className="text-lg font-bold text-white">Identification</h2>
      </div>

      <div className="space-y-4 mb-8">
        <Link
          to="/connexion?redirect=/checkout"
          className="flex items-center justify-between bg-gray-900 border border-gray-700 px-5 py-4 hover:border-blue-500 transition-colors group"
        >
          <div>
            <p className="text-white text-sm font-medium">J'ai déjà un compte</p>
            <p className="text-gray-500 text-xs mt-0.5">Me connecter pour continuer</p>
          </div>
          <LogIn className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
        </Link>

        <Link
          to="/inscription?redirect=/checkout"
          className="flex items-center justify-between bg-gray-900 border border-gray-700 px-5 py-4 hover:border-blue-500 transition-colors group"
        >
          <div>
            <p className="text-white text-sm font-medium">Créer un compte</p>
            <p className="text-gray-500 text-xs mt-0.5">Gérez vos abonnements depuis votre espace</p>
          </div>
          <UserPlus className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs font-mono text-gray-600 tracking-widest">OU</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
            Adresse e-mail <span className="text-blue-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
            placeholder="votre@email.com"
            className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
          />
          {emailError && (
            <p className="text-red-400 text-xs flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" />
              {emailError}
            </p>
          )}
        </div>

        <Button onClick={handleGuest} fullWidth className="gap-2 mt-1">
          Continuer en tant qu'invité <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ── Address step ────────────────────────────────── */
function AddressStep({
  form,
  onChange,
  onNext,
  total,
}: {
  form: AddressFormData;
  onChange: (f: AddressFormData) => void;
  onNext: () => void;
  total: number;
}) {
  const field = (
    label: string,
    key: keyof AddressFormData,
    required = true,
    half = false
  ) => (
    <div className={half ? "flex flex-col gap-1" : "col-span-2 flex flex-col gap-1"}>
      <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => onChange({ ...form, [key]: e.target.value })}
        required={required}
        className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );

  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.zipCode.trim() &&
    form.country.trim();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-4 w-4 text-blue-500" />
        <h2 className="text-lg font-bold text-white">Adresse de facturation</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field("Prénom", "firstName", true, true)}
        {field("Nom", "lastName", true, true)}
        {field("Société", "company", false)}
        {field("Adresse", "address", true)}
        {field("Ville", "city", true, true)}
        {field("Code postal", "zipCode", true, true)}
        {field("Pays", "country", true)}
        {field("Téléphone", "phone", false)}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Total : <span className="text-white font-bold text-lg">{formatPrice(total)}</span>
        </p>
        <Button onClick={onNext} disabled={!isValid} className="gap-2">
          Paiement <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ── Stripe payment form ────────────────────────── */
function StripePaymentForm({
  clientSecret,
  orderId,
  onSuccess,
}: {
  clientSecret: string;
  orderId: number;
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card } }
    );

    if (stripeError) {
      setError(stripeError.message ?? "Erreur de paiement.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-gray-900 border border-gray-700 px-4 py-4 mb-4">
        <CardElement
          options={{
            style: {
              base: {
                color: "#e5e7eb",
                fontFamily: "monospace",
                fontSize: "14px",
                "::placeholder": { color: "#6b7280" },
                iconColor: "#3b82f6",
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" fullWidth disabled={loading || !stripe} className="gap-2">
        {loading ? "Traitement…" : "Payer par carte"}
        <Lock className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}

/* ── Payment step ────────────────────────────────── */
function PaymentStep({
  address,
  items,
  total,
  guestEmail,
  promoCode,
  onSuccess,
}: {
  address: CheckoutAddress;
  items: { id: number; cycle: string }[];
  total: number;
  guestEmail?: string;
  promoCode?: string;
  onSuccess: (paymentId: number, invoiceNumber: string, total: number) => void;
}) {
  const [intent, setIntent]   = useState<{ clientSecret: string; paypalOrderId: string; orderId: number; discount?: number; promoCode?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<"stripe" | "paypal">("stripe");

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const cartItems = items.map((it) => ({
      serviceId: it.id,
      billing:   (it.cycle === "yearly" ? "yearly" : "monthly") as "monthly" | "yearly",
    }));

    checkoutApi.intent(cartItems, address, guestEmail, promoCode)
      .then(setIntent)
      .catch((e) => setError(e.message ?? "Erreur de connexion."))
      .finally(() => setLoading(false));
  }, []);

  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!intent) return;
    try {
      const res = await checkoutApi.confirm({
        orderId: intent.orderId,
        gateway: "stripe",
        paymentIntentId,
      });
      onSuccess(res.paymentId, res.invoiceNumber, res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de confirmation.");
    }
  };

  const handlePaypalApprove = async (ppOrderId: string) => {
    if (!intent) return;
    try {
      const res = await checkoutApi.confirm({
        orderId:       intent.orderId,
        gateway:       "paypal",
        paypalOrderId: ppOrderId,
      });
      onSuccess(res.paymentId, res.invoiceNumber, res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de confirmation.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-4 w-4 text-blue-500" />
        <h2 className="text-lg font-bold text-white">Paiement</h2>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-mono px-4 py-2.5 mb-6 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
        Mode test — aucun paiement réel n'est effectué. Carte test : 4242 4242 4242 4242
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500 text-sm animate-pulse">
          Initialisation du paiement…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {intent && !loading && (
        <>
          <div className="flex border-b border-gray-800 mb-6">
            {(["stripe", "paypal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-xs font-mono tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "text-blue-400 border-blue-500"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                {t === "stripe" ? "Carte bancaire" : "PayPal"}
              </button>
            ))}
          </div>

          {tab === "stripe" && (
            <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
              <StripePaymentForm
                clientSecret={intent.clientSecret}
                orderId={intent.orderId}
                onSuccess={handleStripeSuccess}
              />
            </Elements>
          )}

          {tab === "paypal" && (
            <PayPalButtons
              style={{ layout: "vertical", color: "blue", shape: "rect" }}
              createOrder={() => Promise.resolve(intent.paypalOrderId)}
              onApprove={async (data) => {
                await handlePaypalApprove(data.orderID);
              }}
              onError={(err) => {
                setError("Erreur PayPal. Veuillez réessayer.");
                console.error(err);
              }}
            />
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
            <Lock className="h-3 w-3" />
            Paiement sécurisé · Données chiffrées TLS
          </div>
        </>
      )}
    </div>
  );
}

/* ── Confirmation step ───────────────────────────── */
function ConfirmationStep({
  paymentId,
  invoiceNumber,
  total,
  isGuest,
}: {
  paymentId: number;
  invoiceNumber: string;
  total: number;
  isGuest: boolean;
}) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await checkoutApi.downloadInvoice(paymentId, `${invoiceNumber}.pdf`);
    } catch {
      // toast non importé ici — l'erreur est silencieuse, le PDF n'ouvre pas
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 mb-6">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>

      <h2 className="text-2xl font-black text-white mb-2">Commande confirmée</h2>
      <p className="text-gray-400 text-sm mb-1">
        Paiement de <span className="text-white font-bold">{formatPrice(total)}</span> reçu avec succès.
      </p>
      <p className="text-gray-600 text-xs font-mono mb-8">{invoiceNumber}</p>

      {isGuest ? (
        <>
          <div className="bg-blue-500/10 border border-blue-500/20 px-5 py-4 mb-8 max-w-sm mx-auto text-left">
            <p className="text-blue-300 text-sm font-medium mb-1">Créez un compte pour gérer votre abonnement</p>
            <p className="text-gray-400 text-xs">
              Retrouvez vos factures, suivez vos abonnements et gérez votre renouvellement depuis votre espace personnel.
            </p>
            <Link
              to="/inscription"
              className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-mono mt-3 hover:text-blue-300 transition-colors"
            >
              Créer un compte <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <Button onClick={() => navigate("/")} className="gap-2">
            Retour à l'accueil <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
            Vos abonnements sont maintenant actifs. Retrouvez-les dans votre tableau de bord.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Téléchargement…" : "Télécharger la facture"}
            </button>

            <Button onClick={() => navigate("/dashboard")} className="gap-2">
              Mon tableau de bord <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main CheckoutPage ───────────────────────────── */
export default function CheckoutPage() {
  const { items, total, clearCart, promo } = useCart();
  const { isAuthenticated }                = useAuth();
  const navigate                    = useNavigate();

  const [step, setStep]           = useState<Step>(isAuthenticated ? "address" : "auth");
  const [address, setAddress]     = useState<AddressFormData>(EMPTY_ADDRESS);
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [result, setResult]       = useState<{ paymentId: number; invoiceNumber: string; total: number } | null>(null);

  if (items.length === 0 && step !== "confirmation") {
    navigate("/panier");
    return null;
  }

  const handleGuestContinue = (email: string) => {
    setGuestEmail(email);
    setStep("address");
  };

  const handleAddressNext = () => setStep("payment");

  const handlePaymentSuccess = (paymentId: number, invoiceNumber: string, paidTotal: number) => {
    setResult({ paymentId, invoiceNumber, total: paidTotal });
    clearCart();
    setStep("confirmation");
  };

  const cartItems = items.map((it) => ({ id: it.id, cycle: it.cycle }));
  const checkoutAddress: CheckoutAddress = {
    firstName: address.firstName,
    lastName:  address.lastName,
    company:   address.company || undefined,
    address:   address.address,
    city:      address.city,
    zipCode:   address.zipCode,
    country:   address.country,
    phone:     address.phone || undefined,
  };

  const isGuest = !isAuthenticated;

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
      <div className="container py-12 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Finaliser la commande</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="border border-gray-800 bg-gray-900 p-8">
            <StepIndicator step={step} isAuthenticated={isAuthenticated} />

            {step === "auth" && (
              <AuthStep onGuest={handleGuestContinue} />
            )}

            {step === "address" && (
              <AddressStep
                form={address}
                onChange={setAddress}
                onNext={handleAddressNext}
                total={total}
              />
            )}

            {step === "payment" && (
              <PaymentStep
                address={checkoutAddress}
                items={cartItems}
                total={total}
                guestEmail={isGuest ? guestEmail : undefined}
                promoCode={promo?.code}
                onSuccess={handlePaymentSuccess}
              />
            )}

            {step === "confirmation" && result && (
              <ConfirmationStep
                paymentId={result.paymentId}
                invoiceNumber={result.invoiceNumber}
                total={result.total}
                isGuest={isGuest}
              />
            )}
          </div>

          {step !== "confirmation" && (
            <aside>
              <div className="border border-gray-800 bg-gray-900 p-5 sticky top-24">
                <h3 className="text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-4">
                  Récapitulatif
                </h3>
                <div className="space-y-2 pb-4 border-b border-gray-800 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400 truncate mr-2">{item.name}</span>
                      <span className="text-gray-300 flex-shrink-0">
                        {formatPrice(item.priceMonthly)}
                      </span>
                    </div>
                  ))}
                </div>
                {promo && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-400 text-xs font-mono">{promo.code}</span>
                    <span className="text-green-400 text-xs">−{formatPrice(promo.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400 text-sm">Total TTC</span>
                  <span className="text-2xl font-black text-white">
                    {formatPrice(promo ? promo.discountedTotal : total)}
                  </span>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
