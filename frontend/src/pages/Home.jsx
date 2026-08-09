import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Button from '../components/Button.jsx';
import { catalogService } from '../services/api.js';

const SLIDES = [
  {
    id: 'soc',
    title: 'Protégez votre entreprise avec Cyna SOC',
    subtitle: "Surveillance 24/7 de vos systèmes d'information",
    cta: 'Découvrir le SOC',
    ctaLink: '/catalogue?cat=soc',
    bg: 'linear-gradient(135deg, #0D0B3B 0%, #1E1B74 50%, #7B3FE4 100%)'
  },
  {
    id: 'edr',
    title: 'Cyna EDR – Détection & Réponse aux menaces',
    subtitle: 'Protection avancée de vos endpoints en temps réel',
    cta: "Explorer l'EDR",
    ctaLink: '/catalogue?cat=edr',
    bg: 'linear-gradient(135deg, #13104A 0%, #2D2A9B 50%, #A855F7 100%)'
  },
  {
    id: 'xdr',
    title: 'Cyna XDR – La sécurité unifiée',
    subtitle: "Corrélation des menaces sur l'ensemble de votre infrastructure",
    cta: 'Voir le XDR',
    ctaLink: '/catalogue?cat=xdr',
    bg: 'linear-gradient(135deg, #0F0D2E 0%, #3730A3 50%, #6B21A8 100%)'
  }
];

function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative overflow-hidden" style={{ background: slide.bg }}>
      <div className="mx-auto max-w-7xl px-4 py-24 text-center transition-all">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Solutions SaaS B2B</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">{slide.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-200">{slide.subtitle}</p>
        <Link to={slide.ctaLink} className="mt-8 inline-block">
          <Button variant="primary" size="lg">{slide.cta}</Button>
        </Link>
      </div>

      <button
        onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
        aria-label="Précédent"
      >←</button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
        aria-label="Suivant"
      >→</button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition ${i === current ? 'bg-white' : 'bg-white/40'}`}
            aria-label={`Diapositive ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([catalogService.getCategories(), catalogService.getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods.filter((p) => p.available).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div>
      <Carousel />

      <section className="border-y border-gray-800 bg-gray-900 px-4 py-10">
        <p className="mx-auto max-w-2xl text-center text-gray-300">
          La cybersécurité entreprise, désormais accessible en ligne. Abonnez-vous en quelques minutes
          et sécurisez votre infrastructure dès aujourd'hui.
        </p>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Nos solutions de sécurité</h2>
            <Link to="/catalogue" className="text-sm text-blue-400 hover:underline">Voir tout →</Link>
          </div>
          {!loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalogue?cat=${cat.slug}`}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center transition hover:border-blue-700/60"
                >
                  <div className="text-3xl">{cat.icon}</div>
                  <h3 className="mt-3 font-semibold text-white">{cat.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-gray-800 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Les Top Produits du moment</h2>
            <Link to="/catalogue" className="text-sm text-blue-400 hover:underline">Voir le catalogue →</Link>
          </div>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} categoryIcon={categoryById[p.category_id]?.icon} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-gray-800 px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-white">Prêt à sécuriser votre entreprise ?</h2>
            <p className="mt-2 text-gray-400">Démarrez dès aujourd'hui.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/inscription"><Button variant="primary" size="lg">Créer un compte</Button></Link>
            <Link to="/contact"><Button variant="outline" size="lg">Nous contacter</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
