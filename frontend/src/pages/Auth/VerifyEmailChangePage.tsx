import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";
import { authApi } from "../../api/auth";
import { Button } from "../../components/ui/Button";

export default function VerifyEmailChangePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Token manquant dans l'URL.");
      return;
    }
    authApi
      .verifyEmailChange(token)
      .then((res) => {
        setState("success");
        setMessage(res.message);
      })
      .catch((err: unknown) => {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Lien invalide ou expiré.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded">
          <Shield className="h-3 w-3" />
          CYNASECURE
        </div>

        {state === "loading" && (
          <>
            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
            <p className="text-gray-400">Vérification en cours…</p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400" />
            <h1 className="text-2xl font-black text-white">Email confirmé !</h1>
            <p className="text-gray-400">{message}</p>
            <Link to="/profil">
              <Button className="mt-2">Retour au profil</Button>
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-red-400" />
            <h1 className="text-2xl font-black text-white">Lien invalide</h1>
            <p className="text-gray-400">{message}</p>
            <Link to="/profil">
              <Button variant="outline" className="mt-2">Retour au profil</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
