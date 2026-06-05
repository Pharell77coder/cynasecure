import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { authApi } from "../../api/auth";
import { AuthLayout } from "./AuthLayout";
import React from "react";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("auth.verifyEmailInvalidLink"));
      return;
    }
    authApi
      .verifyEmail(token)
      .then((res) => {
        setMessage(res.message ?? t("auth.emailVerifiedDesc"));
        setStatus("success");
      })
      .catch((err) => {
        setMessage(err?.message ?? t("auth.verifyEmailExpired"));
        setStatus("error");
      });
  }, [token]);

  return (
    <AuthLayout>
      <div className="text-center">
        {status === "loading" && (
          <p className="text-slate-400">{t("auth.verifyEmailVerifying")}</p>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-green-400" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">{t("auth.verifyEmailSuccess")}</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <Link
              to="/connexion"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {t("auth.loginBtn")}
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">{t("auth.verifyEmailError")}</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <Link
              to="/connexion"
              className="text-blue-400 hover:underline text-sm"
            >
              {t("auth.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
