import { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiFetch";
import React from "react";

export default function MySubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/api/subscriptions/my")
      .then((data: any) => {
        setSubs(data as any[]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes abonnements</h1>

      {subs.length === 0 && (
        <p className="text-gray-500">Aucun abonnement pour le moment.</p>
      )}

      <div className="grid gap-4">
        {subs.map((sub) => (
          <div key={sub.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{sub.service.name}</h2>
            <p>Cycle : {sub.cycle}</p>
            <p>Prix : {sub.price} €</p>
            <p>Status : {sub.status}</p>
            <p>Début : {new Date(sub.startDate).toLocaleDateString()}</p>
            <p>
              Prochaine facturation :{" "}
              {sub.nextBillingAt
                ? new Date(sub.nextBillingAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
