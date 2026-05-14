import { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiFetch";
import React from "react";

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/api/payments/my")
      .then((data: any) => {
        setPayments(data as any[]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes paiements</h1>

      {payments.length === 0 && (
        <p className="text-gray-500">Aucun paiement enregistré.</p>
      )}

      <div className="grid gap-4">
        {payments.map((p) => (
          <div key={p.id} className="border p-4 rounded shadow">
            <p>Montant : {p.amount} €</p>
            <p>Cycle : {p.cycle}</p>
            <p>Status : {p.status}</p>
            <p>Date : {new Date(p.paidAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
