import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const FEATURES = [
  { icon: '🛡️', title: 'SOC managé', text: "Surveillance 24/7 de votre infrastructure par nos analystes." },
  { icon: '💻', title: 'EDR nouvelle génération', text: "Détection et réponse aux menaces sur tous vos postes." },
  { icon: '🔍', title: 'XDR étendu', text: "Corrélation multi-sources pour une visibilité complète." }
];

export default function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="bg-gray-950 text-gray-100">
      {/* HERO */}
      <section className="border-b border-gray-800 px-4 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white sm:text-5xl">
          La cybersécurité managée, sans complexité
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-gray-400">
          Cyna protège vos systèmes avec des services SOC, EDR et XDR clés en main,
          pilotés par des experts.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/catalogue"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Voir le catalogue
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-gray-200 transition hover:bg-gray-800"
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* CATÉGORIES */}
      {categories.length > 0 && (
        <section className="px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Nos gammes de services</h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/catalogue?categorie=${c.slug}`}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center transition hover:border-blue-700/60"
              >
                <span className="text-3xl">{c.icon}</span>
                <p className="mt-3 font-semibold text-white">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="border-t border-gray-800 px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
