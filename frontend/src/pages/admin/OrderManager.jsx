import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/admin/orders';
const STATUSES = ['pending', 'paid', 'failed', 'cancelled'];

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Commandes</h1>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">Aucune commande.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Client (user_id)</th>
                  <th className="py-3 px-2">Articles</th>
                  <th className="py-3 px-2">Montant</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Statut</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-800/50 transition">
                    <td className="py-3 px-2 text-gray-500">#{o.id}</td>
                    <td className="py-3 px-2 text-gray-300">#{o.user_id}</td>
                    <td className="py-3 px-2 text-gray-400">{o.items.map((i) => i.product_name).join(', ')}</td>
                    <td className="py-3 px-2 text-white">{o.total_amount} €</td>
                    <td className="py-3 px-2 text-gray-400">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-2">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleDelete(o.id)} className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded border border-red-800/40 transition text-xs">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
