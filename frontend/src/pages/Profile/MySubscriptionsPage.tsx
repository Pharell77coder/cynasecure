import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar, CreditCard, Layers, Shield, CheckCircle2, XCircle,
  Package, AlertCircle, ArrowRight, RefreshCw, ArrowUpDown, RotateCcw,
} from "lucide-react";

import { apiFetch } from "../../api/apiFetch";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";
import { UserNav } from "../../components/layout/UserNav";
import { subscriptionsApi } from "../../api/subscriptions";
import { toast } from "../../hooks/useToast";

interface Subscription {
  id: number;
  price: number;
  cycle: "monthly" | "yearly";
  status: string;
  startDate: string;
  nextBillingAt?: string;
  endDate?: string;
  autoRenew: boolean;
  service: { id: number; title: string; categorySlug?: string };
}

function fmt(d: string) {
  try { return format(new Date(d), "dd MMMM yyyy", { locale: fr }); }
  catch { return d; }
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
      isActive
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20"
    }`}>
      {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {isActive ? "Actif" : status === "CANCELLED" ? "Annulé" : status}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <UserNav />
      <div className="container py-10 space-y-6 animate-pulse">
        <div className="h-24 bg-gray-800" />
        <div className="flex gap-6">
          <div className="h-16 w-40 bg-gray-800" />
          <div className="h-16 w-40 bg-gray-800" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-gray-800" />)}
        </div>
      </div>
    </>
  );
}

export default function MySubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [renewing, setRenewing] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<Subscription[]>("/api/subscriptions/my")
      .then((data) => setSubs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Annuler cet abonnement ? Vous conserverez l'accès jusqu'à la fin de la période en cours.")) return;
    setCancelling(id);
    try {
      await subscriptionsApi.cancel(id);
      setSubs((prev) => prev.map((s) => {
        if (s.id !== id) return s;
        return { ...s, status: "CANCELLED", endDate: s.nextBillingAt };
      }));
      toast("Abonnement annulé. Accès conservé jusqu'à la fin de la période.", "success");
    } catch {
      toast("Erreur lors de l'annulation", "error");
    } finally {
      setCancelling(null);
    }
  };

  const handleRenew = async (id: number) => {
    setRenewing(id);
    try {
      await subscriptionsApi.renew(id);
      setSubs((prev) => prev.map((s) =>
        s.id === id ? { ...s, status: "ACTIVE", endDate: undefined } : s
      ));
      toast("Abonnement réactivé avec succès.", "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors de la réactivation", "error");
    } finally {
      setRenewing(null);
    }
  };

  const handleToggleAutoRenew = async (id: number) => {
    setTogglingAutoRenew(id);
    try {
      const res = await subscriptionsApi.toggleAutoRenew(id);
      setSubs((prev) => prev.map((s) => s.id === id ? { ...s, autoRenew: res.autoRenew } : s));
      toast(res.message, "success");
    } catch {
      toast("Erreur lors de la mise à jour du renouvellement automatique", "error");
    } finally {
      setTogglingAutoRenew(null);
    }
  };

  const handleUpgrade = async (id: number, currentCycle: "monthly" | "yearly") => {
    const newCycle = currentCycle === "monthly" ? "yearly" : "monthly";
    const label = newCycle === "yearly" ? "annuelle (−17%)" : "mensuelle";
    if (!window.confirm(`Passer à la formule ${label} ?`)) return;
    setUpgrading(id);
    try {
      const res = await subscriptionsApi.upgrade(id, newCycle) as { cycle: string; price: number };
      setSubs((prev) => prev.map((s) =>
        s.id === id ? { ...s, cycle: res.cycle as "monthly" | "yearly", price: res.price } : s
      ));
      toast(`Formule mise à jour : ${label}.`, "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Erreur lors du changement de formule", "error");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const activeSubs = subs.filter((s) => s.status === "ACTIVE");
  const monthlyTotal = activeSubs
    .filter((s) => s.cycle === "monthly")
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <PageTransition>
      <UserNav />

      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="container relative py-10 space-y-8 pb-20">

        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded mb-3">
            <Shield className="h-3 w-3" />
            GESTION DES SERVICES
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Mes abonnements</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Gérez vos services de cybersécurité actifs, leurs cycles et leurs options.
          </p>
        </header>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3 border border-gray-800 bg-gray-900 px-5 py-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Services actifs</p>
              <p className="text-lg font-bold text-white">{activeSubs.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border border-gray-800 bg-gray-900 px-5 py-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Dépenses / mois</p>
              <p className="text-lg font-bold text-white">{monthlyTotal} €</p>
            </div>
          </div>
        </div>

        {subs.length === 0 && (
          <Card className="p-16 text-center border-dashed">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 font-medium">Aucun abonnement pour le moment</p>
            <p className="text-gray-500 text-sm mt-1">Découvrez nos solutions de cybersécurité</p>
            <Link to="/catalogue">
              <Button className="mt-6 gap-1.5">
                <Package className="h-4 w-4" />
                Explorer le catalogue
              </Button>
            </Link>
          </Card>
        )}

        {subs.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {subs.map((sub) => {
              const daysLeft = sub.endDate
                ? differenceInDays(new Date(sub.endDate), new Date())
                : null;
              const canRenew = sub.status === "CANCELLED" && (daysLeft === null || daysLeft >= 0);

              return (
                <Card
                  key={sub.id}
                  className={`p-6 space-y-5 transition-all duration-200 ${
                    sub.status !== "ACTIVE" ? "opacity-60" : "hover:border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-blue-500" />
                      </div>
                      <h2 className="text-base font-bold text-white leading-tight truncate">
                        {sub.service.title}
                      </h2>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  <div className="space-y-2.5 text-sm border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Layers className="h-4 w-4 text-blue-500" />
                        Cycle de facturation
                      </div>
                      <span className="font-semibold text-white">
                        {sub.cycle === "monthly" ? "Mensuel" : "Annuel"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        Montant
                      </div>
                      <span className="font-semibold text-white">
                        {sub.price} € / {sub.cycle === "monthly" ? "mois" : "an"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Date de début
                      </div>
                      <span className="font-semibold text-white">{fmt(sub.startDate)}</span>
                    </div>

                    {sub.nextBillingAt && sub.status === "ACTIVE" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <AlertCircle className="h-4 w-4 text-emerald-500" />
                          Prochain renouvellement
                        </div>
                        <span className="font-semibold text-emerald-400">{fmt(sub.nextBillingAt)}</span>
                      </div>
                    )}

                    {sub.status === "CANCELLED" && sub.endDate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Accès jusqu'au
                        </div>
                        <span className="font-semibold text-amber-400">
                          {fmt(sub.endDate)}
                          {daysLeft !== null && daysLeft >= 0 && (
                            <span className="ml-1 text-xs text-amber-500">({daysLeft}j)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {sub.status === "ACTIVE" && (
                    <div className="pt-1 border-t border-gray-800 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/services/${sub.service.id}`} className="flex-1 min-w-[100px]">
                          <Button variant="outline" size="sm" className="w-full gap-1.5">
                            Voir le service
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={upgrading === sub.id}
                          onClick={() => handleUpgrade(sub.id, sub.cycle)}
                          className="gap-1.5"
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                          {sub.cycle === "monthly" ? "Passer annuel" : "Passer mensuel"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={cancelling === sub.id}
                          onClick={() => handleCancel(sub.id)}
                        >
                          {cancelling === sub.id ? "..." : "Annuler"}
                        </Button>
                      </div>
                      <button
                        disabled={togglingAutoRenew === sub.id}
                        onClick={() => handleToggleAutoRenew(sub.id)}
                        className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 border transition-colors w-full justify-center ${
                          sub.autoRenew
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                        }`}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {togglingAutoRenew === sub.id
                          ? "..."
                          : sub.autoRenew
                          ? "Renouvellement auto : ON"
                          : "Renouvellement auto : OFF"}
                      </button>
                    </div>
                  )}

                  {canRenew && (
                    <div className="pt-1 border-t border-gray-800">
                      <Button
                        size="sm"
                        disabled={renewing === sub.id}
                        onClick={() => handleRenew(sub.id)}
                        className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {renewing === sub.id ? "Réactivation…" : "Réactiver l'abonnement"}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
