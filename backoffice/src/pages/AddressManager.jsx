import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/admin/addresses';
const USERS_URL = 'http://localhost:5000/api/users';

const EMPTY_FORM = { first_name: '', last_name: '', address1: '', city: '', postal_code: '', country: '', user_id: '' };

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAddresses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(USERS_URL, { credentials: 'include' });
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    fetchAddresses();
    fetchUsers();
  }, []);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditClick = (a) => {
    setEditingId(a.id);
    setFormData({
      first_name: a.first_name,
      last_name: a.last_name,
      address1: a.address1,
      city: a.city,
      postal_code: a.postal_code,
      country: a.country,
      user_id: a.user_id
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, user_id: parseInt(formData.user_id, 10) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      resetForm();
      fetchAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette adresse ?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  const usernameFor = (id) => users.find((u) => u.id === id)?.username || `#${id}`;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Adresses</h1>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              {editingId ? `✏️ Modifier #${editingId}` : '➕ Ajouter une adresse'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
                <select name="user_id" required value={formData.user_id} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="">-- Choisir --</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Prénom</label>
                  <input name="first_name" required value={formData.first_name} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                  <input name="last_name" required value={formData.last_name} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Adresse</label>
                <input name="address1" required value={formData.address1} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Ville</label>
                  <input name="city" required value={formData.city} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Code postal</label>
                  <input name="postal_code" required value={formData.postal_code} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Pays</label>
                <input name="country" required value={formData.country} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition">
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Adresses ({addresses.length})</h2>
            {loading ? (
              <p className="text-gray-400">Chargement...</p>
            ) : addresses.length === 0 ? (
              <p className="text-gray-500">Aucune adresse enregistrée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-sm">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Client</th>
                      <th className="py-3 px-2">Nom</th>
                      <th className="py-3 px-2">Adresse</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {addresses.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-800/50 transition">
                        <td className="py-3 px-2 text-gray-500">#{a.id}</td>
                        <td className="py-3 px-2 text-gray-300">{usernameFor(a.user_id)}</td>
                        <td className="py-3 px-2 text-white">{a.first_name} {a.last_name}</td>
                        <td className="py-3 px-2 text-gray-400">{a.address1}, {a.postal_code} {a.city}, {a.country}</td>
                        <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => handleEditClick(a)} className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded border border-gray-700 transition text-xs">Éditer</button>
                          <button onClick={() => handleDelete(a.id)} className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded border border-red-800/40 transition text-xs">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
