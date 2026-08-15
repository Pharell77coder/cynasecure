import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api.js';
import Button from '../components/Button.jsx';

const STATUS_LABELS = {
  pending: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  paid: { label: 'Payée', bg: '#D1FAE5', color: '#065F46' },
  failed: { label: 'Échouée', bg: '#FEE2E2', color: '#991B1B' },
  cancelled: { label: 'Annulée', bg: '#F3F4F6', color: '#6B7280' }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => { orderService.list().then(setOrders).finally(() => setLoading(false)); }, []);

  const filtered = orders.filter((o) => {
    if (search && !o.items.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  const byYear = filtered.reduce((acc, o) => {
    const year = new Date(o.created_at).getFullYear();
    (acc[year] = acc[year] || []).push(o);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b - a);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-gray-400">Chargement...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Historique des commandes</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2">
          <span className="text-gray-500">🔍</span>
          <input
            type="search" placeholder="Rechercher par service..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payée</option>
          <option value="failed">Échouée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {years.length === 0 ? (
        <div className="py-16 text-center">
          <span className="text-3xl">📋</span>
          <h3 className="mt-4 font-semibold text-white">Aucune commande trouvée</h3>
          <p className="mt-2 text-gray-500">Modifiez vos filtres ou passez votre première commande.</p>
          <Link to="/catalogue" className="mt-4 inline-block"><Button variant="primary">Voir le catalogue</Button></Link>
        </div>
      ) : (
        years.map((year) => (
          <div key={year} className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-gray-500">{year}</h2>
            <div className="space-y-3">
              {byYear[year].map((order) => {
                const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                const isExpanded = expandedOrder === order.id;
                return (
                  <div key={order.id} className="rounded-xl border border-gray-800 bg-gray-900">
                    <div
                      className="flex cursor-pointer items-center gap-4 p-4"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-xl">
                        {order.items[0]?.product_name.includes('SOC') ? '🛡️' : order.items[0]?.product_name.includes('EDR') ? '💻' : '🔍'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{order.items.map((i) => i.product_name).join(', ')}</h3>
                        <p className="text-sm text-gray-500">
                          Commande #{order.id} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{order.total_amount} €</span>
                        <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                        <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-800 p-4">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-400">Commande</h4>
                            <p className="text-sm text-gray-300">N° #{order.id}</p>
                            <p className="text-sm text-gray-300">Date : {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                            <p className="text-sm text-gray-300">Statut : {status.label}</p>
                          </div>
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-400">Détail</h4>
                            {order.items.map((i) => (
                              <p key={i.id} className="text-sm text-gray-300">
                                {i.product_name} × {i.quantity} ({i.billing_period === 'annual' ? 'annuel' : 'mensuel'}) — {i.unit_price * i.quantity} €
                              </p>
                            ))}
                            <p className="mt-1 font-semibold text-white">Total : {order.total_amount} €</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
