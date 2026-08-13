import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/users';
const ADMIN_URL = 'http://localhost:5000/api/admin/users';

const EMPTY_FORM = { username: '', email: '', password: '', role: 'user' };

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditClick = (u) => {
    setEditingId(u.id);
    setFormData({ username: u.username, email: u.email, password: '', role: u.role });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { username: formData.username, email: formData.email, role: formData.role };
    if (formData.password) payload.password = formData.password;

    try {
      const res = await fetch(editingId ? `${ADMIN_URL}/${editingId}` : ADMIN_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await fetch(`${ADMIN_URL}/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      const res = await fetch(`${ADMIN_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              {editingId ? `✏️ Modifier #${editingId}` : '➕ Ajouter un utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom d'utilisateur</label>
                <input name="username" required value={formData.username} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Mot de passe {editingId && <span className="text-gray-600">(laisser vide pour ne pas changer)</span>}
                </label>
                <input type="password" name="password" required={!editingId} minLength={8} value={formData.password} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rôle</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              {!editingId && (
                <p className="text-xs text-gray-600">
                  Un compte créé ici est automatiquement marqué comme vérifié (pas d'email de confirmation à envoyer).
                </p>
              )}
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
            <h2 className="text-xl font-semibold mb-4 text-white">Utilisateurs ({users.length})</h2>
            {loading ? (
              <p className="text-gray-400">Chargement...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-sm">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Nom</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Vérifié</th>
                      <th className="py-3 px-2">Rôle</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-800/50 transition">
                        <td className="py-3 px-2 text-gray-500">#{u.id}</td>
                        <td className="py-3 px-2 font-medium text-white">{u.username}</td>
                        <td className="py-3 px-2 text-gray-300">{u.email}</td>
                        <td className="py-3 px-2">
                          {u.is_verified ? <span className="text-green-400">● Oui</span> : <span className="text-red-400">● Non</span>}
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => handleEditClick(u)} className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded border border-gray-700 transition text-xs">Éditer</button>
                          <button onClick={() => handleDelete(u.id)} className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded border border-red-800/40 transition text-xs">Supprimer</button>
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
