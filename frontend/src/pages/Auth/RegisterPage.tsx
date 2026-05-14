import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import React from "react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 6) {
      setError("Mot de passe trop court (min. 6 caractères).");
      return;
    }

    setLoading(true);

    try {
      await register(displayName, email, password);
      toast("Compte créé avec succès", "success");
      navigate("/profil");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={submit} className="space-y-4">
        {/* Nom d'affichage */}
        <div>
          <label className="mb-2 block text-sm font-medium">Nom d'affichage</label>
          <Input
            icon={<User className="h-4 w-4" />}
            placeholder="Jean Dupont"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
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
          <label className="mb-2 block text-sm font-medium">Mot de passe</label>
          <div className="relative">
            <Input
              icon={<Lock className="h-4 w-4" />}
              type={show ? "text" : "password"}
              placeholder="Min. 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Erreur */}
        <ErrorMessage message={error} />

        {/* Bouton */}
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </AuthLayout>
  );
}
