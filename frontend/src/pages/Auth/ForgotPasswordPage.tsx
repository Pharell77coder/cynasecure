import React, { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft, KeyRound, CheckCircle2, XCircle } from "lucide-react";
import { checkPasswordStrength } from "../../lib/utils";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AuthLayout } from "./AuthLayout";
import { authApi } from "../../api/auth";

type Step = "email" | "token" | "done";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
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
      setError(t("auth.enterEmail"));
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
      setError(t("auth.enterResetCode"));
      return;
    }
    if (!newPassword) {
      setError(t("auth.enterNewPassword"));
      return;
    }
    if (!strength.isValid) {
      setError(t("auth.errors.passwordWeak"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsDontMatch"));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPasswordConfirm(token, newPassword);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.invalidOrExpired"));
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
          {t("auth.secureReset")}
        </div>
        <h1 className="text-2xl font-black text-white mt-4 tracking-tight">
          {step === "done" ? t("auth.resetDone") : t("auth.forgotTitle")}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {step === "email" && t("auth.resetStepEmailSubtitle")}
          {step === "token" && t("auth.resetStepTokenSubtitle")}
          {step === "done" && t("auth.resetStepDoneSubtitle")}
        </p>
      </div>

      <div className="relative">

        {/* ── Step 1 : Email ── */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-gray-300">{t("auth.emailAddress")}</label>
              <Input
                id="forgot-email"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-required="true"
              />
            </div>

            <ErrorMessage message={error} />

            <Button type="submit" fullWidth size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              {loading ? t("auth.sending2") : t("auth.sendResetLink")}
            </Button>
          </form>
        )}

        {/* ── Step 2 : Token + nouveau mot de passe ── */}
        {step === "token" && (
          <form onSubmit={handleTokenSubmit} className="space-y-5">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-300 leading-relaxed">
              {t("auth.resetCodeInfo", { email })}
            </div>

            {/* Dev mode helper */}
            {devToken && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-300 font-mono break-all">
                <span className="font-semibold text-yellow-400 block mb-1">{t("auth.devModeToken")}</span>
                {devToken}
              </div>
            )}

            <div>
              <label htmlFor="forgot-reset-code" className="mb-2 block text-sm font-medium text-gray-300">{t("auth.resetCode")}</label>
              <Input
                id="forgot-reset-code"
                icon={<KeyRound className="h-4 w-4" />}
                type="text"
                placeholder={t("auth.resetCodePlaceholder")}
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="forgot-new-password" className="mb-2 block text-sm font-medium text-gray-300">{t("auth.newPassword")}</label>
              <div className="relative">
                <Input
                  id="forgot-new-password"
                  icon={<Lock className="h-4 w-4" />}
                  type={showNew ? "text" : "password"}
                  placeholder={t("auth.pwMinPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showNew ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {[
                    { ok: strength.minLength, label: t("auth.pwMin") },
                    { ok: strength.hasUppercase, label: t("auth.pwUppercase") },
                    { ok: strength.hasLowercase, label: t("auth.pwLowercase") },
                    { ok: strength.hasDigit, label: t("auth.pwDigit") },
                    { ok: strength.hasSpecial, label: t("auth.pwSpecial") },
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
              <label htmlFor="forgot-confirm-password" className="mb-2 block text-sm font-medium text-gray-300">{t("auth.confirmPassword")}</label>
              <div className="relative">
                <Input
                  id="forgot-confirm-password"
                  icon={<Lock className="h-4 w-4" />}
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-400">{t("auth.passwordsDontMatch")}</p>
            )}

            <ErrorMessage message={error} />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading || !token || !strength.isValid || newPassword !== confirmPassword}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              {loading ? t("auth.resetting2") : t("auth.resetBtn")}
            </Button>

            <button
              type="button"
              onClick={() => { setStep("email"); setError(null); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mx-auto"
            >
              <ArrowLeft className="h-3 w-3" />
              {t("auth.changeEmail")}
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
              {t("auth.resetSuccess")}
            </p>
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate("/connexion")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              {t("auth.loginBtn")}
            </Button>
          </div>
        )}

        {/* Back to login */}
        {step !== "done" && (
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/connexion" className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("auth.backToLogin")}
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
