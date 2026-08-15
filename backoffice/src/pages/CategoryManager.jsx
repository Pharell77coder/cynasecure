import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/categories';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ slug: '', name: '', icon: '' });

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL);
      setCategories(await res.json());
    } catch {
      setError('Erreur lors du chargement des catégories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setFormData({ slug: cat.slug, name: cat.name, icon: cat.icon });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ slug: '', name: '', icon: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ? (impossible si des produits y sont liés)')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Catégories</h1>
        </div>

        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              {editingId ? `✏️ Modifier #${editingId}` : '➕ Ajouter une catégorie'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Slug</label>
                <input name="slug" required value={formData.slug} onChange={handleChange} placeholder="soc"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                <input name="name" required value={formData.name} onChange={handleChange} placeholder="SOC"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Icône (emoji)</label>
                <input name="icon" required value={formData.icon} onChange={handleChange} placeholder="🛡️"
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
            <h2 className="text-xl font-semibold mb-4 text-white">Catégories ({categories.length})</h2>
            {loading ? (
              <p className="text-gray-400">Chargement...</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="py-3 px-2">Icône</th>
                    <th className="py-3 px-2">Nom</th>
                    <th className="py-3 px-2">Slug</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-800/50 transition">
                      <td className="py-3 px-2 text-xl">{c.icon}</td>
                      <td className="py-3 px-2 font-medium text-white">{c.name}</td>
                      <td className="py-3 px-2 text-gray-400">{c.slug}</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button onClick={() => handleEditClick(c)} className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded border border-gray-700 transition text-xs">Éditer</button>
                        <button onClick={() => handleDelete(c.id)} className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded border border-red-800/40 transition text-xs">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
