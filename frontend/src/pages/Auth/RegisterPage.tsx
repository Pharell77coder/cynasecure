import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Shield, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/auth";
import { checkPasswordStrength } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import React from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const strength = checkPasswordStrength(password);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !password) {
      setError(t("auth.errors.fillAll"));
      return;
    }

    if (!strength.isValid) {
      setError(t("auth.errors.passwordWeak"));
      return;
    }

    setLoading(true);

    try {
      const res = await register(displayName, email, password);
      if (res.needsVerification) {
        setRegisteredEmail(email);
        setVerified(true);
      }
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || t("auth.errors.registerError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await authApi.resendVerification(registeredEmail);
      setResendMessage("Un nouveau lien a été envoyé.");
    } catch {
      setResendMessage("Une erreur est survenue, réessayez.");
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-3">{t("auth.checkYourEmail")}</h1>
          <p className="text-slate-400 mb-2">
            {t("auth.verificationSentTo")}{" "}
            <span className="text-white font-medium">{registeredEmail}</span>.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {t("auth.verificationLinkValid")}
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-blue-400 hover:underline text-sm disabled:opacity-50"
          >
            {resendLoading ? t("auth.sending") : t("auth.resendEmail")}
          </button>
          {resendMessage && (
            <p className="text-green-400 text-sm mt-2" aria-live="polite">{resendMessage}</p>
          )}
          <p className="mt-6 text-slate-500 text-sm">
            {t("auth.alreadyAccount")}{" "}
            <Link to="/connexion" className="text-blue-400 hover:underline">
              {t("auth.loginLink")}
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px] font-mono tracking-widest px-3 py-1.5 rounded">
          <Shield className="h-3 w-3" aria-hidden="true" />
          {t("auth.createAccount")}
        </div>

        <h1 className="text-3xl font-black text-white mt-4 tracking-tight">
          {t("auth.registerTitle")}
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          {t("auth.registerSubtitle")}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6 relative" noValidate>
        <div>
          <label htmlFor="reg-name" className="mb-2 block text-sm font-medium text-gray-300">
            {t("auth.displayName")}
          </label>
          <Input
            id="reg-name"
            icon={<User className="h-4 w-4" />}
            autoComplete="name"
            placeholder={t("auth.displayNamePlaceholder")}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-2 block text-sm font-medium text-gray-300">
            {t("auth.email")}
          </label>
          <Input
            id="reg-email"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-2 block text-sm font-medium text-gray-300">
            {t("auth.password")}
          </label>

          <div className="relative">
            <Input
              id="reg-password"
              icon={<Lock className="h-4 w-4" />}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              aria-invalid={password.length > 0 && !strength.isValid ? "true" : undefined}
              aria-describedby={password.length > 0 ? "pw-requirements" : undefined}
            />

            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white h-11 w-8 flex items-center justify-center"
              aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>

          {password.length > 0 && (
            <ul id="pw-requirements" className="mt-2 space-y-1 text-xs" aria-label="Critères du mot de passe">
              {[
                { ok: strength.minLength, label: t("auth.pwMin") },
                { ok: strength.hasUppercase, label: t("auth.pwUppercase") },
                { ok: strength.hasLowercase, label: t("auth.pwLowercase") },
                { ok: strength.hasDigit, label: t("auth.pwDigit") },
                { ok: strength.hasSpecial, label: t("auth.pwSpecial") },
              ].map(({ ok, label }) => (
                <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-green-400" : "text-slate-500"}`}>
                  {ok ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <XCircle className="h-3 w-3" aria-hidden="true" />}
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div role="alert" aria-live="polite">
            <ErrorMessage message={error} />
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          aria-busy={loading}
        >
          {loading ? t("auth.creating") : t("auth.createBtn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.alreadyAccount")}{" "}
        <Link to="/connexion" className="text-blue-400 hover:text-blue-300 transition-colors">
          {t("auth.loginLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
