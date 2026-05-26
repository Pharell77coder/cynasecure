import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import { AuthLayout } from "./AuthLayout";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide ou incomplet.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then((res) => {
        setMessage(res.message ?? "Votre compte est vérifié.");
        setStatus("success");
      })
      .catch((err) => {
        setMessage(err?.message ?? "Ce lien est invalide ou a expiré.");
        setStatus("error");
      });
  }, [token]);

  return (
    <AuthLayout>
      <div className="text-center">
        {status === "loading" && (
          <p className="text-slate-400">Vérification en cours…</p>
        )}
        {status === "success" && (
          <>
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="text-xl font-bold text-white mb-2">Email vérifié</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <Link
              to="/connexion"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Se connecter
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mb-4 text-4xl">❌</div>
            <h1 className="text-xl font-bold text-white mb-2">Lien invalide</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <Link
              to="/connexion"
              className="text-blue-400 hover:underline text-sm"
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
