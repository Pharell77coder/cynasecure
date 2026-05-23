import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CreditCard, CheckCircle2, XCircle, TrendingUp, Receipt, AlertCircle, Download,
} from "lucide-react";

import { apiFetch } from "../../api/apiFetch";
import { Card } from "../../components/ui/Card";
import { UserNav } from "../../components/layout/UserNav";

interface Payment {
  id: number;
  amount: number;
  cycle: string;
  status: string;
  gateway: string | null;
  last4: string | null;
  invoiceNumber: string | null;
  paidAt: string;
}

function fmt(d: string) {
  try { return format(new Date(d), "dd MMMM yyyy", { locale: fr }); }
  catch { return d; }
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "paid";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
      isPaid
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20"
    }`}>
      {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {isPaid ? "Payé" : status === "FAILED" ? "Échoué" : status}
    </span>
  );
}

function cycleLabel(c: string) {
  if (c === "monthly") return "Mensuel";
  if (c === "yearly") return "Annuel";
  return c;
}

function DashboardSkeleton() {
  return (
    <>
      <UserNav />
      <div className="container py-10 space-y-6 animate-pulse">
        <div className="h-24 bg-gray-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-800" />)}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-800" />)}
        </div>
      </div>
    </>
  );
}

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Payment[]>("/api/payments/my")
      .then((data) => setPayments(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;

  return (
    <>
      <UserNav />

      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="container relative py-10 space-y-8 pb-20">

        {/* ── Header ── */}
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded mb-3">
            <Receipt className="h-3 w-3" />
            HISTORIQUE FINANCIER
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Mes paiements</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Consultez l'historique complet de vos transactions et factures.
          </p>
        </header>

        {/* ── Stats ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent bg-gray-900 p-6 shadow-sm transition-colors hover:bg-gray-800">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Total réglé</p>
            <p className="mt-1 text-2xl font-black text-white">{totalPaid.toLocaleString("fr-FR")} €</p>
          </div>

          <div className="relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent bg-gray-900 p-6 shadow-sm transition-colors hover:bg-gray-800">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 mb-4">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Transactions</p>
            <p className="mt-1 text-2xl font-black text-white">{payments.length}</p>
          </div>

          <div className="relative overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent bg-gray-900 p-6 shadow-sm transition-colors hover:bg-gray-800">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-violet-500/10 text-violet-400 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Payés</p>
            <p className="mt-1 text-2xl font-black text-white">{paidCount}</p>
          </div>
        </div>

        {/* ── Payments list ── */}
        {payments.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-400 font-medium">Aucun paiement enregistré</p>
            <p className="text-gray-600 text-sm mt-1">Vos transactions apparaîtront ici</p>
          </Card>
        ) : (
          <div className="border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-widest border-b border-gray-800 bg-gray-950">
              <span>Date</span>
              <span>Moyen</span>
              <span>Montant</span>
              <span className="text-center">Statut</span>
              <span className="text-right">Facture</span>
            </div>

            <div className="divide-y divide-gray-800">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="grid gap-3 md:grid-cols-5 md:gap-4 items-center px-6 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5 md:hidden">Date</p>
                    <p className="text-sm text-gray-300">{fmt(p.paidAt)}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5 md:hidden">Moyen</p>
                    <p className="text-sm text-gray-400">
                      {p.gateway === "paypal" ? "PayPal" : p.last4 ? `•••• ${p.last4}` : cycleLabel(p.cycle)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-0.5 md:hidden">Montant</p>
                    <p className="text-lg font-bold text-white">{p.amount} €</p>
                  </div>

                  <div className="md:text-center">
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="md:text-right">
                    {p.invoiceNumber ? (
                      <a
                        href={`${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/checkout/invoice/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {p.invoiceNumber}
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
