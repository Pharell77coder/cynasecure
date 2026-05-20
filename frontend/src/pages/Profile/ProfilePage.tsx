import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User, Mail, Phone, Building, Save, Shield,
  Lock, Eye, EyeOff, LogOut, Calendar, Clock,
  CheckCircle2, AlertCircle,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { UserNav } from "../../components/layout/UserNav";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { authApi } from "../../api/auth";

function fmt(d?: string) {
  if (!d) return "—";
  try { return format(new Date(d), "dd MMMM yyyy", { locale: fr }); }
  catch { return "—"; }
}

function PasswordField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <Input
          icon={<Lock className="h-4 w-4" />}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ displayName, phone, company });
      toast("Profil mis à jour", "success");
    } catch (err: any) {
      toast(err.message || "Erreur lors de la mise à jour", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("Le mot de passe doit contenir au moins 6 caractères", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast("Mot de passe mis à jour", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast(err.message || "Erreur lors du changement de mot de passe", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <>
      <UserNav />

      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="container py-10 space-y-6 pb-20">

        {/* ── Identity card ── */}
        <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/20 border-2 border-blue-500/30 text-2xl font-black text-blue-400">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl font-black text-white">{user.displayName}</h1>
              <span className="inline-flex items-center gap-1 border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest px-2 py-0.5 rounded">
                <Shield className="h-2.5 w-2.5" />
                {user.role === "ROLE_ADMIN" ? "Administrateur" : "Utilisateur"}
              </span>
            </div>
            <p className="text-sm text-gray-400">{user.email}</p>
            {user.company && <p className="text-xs text-gray-500 mt-0.5">{user.company}</p>}
            <p className="text-xs text-gray-600 mt-2 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="h-3 w-3" />
              Membre depuis {fmt(user.createdAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-400 border border-red-500/20 hover:bg-red-500/10 gap-1.5 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </Card>

        {/* ── Main grid ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Left — personal info form */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-blue-500" />
              Informations personnelles
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Nom d'affichage</label>
                <Input
                  icon={<User className="h-4 w-4" />}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Adresse email</label>
                <Input
                  icon={<Mail className="h-4 w-4" />}
                  value={user.email}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">L'email ne peut pas être modifié.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Téléphone</label>
                  <Input
                    icon={<Phone className="h-4 w-4" />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Entreprise</label>
                  <Input
                    icon={<Building className="h-4 w-4" />}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nom de votre société"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingProfile}
                className="gap-2 mt-2"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? "Enregistrement…" : "Enregistrer les modifications"}
              </Button>
            </form>
          </Card>

          {/* Right column */}
          <div className="space-y-6">

            {/* Password change */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
                <Lock className="h-4 w-4 text-blue-500" />
                Changer le mot de passe
              </h2>

              <form onSubmit={handlePasswordSave} className="space-y-4">
                <PasswordField
                  label="Mot de passe actuel"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="••••••••"
                />
                <PasswordField
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="6 caractères minimum"
                />
                <PasswordField
                  label="Confirmer le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                />

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Les mots de passe correspondent
                  </p>
                )}

                <Button
                  type="submit"
                  variant="outline"
                  disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {savingPassword ? "Mise à jour…" : "Mettre à jour"}
                </Button>
              </form>
            </Card>

            {/* Account info */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-blue-500" />
                Informations du compte
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Créé le</span>
                  <span className="text-gray-200 font-medium">{fmt(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Dernière modification</span>
                  <span className="text-gray-200 font-medium">{fmt(user.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Statut</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Actif
                  </span>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </>
  );
}
