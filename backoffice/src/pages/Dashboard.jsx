import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/admin/dashboard/stats';

function StatCard({ label, value, sub, accent = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, formatValue, color = 'bg-blue-600' }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{formatValue ? formatValue(value) : value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUS_LABELS = { pending: 'En attente', paid: 'Payées', failed: 'Échouées', cancelled: 'Annulées' };
const STATUS_COLORS = {
  pending: 'bg-yellow-950/50 text-yellow-400 border-yellow-800/40',
  paid: 'bg-green-950/50 text-green-400 border-green-800/40',
  failed: 'bg-red-950/50 text-red-400 border-red-800/40',
  cancelled: 'bg-gray-800 text-gray-400 border-gray-700'
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API_URL, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des statistiques');
        setStats(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-gray-400 p-8">Chargement du tableau de bord...</div>;
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-3xl mx-auto bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">
          ⚠️ {error || 'Impossible de charger les statistiques.'}
        </div>
      </div>
    );
  }

  const { orders, top_products, top_customers, revenue_by_category, users, products, recent_orders } = stats;
  const maxProductQty = Math.max(1, ...top_products.map((p) => p.quantity_sold));
  const maxCustomerSpent = Math.max(1, ...top_customers.map((c) => c.total_spent));
  const maxCategoryRevenue = Math.max(1, ...revenue_by_category.map((c) => c.revenue));
  const eur = (n) => `${n.toLocaleString('fr-FR')} €`;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de l'activité Cynasecure</p>
        </div>

        {/* CA sur différentes périodes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="CA aujourd'hui" value={eur(orders.today.revenue)} sub={`${orders.today.count} commande(s) payée(s)`} accent="text-green-400" />
          <StatCard label="CA cette semaine" value={eur(orders.week.revenue)} sub={`${orders.week.count} commande(s) payée(s)`} accent="text-green-400" />
          <StatCard label="CA ce mois-ci" value={eur(orders.month.revenue)} sub={`${orders.month.count} commande(s) payée(s)`} accent="text-green-400" />
          <StatCard label="CA total" value={eur(orders.all_time_paid.revenue)} sub={`${orders.all_time_paid.count} commande(s) payée(s) au total`} accent="text-blue-400" />
        </div>

        {/* Compteurs commandes / clients / produits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Commandes (tous statuts)" value={orders.all_time_all_statuses.count} />
          <StatCard label="Panier moyen" value={eur(orders.average_order_value)} />
          <StatCard label="Utilisateurs" value={users.total} sub={`${users.admins} admin(s) · ${users.verified} vérifié(s)`} />
          <StatCard label="Produits actifs" value={`${products.available} / ${products.total}`} sub={`${products.unavailable} indisponible(s)`} />
        </div>

        {/* Statuts de commandes */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Commandes par statut</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(orders.by_status).map(([status, count]) => (
              <span key={status} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${STATUS_COLORS[status] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                {STATUS_LABELS[status] || status} : {count}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 text-sm font-medium">
              Mensuel : {orders.billing_period_split.monthly} · Annuel : {orders.billing_period_split.annual}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produits populaires */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Produits populaires</h2>
            {top_products.length === 0 ? (
              <p className="text-gray-500 text-sm">Pas encore de vente enregistrée.</p>
            ) : (
              <div className="space-y-4">
                {top_products.map((p) => (
                  <BarRow key={p.product_id} label={p.name} value={p.quantity_sold} max={maxProductQty} formatValue={(v) => `${v} vendu(s) · ${eur(p.revenue)}`} />
                ))}
              </div>
            )}
          </section>

          {/* Meilleurs clients */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Meilleurs clients</h2>
            {top_customers.length === 0 ? (
              <p className="text-gray-500 text-sm">Pas encore de client avec commande payée.</p>
            ) : (
              <div className="space-y-4">
                {top_customers.map((c) => (
                  <BarRow key={c.user_id} label={`${c.username} (${c.orders_count} cmd.)`} value={c.total_spent} max={maxCustomerSpent} formatValue={eur} color="bg-purple-600" />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* CA par catégorie */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Chiffre d'affaires par catégorie</h2>
          {revenue_by_category.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnée disponible.</p>
          ) : (
            <div className="space-y-4">
              {revenue_by_category.map((c) => (
                <BarRow key={c.category} label={c.category} value={c.revenue} max={maxCategoryRevenue} formatValue={eur} color="bg-teal-600" />
              ))}
            </div>
          )}
        </section>

        {/* Dernières commandes */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Dernières commandes</h2>
          {recent_orders.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune commande.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">Client</th>
                  <th className="py-2 px-2">Montant</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {recent_orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 px-2 text-gray-500">#{o.id}</td>
                    <td className="py-2 px-2 text-gray-300">{o.username || `#${o.user_id}`}</td>
                    <td className="py-2 px-2 text-white">{eur(o.total_amount)}</td>
                    <td className="py-2 px-2 text-gray-400">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded border text-xs ${STATUS_COLORS[o.status] || ''}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
