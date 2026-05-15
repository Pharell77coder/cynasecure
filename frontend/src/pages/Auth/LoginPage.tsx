import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import React from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/profil";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast("Connexion réussie", "success");
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Glow bleu */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px] font-mono tracking-widest px-3 py-1.5 rounded">
          <Shield className="h-3 w-3" />
          AUTHENTIFICATION SÉCURISÉE
        </div>

        <h1 className="text-3xl font-black text-white mt-4 tracking-tight">
          Connexion à la plateforme
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Accédez à votre espace sécurisé et à vos services.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={submit} className="space-y-6 relative">

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Email
          </label>
          <Input
            icon={<Mail className="h-4 w-4" />}
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Mot de passe
          </label>

          <div className="relative">
            <Input
              icon={<Lock className="h-4 w-4" />}
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Erreur */}
        <ErrorMessage message={error} />

        {/* Bouton */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </AuthLayout>
  );
}
