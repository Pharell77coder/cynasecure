import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/admin/orders';
const USERS_URL = 'http://localhost:5000/api/users';
const ADDRESSES_URL = 'http://localhost:5000/api/admin/addresses';
const PRODUCTS_URL = 'http://localhost:5000/api/products';
const STATUSES = ['pending', 'paid', 'failed', 'cancelled'];

const EMPTY_ITEM = { product_id: '', quantity: 1, billing_period: 'monthly' };

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [userId, setUserId] = useState('');
  const [billingAddressId, setBillingAddressId] = useState('');
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

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

  useEffect(() => {
    fetchOrders();
    fetch(USERS_URL, { credentials: 'include' }).then((r) => r.ok && r.json()).then((d) => d && setUsers(d));
    fetch(ADDRESSES_URL, { credentials: 'include' }).then((r) => r.ok && r.json()).then((d) => d && setAddresses(d));
    fetch(PRODUCTS_URL).then((r) => r.ok && r.json()).then((d) => d && setProducts(d));
  }, []);

  const resetForm = () => {
    setUserId('');
    setBillingAddressId('');
    setStatus('pending');
    setItems([{ ...EMPTY_ITEM }]);
    setShowForm(false);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItemRow = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItemRow = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) return setError('Choisissez un client.');
    const cleanItems = items
      .filter((it) => it.product_id)
      .map((it) => ({ product_id: parseInt(it.product_id, 10), quantity: parseInt(it.quantity, 10) || 1, billing_period: it.billing_period }));
    if (cleanItems.length === 0) return setError('Ajoutez au moins un article.');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          billing_address_id: billingAddressId ? parseInt(billingAddressId, 10) : null,
          status,
          items: cleanItems
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      resetForm();
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
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

  const addressesForUser = addresses.filter((a) => String(a.user_id) === String(userId));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Commandes</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            {showForm ? 'Fermer' : '➕ Nouvelle commande'}
          </button>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Créer une commande manuellement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
                  <select required value={userId} onChange={(e) => { setUserId(e.target.value); setBillingAddressId(''); }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">-- Choisir --</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Adresse de facturation</label>
                  <select value={billingAddressId} onChange={(e) => setBillingAddressId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">-- Aucune --</option>
                    {addressesForUser.map((a) => <option key={a.id} value={a.id}>{a.address1}, {a.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Statut initial</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Articles</label>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <select required value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                        className="flex-1 min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                        <option value="">-- Produit --</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.price_monthly} €/mois)</option>)}
                      </select>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                      <select value={item.billing_period} onChange={(e) => updateItem(i, 'billing_period', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                        <option value="monthly">Mensuel</option>
                        <option value="annual">Annuel</option>
                      </select>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItemRow(i)} className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItemRow} className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                  + Ajouter un article
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition">
                  Créer la commande
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

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
