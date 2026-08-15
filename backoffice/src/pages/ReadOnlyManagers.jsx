import { useState, useEffect } from 'react';

function useAdminList(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(url, { credentials: 'include' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Volontairement en lecture seule : les moyens de paiement sont gérés exclusivement
// via Stripe (conformité PCI-DSS), voir backend/routes/payment_methods.py.
// Aucune route de création/modification n'existe côté admin pour cette table.
export function PaymentMethodManager() {
  const { data: methods, loading, error } = useAdminList('http://localhost:5000/api/admin/payment-methods');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Moyens de paiement</h1>
          <p className="mt-2 text-sm text-gray-500">
            Lecture seule : les cartes sont gérées exclusivement via Stripe (conformité PCI-DSS),
            jamais créées ou modifiées manuellement depuis ce back office.
          </p>
        </div>
        {error && <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-red-400">⚠️ {error}</div>}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : methods.length === 0 ? (
            <p className="text-gray-500">Aucun moyen de paiement enregistré.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Client (user_id)</th>
                  <th className="py-3 px-2">Carte</th>
                  <th className="py-3 px-2">Défaut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {methods.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/50 transition">
                    <td className="py-3 px-2 text-gray-500">#{m.id}</td>
                    <td className="py-3 px-2 text-gray-300">#{m.user_id}</td>
                    <td className="py-3 px-2 text-white capitalize">{m.brand} •••• {m.last4}</td>
                    <td className="py-3 px-2">{m.is_default ? '✅' : '—'}</td>
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
