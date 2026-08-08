import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/users';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleRoleChange = async (id, role) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
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
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleDelete(u.id)} className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded border border-red-800/40 transition text-xs">
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
