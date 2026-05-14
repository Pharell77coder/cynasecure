import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { subscriptionsApi } from "../../api/subscriptions";
import { apiFetch } from "../../api/apiFetch";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
    <div className="container py-10 space-y-10 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded" />
      <div className="grid gap-6 md:grid-cols-3">
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

        // Recommandations basées sur la catégorie du premier abonnement
        if (subs.length > 0) {
          const cat = subs[0].service.categorySlug;
          setRecommended(
            services
              .filter((s) => s.categorySlug === cat)
              .slice(0, 3)
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
    .sort(
      (a, b) =>
        new Date(a.nextBillingAt!).getTime() -
        new Date(b.nextBillingAt!).getTime()
    )[0];

  // Graphique des paiements
  const chartData = payments.map((p) => ({
    date: p.paidAt,
    amount: p.amount,
  }));

  return (
    <div className="container py-10 space-y-10">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Abonnements actifs</p>
          <p className="text-3xl font-bold mt-2">{activeSubs.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total payé</p>
          <p className="text-3xl font-bold mt-2">{totalPaid} €</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Prochain paiement</p>
          <p className="text-xl font-bold mt-2">
            {nextPayment ? nextPayment.nextBillingAt : "Aucun"}
          </p>
        </Card>
      </div>

      {/* Graphique */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Historique des paiements</h2>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">Aucun paiement pour le moment.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Abonnements actifs */}
      <section>
        <h2 className="text-xl font-bold mb-4">Mes abonnements actifs</h2>

        {activeSubs.length === 0 ? (
          <p className="text-muted-foreground">Aucun abonnement actif.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeSubs.map((s) => (
              <Card key={s.id} className="p-6">
                <h3 className="font-bold">{s.service.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {s.price} € / {s.cycle === "monthly" ? "mois" : "an"}
                </p>
                <p className="text-xs mt-2">
                  Prochain paiement : {s.nextBillingAt}
                </p>

                <Link to="/mes-abonnements">
                  <Button variant="outline" className="mt-4" fullWidth>
                    Gérer
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Derniers paiements */}
      <section>
        <h2 className="text-xl font-bold mb-4">Derniers paiements</h2>

        {payments.length === 0 ? (
          <p className="text-muted-foreground">Aucun paiement effectué.</p>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 5).map((p) => (
              <Card key={p.id} className="p-4 flex justify-between">
                <div>
                  <p className="font-bold">{p.amount} €</p>
                  <p className="text-xs text-muted-foreground">{p.paidAt}</p>
                </div>
                <span
                  className={
                    p.status === "paid"
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
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
      <section>
        <h2 className="text-xl font-bold mb-4">Recommandations pour vous</h2>

        {recommended.length === 0 ? (
          <p className="text-muted-foreground">Aucune recommandation disponible.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recommended.map((s) => (
              <Card key={s.id} className="p-4">
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {s.priceMonthly} €/mois
                </p>

                <Link to={`/services/${s.id}`}>
                  <Button className="mt-4" fullWidth>
                    Voir
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
