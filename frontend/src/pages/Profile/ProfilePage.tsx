import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Mail, Phone, Building, Save } from "lucide-react";
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
    <div className="container max-w-3xl py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon espace</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <Card className="mt-8 p-8">
        <h2 className="text-xl font-bold">Profil</h2>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>

        <div className="mt-6 flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Nom d'affichage</label>
            <Input
              icon={<User className="h-4 w-4" />}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input icon={<Mail className="h-4 w-4" />} value={user.email} disabled />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Téléphone</label>
              <Input
                icon={<Phone className="h-4 w-4" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 00 00 00 00"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Entreprise</label>
              <Input
                icon={<Building className="h-4 w-4" />}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme SAS"
              />
            </div>
          </div>

          <Button type="submit">
            <Save className="h-4 w-4" /> Sauvegarder
          </Button>
        </form>
      </Card>
    </div>
  );
}
