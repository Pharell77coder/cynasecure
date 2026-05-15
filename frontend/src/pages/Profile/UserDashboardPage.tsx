import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { subscriptionsApi } from "../../api/subscriptions";
import { apiFetch } from "../../api/apiFetch";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, CreditCard, Calendar } from "lucide-react";

// ----------------------
// TYPES
// ----------------------

interface Payment {
  id: number;
  amount: number;
  status: string;
  paidAt: string;
}

interface Subscription {
  id: number;
  price: number;
  cycle: "monthly" | "yearly";
  status: string;
  nextBillingAt?: string;
  service: {
    id: number;
    title: string;
    categorySlug?: string;
  };
}

interface Service {
  id: number;
  title: string;
  categorySlug: string;
  priceMonthly: number;
  image?: string;
}

// ----------------------
// SKELETON
// ----------------------

function DashboardSkeleton() {
  return (
    <div className="container py-20 space-y-20 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded" />
      <div className="grid gap-10 md:grid-cols-3">
        <div className="h-24 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
      <div className="h-64 bg-muted rounded" />
      <div className="h-40 bg-muted rounded" />
    </div>
  );
}

// ----------------------
// PAGE
// ----------------------

export default function UserDashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recommended, setRecommended] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      subscriptionsApi.list(),
      apiFetch<Payment[]>("/api/payments/my"),
      apiFetch<Service[]>("/api/services"),
    ])
      .then(([subs, pays, services]) => {
        setSubscriptions(subs);
        setPayments(pays);

        if (subs.length > 0) {
          const cat = subs[0].service.categorySlug;
          setRecommended(
            services.filter((s) => s.categorySlug === cat).slice(0, 3)
          );
        }
      })
      .catch(() => toast("Erreur lors du chargement", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const nextPayment = subscriptions
    .filter((s) => s.nextBillingAt)
    .sort((a, b) => new Date(a.nextBillingAt!).getTime() - new Date(b.nextBillingAt!).getTime())[0];

  const chartData = payments.map((p) => ({
    date: p.paidAt,
    amount: p.amount,
  }));

  return (
    <div className="container py-10 space-y-16 relative">

      {/* Glow bleu */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative space-y-16">

        {/* Titre */}
        <h1 className="text-4xl font-black text-white tracking-tight">
          Tableau de bord
        </h1>

        {/* Statistiques */}
        <div className="grid gap-10 md:grid-cols-3">
          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-400">Abonnements actifs</p>
            </div>
            <p className="text-4xl font-black mt-3 text-white">{activeSubs.length}</p>
          </Card>

          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-400">Total payé</p>
            </div>
            <p className="text-4xl font-black mt-3 text-white">{totalPaid} €</p>
          </Card>

          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-400">Prochain paiement</p>
            </div>
            <p className="text-2xl font-bold mt-3 text-white">
              {nextPayment ? nextPayment.nextBillingAt : "Aucun"}
            </p>
          </Card>
        </div>

        {/* Graphique */}
        <Card className="p-8 bg-gray-900 border-gray-800">
          <h2 className="text-xl font-bold mb-6 text-white">Historique des paiements</h2>
          {payments.length === 0 ? (
            <p className="text-gray-500">Aucun paiement pour le moment.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Abonnements actifs */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">Mes abonnements actifs</h2>

          {activeSubs.length === 0 ? (
            <p className="text-gray-500">Aucun abonnement actif.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeSubs.map((s) => (
                <Card key={s.id} className="p-6 bg-gray-900 border-gray-800">
                  <h3 className="font-bold text-white">{s.service.title}</h3>
                  <p className="text-sm text-gray-400">
                    {s.price} € / {s.cycle === "monthly" ? "mois" : "an"}
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    Prochain paiement : {s.nextBillingAt}
                  </p>

                  <Link to="/mes-abonnements">
                    <Button variant="outline" className="mt-4 w-full">
                      Gérer
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Derniers paiements */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">Derniers paiements</h2>

          {payments.length === 0 ? (
            <p className="text-gray-500">Aucun paiement effectué.</p>
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 5).map((p) => (
                <Card key={p.id} className="p-4 bg-gray-900 border-gray-800 flex justify-between">
                  <div>
                    <p className="font-bold text-white">{p.amount} €</p>
                    <p className="text-xs text-gray-500">{p.paidAt}</p>
                  </div>
                  <span
                    className={
                      p.status === "paid"
                        ? "text-green-500 font-bold"
                        : "text-red-500 font-bold"
                    }
                  >
                    {p.status}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recommandations */}
        <section className="space-y-6 mb-20">
          <h2 className="text-xl font-bold text-white">Recommandations pour vous</h2>

          {recommended.length === 0 ? (
            <p className="text-gray-500">Aucune recommandation disponible.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {recommended.map((s) => (
                <Card key={s.id} className="p-6 bg-gray-900 border-gray-800">
                  <h3 className="font-bold text-white">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.priceMonthly} €/mois</p>

                  <Link to={`/services/${s.id}`}>
                    <Button className="mt-4 w-full">Voir</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
