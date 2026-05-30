import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User, Mail, Phone, Building, Save, Shield,
  Lock, Eye, EyeOff, LogOut, Calendar, Clock,
  CheckCircle2, AlertCircle, MapPin, Plus, Trash2,
  Pencil, Star, CreditCard, X, XCircle, Smartphone,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageTransition } from "../../components/ui/PageTransition";
import { UserNav } from "../../components/layout/UserNav";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { authApi } from "../../api/auth";
import { addressesApi, type Address, type AddressPayload } from "../../api/addresses";
import { paymentMethodsApi, type PaymentMethod } from "../../api/paymentMethods";
import { checkPasswordStrength } from "../../lib/utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

function fmt(d?: string) {
  if (!d) return "—";
  try { return format(new Date(d), "dd MMMM yyyy", { locale: fr }); }
  catch { return "—"; }
}

function PasswordField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <Input
          icon={<Lock className="h-4 w-4" />}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

// Email Change Section
function EmailChangeSection({ currentEmail }: { currentEmail: string }) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestEmailChange(password, newEmail);
      setSent(true);
      toast("Email de confirmation envoyé !", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors de la demande", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full mt-1 bg-gray-800 border border-gray-700 text-white text-sm p-2 focus:outline-none focus:border-blue-500";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">Adresse email</label>
      <div className="flex items-center gap-3">
        <Input
          icon={<Mail className="h-4 w-4" />}
          value={currentEmail}
          disabled
          className="opacity-50 cursor-not-allowed flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-shrink-0 gap-1.5"
          onClick={() => { setOpen((o) => !o); setSent(false); }}
        >
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Button>
      </div>

      {open && !sent && (
        <form onSubmit={handleSubmit} className="mt-3 p-4 border border-gray-700 bg-gray-800/50 space-y-3">
          <div>
            <label htmlFor="email-change-new" className="text-xs text-gray-400">Nouvel email</label>
            <input id="email-change-new" type="email" className={inputCls} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nouveau@email.com" required aria-required="true" />
          </div>
          <div>
            <label htmlFor="email-change-password" className="text-xs text-gray-400">Mot de passe actuel (requis)</label>
            <input id="email-change-password" type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required aria-required="true" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
              {loading ? "Envoi…" : "Envoyer le lien de confirmation"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      )}

      {open && sent && (
        <div className="mt-3 flex items-start gap-2 p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>Un email de confirmation a été envoyé à <strong>{newEmail}</strong>. Cliquez sur le lien pour confirmer le changement.</p>
        </div>
      )}
    </div>
  );
}

// 2FA Section
function TwoFactorSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; qrContent: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.twoFactorStatus()
      .then((res) => setEnabled(res.enabled))
      .catch(() => setEnabled(false));
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await authApi.twoFactorSetup();
      setSetup(res);
    } catch (err: unknown) {
      toast((err as { message?: string })?.message ?? "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.twoFactorConfirm(confirmCode);
      toast("2FA activé avec succès", "success");
      setEnabled(true);
      setSetup(null);
      setConfirmCode("");
    } catch (err: unknown) {
      toast((err as { message?: string })?.message ?? "Code invalide", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.twoFactorDisable(disablePassword, disableCode);
      toast("2FA désactivé", "success");
      setEnabled(false);
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
    } catch (err: unknown) {
      toast((err as { message?: string })?.message ?? "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  if (enabled === null) {
    return <p className="text-gray-500 text-sm">Chargement…</p>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
        <Smartphone className="h-4 w-4 text-blue-500" />
        Authentification à deux facteurs
      </h2>

      {enabled ? (
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Le 2FA est activé sur votre compte.
          </div>
          {!showDisable ? (
            <Button variant="outline" size="sm" onClick={() => setShowDisable(true)} className="text-red-400 border-red-500/20 hover:bg-red-500/10">
              Désactiver le 2FA
            </Button>
          ) : (
            <form onSubmit={handleDisable} className="space-y-3 border border-gray-700 p-4 bg-gray-800/30">
              <p className="text-xs text-gray-400">Confirmez votre identité pour désactiver le 2FA.</p>
              <PasswordField label="Mot de passe actuel" value={disablePassword} onChange={setDisablePassword} placeholder="••••••••" />
              <div>
                <label htmlFor="2fa-disable-code" className="mb-2 block text-sm font-medium text-gray-300">Code 2FA</label>
                <input
                  id="2fa-disable-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  aria-required="true"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading || !disablePassword || disableCode.length !== 6} className="text-red-400 border-red-500/20 hover:bg-red-500/10" variant="outline">
                  {loading ? "…" : "Confirmer la désactivation"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowDisable(false); setDisablePassword(""); setDisableCode(""); }}>Annuler</Button>
              </div>
            </form>
          )}
        </div>
      ) : setup ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy…) ou entrez la clé manuellement.
          </p>
          <div className="p-4 border border-gray-700 bg-gray-800/50 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Clé secrète (saisie manuelle)</p>
            <code className="text-sm text-blue-300 break-all font-mono">{setup.secret}</code>
            <div className="pt-1">
              <a
                href={setup.qrContent}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
              >
                <Smartphone className="h-3 w-3" />
                Ouvrir dans l'application d'authentification
              </a>
            </div>
          </div>
          <form onSubmit={handleConfirm} className="space-y-3">
            <div>
              <label htmlFor="2fa-confirm-code" className="mb-2 block text-sm font-medium text-gray-300">
                Code de vérification (6 chiffres)
              </label>
              <input
                id="2fa-confirm-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                aria-required="true"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading || confirmCode.length !== 6}>
                {loading ? "Vérification…" : "Activer le 2FA"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setSetup(null); setConfirmCode(""); }}>Annuler</Button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            Protégez votre compte avec une application d'authentification (Google Authenticator, Authy…).
          </p>
          <Button size="sm" onClick={handleSetup} disabled={loading} className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            {loading ? "Initialisation…" : "Configurer le 2FA"}
          </Button>
        </div>
      )}
    </Card>
  );
}

// Address Section
const EMPTY_ADDR: AddressPayload = {
  firstName: "", lastName: "", company: "",
  line1: "", line2: "", city: "", region: "",
  postalCode: "", country: "FR", phone: "",
};

function AddressSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressPayload>(EMPTY_ADDR);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    addressesApi.list()
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AddressPayload>(k: K, v: AddressPayload[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const openNew = () => { setForm(EMPTY_ADDR); setEditId(null); setShowForm(true); };
  const openEdit = (a: Address) => {
    setForm({
      firstName: a.firstName, lastName: a.lastName, company: a.company ?? "",
      line1: a.line1, line2: a.line2 ?? "", city: a.city, region: a.region ?? "",
      postalCode: a.postalCode, country: a.country, phone: a.phone ?? "",
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId !== null) {
        const updated = await addressesApi.update(editId, form);
        setAddresses((prev) => prev.map((a) => (a.id === editId ? updated : a)));
        toast("Adresse mise à jour", "success");
      } else {
        const created = await addressesApi.create(form);
        setAddresses((prev) => [...prev, created]);
        toast("Adresse ajoutée", "success");
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette adresse ?")) return;
    try {
      await addressesApi.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast("Adresse supprimée", "success");
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const updated = await addressesApi.setDefault(id);
      setAddresses((prev) => prev.map((a) => ({
        ...a,
        isDefault: a.id === updated.id,
      })));
    } catch {
      toast("Erreur", "error");
    }
  };

  const inputCls = "w-full mt-1 bg-gray-800 border border-gray-700 text-white text-sm p-2 focus:outline-none focus:border-blue-500";
  const labelCls = "text-xs text-gray-400";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          Carnet d'adresses
        </h2>
        {!showForm && addresses.length < 10 && (
          <Button variant="outline" size="sm" onClick={openNew} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Button>
        )}
      </div>

      {loading && <p className="text-gray-500 text-sm">Chargement…</p>}

      {!loading && addresses.length === 0 && !showForm && (
        <p className="text-gray-500 text-sm">Aucune adresse enregistrée.</p>
      )}

      <div className="space-y-3 mb-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-gray-800 p-4 text-sm relative">
            {addr.isDefault && (
              <span className="absolute top-2 right-2 text-[10px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />
                Par défaut
              </span>
            )}
            <p className="font-medium text-white">{addr.firstName} {addr.lastName}</p>
            {addr.company && <p className="text-gray-500">{addr.company}</p>}
            <p className="text-gray-400 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
            <p className="text-gray-400">{addr.postalCode} {addr.city}{addr.region ? `, ${addr.region}` : ""} — {addr.country}</p>
            {addr.phone && <p className="text-gray-500 text-xs mt-0.5">{addr.phone}</p>}
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => openEdit(addr)} className="gap-1">
                <Pencil className="h-3 w-3" />
                Éditer
              </Button>
              {!addr.isDefault && (
                <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)} className="gap-1">
                  <Star className="h-3 w-3" />
                  Par défaut
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => handleDelete(addr.id)} className="gap-1 text-red-400 border-red-500/20 hover:bg-red-500/10">
                <Trash2 className="h-3 w-3" />
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="border border-gray-700 p-4 space-y-3 bg-gray-800/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">{editId ? "Modifier l'adresse" : "Nouvelle adresse"}</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="addr-first-name" className={labelCls}>Prénom *</label>
              <input id="addr-first-name" className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required aria-required="true" />
            </div>
            <div>
              <label htmlFor="addr-last-name" className={labelCls}>Nom *</label>
              <input id="addr-last-name" className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required aria-required="true" />
            </div>
          </div>
          <div>
            <label htmlFor="addr-company" className={labelCls}>Entreprise</label>
            <input id="addr-company" className={inputCls} value={form.company ?? ""} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div>
            <label htmlFor="addr-line1" className={labelCls}>Adresse *</label>
            <input id="addr-line1" className={inputCls} value={form.line1} onChange={(e) => set("line1", e.target.value)} required aria-required="true" />
          </div>
          <div>
            <label htmlFor="addr-line2" className={labelCls}>Complément</label>
            <input id="addr-line2" className={inputCls} value={form.line2 ?? ""} onChange={(e) => set("line2", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="addr-postal-code" className={labelCls}>Code postal *</label>
              <input id="addr-postal-code" className={inputCls} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} required aria-required="true" />
            </div>
            <div>
              <label htmlFor="addr-city" className={labelCls}>Ville *</label>
              <input id="addr-city" className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} required aria-required="true" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="addr-region" className={labelCls}>Région</label>
              <input id="addr-region" className={inputCls} value={form.region ?? ""} onChange={(e) => set("region", e.target.value)} />
            </div>
            <div>
              <label htmlFor="addr-country" className={labelCls}>Pays (ISO) *</label>
              <input id="addr-country" className={inputCls} value={form.country} maxLength={2} onChange={(e) => set("country", e.target.value.toUpperCase())} required aria-required="true" />
            </div>
          </div>
          <div>
            <label htmlFor="addr-phone" className={labelCls}>Téléphone</label>
            <input id="addr-phone" className={inputCls} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Enregistrement…" : editId ? "Mettre à jour" : "Ajouter"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </form>
      )}
    </Card>
  );
}

// Add Card Form (Stripe Elements)
function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { clientSecret } = await paymentMethodsApi.setupIntent();
      const cardEl = elements.getElement(CardElement);
      if (!cardEl) return;
      const { error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardEl },
      });
      if (error) {
        toast(error.message ?? "Erreur Stripe", "error");
      } else {
        toast("Carte ajoutée avec succès", "success");
        onSuccess();
      }
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'ajout", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-700 p-4 space-y-4 bg-gray-800/30 mt-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-white">Nouvelle carte</p>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="bg-gray-800 border border-gray-700 p-3">
        <CardElement options={{ style: { base: { color: "#f3f4f6", fontSize: "14px", "::placeholder": { color: "#6b7280" } } } }} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !stripe}>
          {loading ? "Enregistrement…" : "Enregistrer la carte"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}

// Payment Methods Section
function PaymentMethodsSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);

  const load = () => {
    paymentMethodsApi.list()
      .then(setMethods)
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDetach = async (pmId: string) => {
    if (!window.confirm("Supprimer cette carte ?")) return;
    try {
      await paymentMethodsApi.detach(pmId);
      setMethods((prev) => prev.filter((m) => m.id !== pmId));
      toast("Carte supprimée", "success");
    } catch {
      toast("Erreur lors de la suppression", "error");
    }
  };

  const handleSetDefault = async (pmId: string) => {
    try {
      await paymentMethodsApi.setDefault(pmId);
      setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === pmId })));
      toast("Carte par défaut mise à jour", "success");
    } catch {
      toast("Erreur", "error");
    }
  };

  const brandLabel: Record<string, string> = {
    visa: "VISA", mastercard: "MC", amex: "AMEX", discover: "DISC",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-500" />
          Moyens de paiement
        </h2>
        {!showAddCard && (
          <Button variant="outline" size="sm" onClick={() => setShowAddCard(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Button>
        )}
      </div>

      {loading && <p className="text-gray-500 text-sm">Chargement…</p>}

      {!loading && methods.length === 0 && !showAddCard && (
        <p className="text-gray-500 text-sm">Aucune carte enregistrée.</p>
      )}

      <div className="space-y-2 mb-3">
        {methods.map((m) => (
          <div key={m.id} className="flex items-center gap-3 border border-gray-800 p-3">
            <div className="w-12 text-center text-[10px] font-mono font-bold text-gray-400 border border-gray-700 py-1">
              {brandLabel[m.brand] ?? m.brand.toUpperCase()}
            </div>
            <div className="flex-1 text-sm text-gray-300">
              •••• {m.last4}
              <span className="ml-2 text-xs text-gray-500">{m.expMonth}/{m.expYear}</span>
            </div>
            {m.isDefault && (
              <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />
                Défaut
              </span>
            )}
            {!m.isDefault && (
              <Button variant="outline" size="sm" onClick={() => handleSetDefault(m.id)} className="text-xs gap-1">
                <Star className="h-3 w-3" />
                Défaut
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleDetach(m.id)} className="text-red-400 border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {showAddCard && (
        <Elements stripe={stripePromise}>
          <AddCardForm
            onSuccess={() => { setShowAddCard(false); setLoading(true); load(); }}
            onCancel={() => setShowAddCard(false)}
          />
        </Elements>
      )}
    </Card>
  );
}

// Main ProfilePage
export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const pwStrength = checkPasswordStrength(newPassword);

  if (!user) return null;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ displayName, phone, company });
      toast("Profil mis à jour", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors de la mise à jour", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!pwStrength.isValid) {
      toast("Le mot de passe ne respecte pas les critères de sécurité", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast("Mot de passe mis à jour", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <PageTransition>
      <UserNav />

      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="container py-10 space-y-6 pb-20">

        {/* Identity card */}
        <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/20 border-2 border-blue-500/30 text-2xl font-black text-blue-400">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl font-black text-white">{user.displayName}</h1>
              <span className="inline-flex items-center gap-1 border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest px-2 py-0.5 rounded">
                <Shield className="h-2.5 w-2.5" />
                {user.role === "ROLE_ADMIN" ? "Administrateur" : "Utilisateur"}
              </span>
            </div>
            <p className="text-sm text-gray-400">{user.email}</p>
            {user.company && <p className="text-xs text-gray-500 mt-0.5">{user.company}</p>}
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="h-3 w-3" />
              Membre depuis {fmt(user.createdAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-400 border border-red-500/20 hover:bg-red-500/10 gap-1.5 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </Card>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Left */}
          <div className="space-y-6">
            {/* Personal info */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-blue-500" />
                Informations personnelles
              </h2>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Nom d'affichage</label>
                  <Input
                    icon={<User className="h-4 w-4" />}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>

                <EmailChangeSection currentEmail={user.email} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Téléphone</label>
                    <Input
                      icon={<Phone className="h-4 w-4" />}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Entreprise</label>
                    <Input
                      icon={<Building className="h-4 w-4" />}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Nom de votre société"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={savingProfile} className="gap-2 mt-2">
                  <Save className="h-4 w-4" />
                  {savingProfile ? "Enregistrement…" : "Enregistrer les modifications"}
                </Button>
              </form>
            </Card>

            {/* Address book */}
            <AddressSection />

            {/* Payment methods */}
            <PaymentMethodsSection />
          </div>

          {/* Right */}
          <div className="space-y-6">

            {/* Password change */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
                <Lock className="h-4 w-4 text-blue-500" />
                Changer le mot de passe
              </h2>

              <form onSubmit={handlePasswordSave} className="space-y-4">
                <PasswordField
                  label="Mot de passe actuel"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="••••••••"
                />
                <div>
                  <PasswordField
                    label="Nouveau mot de passe"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="8 caractères minimum"
                  />
                  {newPassword.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs">
                      {[
                        { ok: pwStrength.minLength, label: "8 caractères minimum" },
                        { ok: pwStrength.hasUppercase, label: "Une majuscule" },
                        { ok: pwStrength.hasLowercase, label: "Une minuscule" },
                        { ok: pwStrength.hasDigit, label: "Un chiffre" },
                        { ok: pwStrength.hasSpecial, label: "Un caractère spécial" },
                      ].map(({ ok, label }) => (
                        <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-green-400" : "text-slate-500"}`}>
                          {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <PasswordField
                  label="Confirmer le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                />

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && pwStrength.isValid && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Les mots de passe correspondent
                  </p>
                )}

                <Button
                  type="submit"
                  variant="outline"
                  disabled={savingPassword || !currentPassword || !pwStrength.isValid || newPassword !== confirmPassword}
                  className="w-full gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {savingPassword ? "Mise à jour…" : "Mettre à jour"}
                </Button>
              </form>
            </Card>

            {/* 2FA */}
            <TwoFactorSection />

            {/* Account info */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-blue-500" />
                Informations du compte
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Créé le</span>
                  <span className="text-gray-200 font-medium">{fmt(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Dernière modification</span>
                  <span className="text-gray-200 font-medium">{fmt(user.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Statut</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Actif
                  </span>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
