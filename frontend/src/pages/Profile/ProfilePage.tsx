import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Mail,
  Phone,
  Building,
  Save,
  Fingerprint,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import React from "react";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [company, setCompany] = useState(user?.company ?? "");

  if (!user) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({ displayName, phone, company });
      toast("Profil mis à jour", "success");
    } catch (err: any) {
      toast(err.message || "Erreur lors de la mise à jour", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="space-y-20">

      {/* HEADER — style XDR */}
      <section className="bg-gray-950 border-b border-gray-900 py-20">
        <div className="container space-y-6">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <Fingerprint className="h-3 w-3" />
            ESPACE UTILISATEUR
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Paramètres du compte
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Gérez vos informations personnelles, vos coordonnées et les données associées à votre
            identité au sein de la plateforme.
          </p>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="mt-4 text-red-400 border border-red-500/30 hover:bg-red-500/10 w-fit gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </section>

      {/* PROFIL */}
      <section className="container max-w-3xl space-y-10">

        {/* Avatar + infos */}
        <Card className="p-8 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-3xl font-bold text-blue-400">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* Formulaire */}
        <Card className="p-8 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Informations personnelles
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Ces informations sont utilisées pour votre identité au sein de la plateforme.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-6">

            {/* Nom */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Nom d'affichage
              </label>
              <Input
                icon={<User className="h-4 w-4" />}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                icon={<Mail className="h-4 w-4" />}
                value={user.email}
                disabled
              />
            </div>

            {/* Téléphone + Entreprise */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Téléphone
                </label>
                <Input
                  icon={<Phone className="h-4 w-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Entreprise
                </label>
                <Input
                  icon={<Building className="h-4 w-4" />}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme SAS"
                />
              </div>
            </div>

            {/* Bouton sauvegarde */}
            <Button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
