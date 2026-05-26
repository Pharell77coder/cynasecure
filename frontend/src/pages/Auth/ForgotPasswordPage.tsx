import React, { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft, KeyRound, CheckCircle2, XCircle } from "lucide-react";
import { checkPasswordStrength } from "../../lib/utils";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AuthLayout } from "./AuthLayout";
import { authApi } from "../../api/auth";

type Step = "email" | "token" | "done";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [step, setStep] = useState<Step>(tokenFromUrl ? "token" : "email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const strength = checkPasswordStrength(newPassword);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPasswordRequest(email);
      if (res.dev_token) setDevToken(res.dev_token);
      setStep("token");
    } catch {
      // Always show the same step to prevent enumeration
      setStep("token");
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Veuillez saisir le code de réinitialisation.");
      return;
    }
    if (!newPassword) {
      setError("Veuillez saisir un nouveau mot de passe.");
      return;
    }
    if (!strength.isValid) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPasswordConfirm(token, newPassword);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px] font-mono tracking-widest px-3 py-1.5 rounded">
          <Shield className="h-3 w-3" />
          RÉINITIALISATION SÉCURISÉE
        </div>
        <h1 className="text-2xl font-black text-white mt-4 tracking-tight">
          {step === "done" ? "Mot de passe réinitialisé" : "Mot de passe oublié"}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {step === "email" && "Entrez votre email pour recevoir un lien de réinitialisation."}
          {step === "token" && "Entrez le code reçu par email et choisissez un nouveau mot de passe."}
          {step === "done" && "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."}
        </p>
      </div>

      <div className="relative">

        {/* ── Step 1 : Email ── */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Adresse email</label>
              <Input
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <ErrorMessage message={error} />

            <Button type="submit" fullWidth size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              {loading ? "Envoi en cours…" : "Envoyer le lien"}
            </Button>
          </form>
        )}

        {/* ── Step 2 : Token + nouveau mot de passe ── */}
        {step === "token" && (
          <form onSubmit={handleTokenSubmit} className="space-y-5">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-300 leading-relaxed">
              Si l'adresse <span className="font-semibold text-blue-200">{email}</span> est associée à un compte, un email contenant le code de réinitialisation vient d'être envoyé. Vérifiez également vos spams.
            </div>

            {/* Dev mode helper */}
            {devToken && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-300 font-mono break-all">
                <span className="font-semibold text-yellow-400 block mb-1">Mode développement — code de test :</span>
                {devToken}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Code de réinitialisation</label>
              <Input
                icon={<KeyRound className="h-4 w-4" />}
                type="text"
                placeholder="Collez le code reçu par email"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Nouveau mot de passe</label>
              <div className="relative">
                <Input
                  icon={<Lock className="h-4 w-4" />}
                  type={showNew ? "text" : "password"}
                  placeholder="8 caractères minimum"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {[
                    { ok: strength.minLength, label: "8 caractères minimum" },
                    { ok: strength.hasUppercase, label: "Une majuscule" },
                    { ok: strength.hasLowercase, label: "Une minuscule" },
                    { ok: strength.hasDigit, label: "Un chiffre" },
                    { ok: strength.hasSpecial, label: "Un caractère spécial" },
                  ].map(({ ok, label }) => (
                    <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-green-400" : "text-slate-500"}`}>
                      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Confirmer le mot de passe</label>
              <div className="relative">
                <Input
                  icon={<Lock className="h-4 w-4" />}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-400">Les mots de passe ne correspondent pas.</p>
            )}

            <ErrorMessage message={error} />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading || !token || !strength.isValid || newPassword !== confirmPassword}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
            </Button>

            <button
              type="button"
              onClick={() => { setStep("email"); setError(null); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mx-auto"
            >
              <ArrowLeft className="h-3 w-3" />
              Changer l'adresse email
            </button>
          </form>
        )}

        {/* ── Step 3 : Succès ── */}
        {step === "done" && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate("/connexion")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Se connecter
            </Button>
          </div>
        )}

        {/* Back to login */}
        {step !== "done" && (
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/connexion" className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
