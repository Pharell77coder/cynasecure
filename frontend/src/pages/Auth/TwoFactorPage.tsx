import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import { AuthLayout } from "./AuthLayout";
import React from "react";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await authApi.twoFactorCheck(code);
      setUser(res.user);
      navigate("/profil");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Code invalide.";
      setError(msg);
      setCode("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Authentification à deux facteurs</h1>
        <p className="text-slate-400 text-sm mt-2">
          Entrez le code à 6 chiffres de votre application d'authentification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="totp-code" className="sr-only">
            Code à 6 chiffres
          </label>
          <input
            ref={inputRef}
            id="totp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            autoFocus
            aria-required="true"
            className="w-full text-center text-2xl tracking-widest bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {error && <p role="alert" className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {loading ? "Vérification…" : "Valider"}
        </button>
      </form>
    </AuthLayout>
  );
}
