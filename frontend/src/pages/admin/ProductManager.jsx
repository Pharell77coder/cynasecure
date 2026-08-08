import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/products';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price_monthly: '',
    available: true,
    category_id: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur lors du chargement des produits');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/categories');
    setCategories(await res.json());
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price_monthly: product.price_monthly,
      available: product.available,
      category_id: product.category_id
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', price_monthly: '', available: true, category_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...formData,
      price_monthly: parseInt(formData.price_monthly, 10),
      category_id: parseInt(formData.category_id, 10)
    };

    try {
      const res = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de l\'opération');

      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Gestion des Produits CynaSecure</h1>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              {editingId ? `✏️ Modifier Produit #${editingId}` : '➕ Ajouter un Produit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom du produit</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  placeholder="ex: Cyna SOC Essential"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prix mensuel (€)</label>
                <input
                  type="number" name="price_monthly" required value={formData.price_monthly} onChange={handleChange}
                  placeholder="299"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                <select
                  name="category_id" required value={formData.category_id} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choisir --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox" id="available" name="available" checked={formData.available} onChange={handleChange}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-300">
                  Produit disponible à la vente
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition">
                  {editingId ? 'Mettre à jour' : 'Créer le produit'}
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
            <h2 className="text-xl font-semibold mb-4 text-white">Liste des Offres ({products.length})</h2>

            {loading ? (
              <p className="text-gray-400">Chargement...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500">Aucun produit en base de données.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-sm">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Nom</th>
                      <th className="py-3 px-2">Prix</th>
                      <th className="py-3 px-2">Catégorie</th>
                      <th className="py-3 px-2">Statut</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-800/50 transition">
                        <td className="py-3 px-2 text-gray-500">#{p.id}</td>
                        <td className="py-3 px-2 font-medium text-white">{p.name}</td>
                        <td className="py-3 px-2 text-gray-300">{p.price_monthly} € / mois</td>
                        <td className="py-3 px-2">
                          <span className="uppercase bg-blue-950 text-blue-400 text-xs px-2 py-1 rounded border border-blue-800/40">
                            {categoryName(p.category_id)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {p.available ? (
                            <span className="text-green-400">● Actif</span>
                          ) : (
                            <span className="text-red-400">● Inactif</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right space-x-2">
                          <button onClick={() => handleEditClick(p)} className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded border border-gray-700 transition text-xs">
                            Éditer
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="bg-red-950/50 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded border border-red-800/40 transition text-xs">
                            Supprimer
                          </button>
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
