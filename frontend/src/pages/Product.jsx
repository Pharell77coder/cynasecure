import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import Button from '../components/Button.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { catalogService } from '../services/api.js';

const CATEGORY_FEATURES = {
  soc: ['Surveillance 24/7/365', 'Détection des menaces en temps réel', 'Réponse aux incidents < 15 min', 'Tableau de bord centralisé', 'Rapports mensuels détaillés', 'Support technique dédié'],
  edr: ['Protection multi-terminaux', 'IA comportementale avancée', 'Confinement automatique', 'Investigation forensique', 'Intégration SOC native', 'Support 24/7'],
  xdr: ['Corrélation multi-sources', 'SIEM intégré', 'Playbooks automatisés', 'API ouverte', 'SLA garanti 99.9%', 'Équipe dédiée']
};

const CATEGORY_ICONS = { soc: '🛡️', edr: '💻', xdr: '🔍' };

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    Promise.all([catalogService.getProduct(id), catalogService.getCategories(), catalogService.getProducts()])
      .then(([p, cats, allProducts]) => {
        setProduct(p);
        const cat = cats.find((c) => c.id === p.category_id);
        setCategory(cat);
        setSimilar(allProducts.filter((sp) => sp.id !== p.id && sp.category_id === p.category_id).slice(0, 3));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-center text-gray-400">Chargement...</div>;
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-white">Service introuvable</h1>
        <Link to="/catalogue" className="mt-6 inline-block">
          <Button variant="primary">Retour au catalogue</Button>
        </Link>
      </div>
    );
  }

  const icon = CATEGORY_ICONS[category?.slug] || '🔒';
  const features = CATEGORY_FEATURES[category?.slug] || [];

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price_monthly: product.price_monthly }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-8 flex gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-400">Accueil</Link><span>/</span>
        <Link to="/catalogue" className="hover:text-blue-400">Catalogue</Link><span>/</span>
        <span className="text-gray-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D0B3B] to-[#1E1B74] text-8xl">
          {icon}
        </div>

        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${product.available ? 'bg-green-950/50 text-green-400' : 'bg-red-950/50 text-red-400'}`}>
            {product.available ? '● Disponible immédiatement' : '● Service momentanément indisponible'}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white">{product.name}</h1>
          <p className="mt-4 text-gray-400">
            {product.description || `${product.name} fait partie de notre gamme ${category?.name || ''}, pensée pour protéger votre infrastructure au quotidien.`}
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{product.price_monthly} €</span>
            <span className="mb-1 text-gray-500">/ mois</span>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-gray-400">Nombre d'utilisateurs / appareils</label>
            <div className="flex w-fit items-center gap-4 rounded-lg border border-gray-700 px-4 py-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-gray-300 hover:text-white">−</button>
              <span className="w-6 text-center text-white">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="text-gray-300 hover:text-white">+</button>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {product.available ? (
              <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart}>
                {added ? '✓ Ajouté au panier !' : "S'ABONNER MAINTENANT"}
              </Button>
            ) : (
              <Button variant="primary" size="lg" fullWidth disabled>SERVICE INDISPONIBLE</Button>
            )}
          </div>
        </div>
      </div>

      {features.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-white">Caractéristiques techniques</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>{f}
              </div>
            ))}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-white">Services similaires</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {similar.map((p) => <ProductCard key={p.id} product={p} categoryIcon={icon} variant="grid" />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
