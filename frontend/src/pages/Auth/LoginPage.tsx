import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/auth";
import { toast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import React from "react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/profil";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated && loginSuccess) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loginSuccess, navigate, from]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailUnverified(false);

    if (!email || !password) {
      setError(t("auth.errors.fillAll"));
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.requires2fa) {
        navigate("/2fa", { replace: true });
        return;
      }
      if (res.emailUnverified) {
        setEmailUnverified(true);
        setError("Votre adresse email n'est pas vérifiée. Consultez votre boîte mail.");
        return;
      }
      toast("Connexion réussie", "success");
      setLoginSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || t("auth.errors.loginError");
      if ((err as { emailUnverified?: boolean })?.emailUnverified) {
        setEmailUnverified(true);
        setError("Votre adresse email n'est pas vérifiée. Consultez votre boîte mail.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResendMessage("Entrez votre email ci-dessus.");
      return;
    }
    setResendLoading(true);
    setResendMessage("");
    try {
      await authApi.resendVerification(email);
      setResendMessage("Un nouveau lien vous a été envoyé.");
    } catch {
      setResendMessage("Une erreur est survenue.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />


      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px] font-mono tracking-widest px-3 py-1.5 rounded">
          <Shield className="h-3 w-3" aria-hidden="true" />
          {t("auth.secureAuth")}
        </div>

        <h1 className="text-3xl font-black text-white mt-4 tracking-tight">
          {t("auth.loginTitle")}
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6 relative" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-gray-300">
            {t("auth.email")}
          </label>
          <Input
            id="login-email"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={!!error && !email ? "true" : undefined}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="text-sm font-medium text-gray-300">
              {t("auth.password")}
            </label>
            <Link
              to="/mot-de-passe-oublie"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <div className="relative">
            <Input
              id="login-password"
              icon={<Lock className="h-4 w-4" />}
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
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
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor="remember-me" className="text-sm text-gray-400 cursor-pointer">
            {t("auth.rememberMe")}
          </label>
        </div>

        {error && (
          <div role="alert" aria-live="polite">
            <ErrorMessage message={error} />
          </div>
        )}

        {emailUnverified && (
          <div className="text-sm text-slate-400">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-blue-400 hover:underline disabled:opacity-50"
            >
              {resendLoading ? t("auth.sending") : t("auth.resendVerification")}
            </button>
            {resendMessage && (
              <span className="ml-2 text-green-400" aria-live="polite">{resendMessage}</span>
            )}
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
          {loading ? t("auth.loggingIn") : t("auth.loginBtn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.noAccount")}{" "}
        <Link to="/inscription" className="text-blue-400 hover:text-blue-300 transition-colors">
          {t("auth.registerLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
