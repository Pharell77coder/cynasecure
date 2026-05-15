import { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiFetch";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom";
import React from "react";
import { Calendar, CreditCard, Layers } from "lucide-react";

export default function MySubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/api/subscriptions/my")
      .then((data) => setSubs(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container py-20 space-y-20 relative">

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

      <div className="relative space-y-20">

        {/* HEADER */}
        <header className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Mes abonnements
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Retrouvez ici tous vos abonnements actifs, leurs cycles, leurs dates de facturation
            et les détails associés.
          </p>
        </header>

        {/* AUCUN ABONNEMENT */}
        {subs.length === 0 && (
          <p className="text-gray-500 text-lg">Aucun abonnement pour le moment.</p>
        )}

        {/* LISTE DES ABONNEMENTS */}
        <section className="grid gap-10 md:grid-cols-2">
          {subs.map((sub) => (
            <Card
              key={sub.id}
              className="p-8 bg-gray-900 border-gray-800 shadow-xl hover:shadow-blue-500/10 transition rounded-xl"
            >
              {/* TITRE */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {sub.service.title}
                </h2>

                <span
                  className={
                    sub.status === "ACTIVE"
                      ? "text-emerald-400 text-sm font-semibold"
                      : "text-red-400 text-sm font-semibold"
                  }
                >
                  {sub.status}
                </span>
              </div>

              {/* INFOS */}
              <div className="space-y-3 text-gray-300 text-sm">

                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400">Cycle :</span>
                  <span className="font-semibold">
                    {sub.cycle === "monthly" ? "Mensuel" : "Annuel"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400">Prix :</span>
                  <span className="font-semibold">{sub.price} €</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400">Début :</span>
                  <span className="font-semibold">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400">Prochaine facturation :</span>
                  <span className="font-semibold">
                    {sub.nextBillingAt
                      ? new Date(sub.nextBillingAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              {/* BOUTON */}
              <Link to="/mes-abonnements">
                <Button className="mt-6 w-full">Gérer l’abonnement</Button>
              </Link>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
