import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import Button from '../components/Button.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { catalogService } from '../services/api.js';
import { CATEGORY_ICONS, CATEGORY_FEATURES, CATEGORY_GRADIENTS } from '../constants/categories.js';

function ProductGallery({ categorySlug, icon, images }) {
  const [current, setCurrent] = useState(0);
  const hasRealImages = images && images.length > 0;
  const gradients = CATEGORY_GRADIENTS[categorySlug] || CATEGORY_GRADIENTS.soc;
  const slideCount = hasRealImages ? images.length : gradients.length;

  return (
    <div>
      {hasRealImages ? (
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-900">
          <img src={images[current]} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div
          className="flex aspect-square items-center justify-center rounded-2xl text-8xl transition-all"
          style={{ background: gradients[current] }}
        >
          {icon}
        </div>
      )}

      {slideCount > 1 && (
        <div className="mt-3 flex gap-3">
          {Array.from({ length: slideCount }).map((_, i) =>
            hasRealImages ? (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-16 w-16 overflow-hidden rounded-lg transition ${i === current ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
                aria-label={`Image ${i + 1}`}
              >
                <img src={images[i]} alt="" className="h-full w-full object-cover" />
              </button>
            ) : (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex h-16 w-16 items-center justify-center rounded-lg text-2xl transition ${i === current ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
                style={{ background: gradients[i] }}
                aria-label={`Illustration ${i + 1}`}
              >
                {icon}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    setBillingPeriod('monthly');

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
  const annualMonthlyEquivalent = Math.round((product.price_monthly * 10) / 12);
  const displayedPrice = billingPeriod === 'annual' ? annualMonthlyEquivalent : product.price_monthly;

  // Parsing des images stockées en JSON dans la base de données
let productImages = [];
try {
  if (Array.isArray(product.images)) {
    productImages = product.images;
  } else if (typeof product.images === 'string' && product.images.trim() !== '') {
    productImages = JSON.parse(product.images);
  }
  productImages = productImages.map((img) => (img.startsWith('/') ? img : `/${img}`));
} catch {
  productImages = [];
}

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price_monthly: product.price_monthly }, quantity, billingPeriod);
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
        <ProductGallery categorySlug={category?.slug} icon={icon} images={productImages} />

        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${product.available ? 'bg-green-950/50 text-green-400' : 'bg-red-950/50 text-red-400'}`}>
            {product.available ? '● Disponible immédiatement' : '● Service momentanément indisponible'}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white">{product.name}</h1>
          <p className="mt-4 text-gray-400">
            {product.description || `${product.name} fait partie de notre gamme ${category?.name || ''}, pensée pour protéger votre infrastructure au quotidien.`}
          </p>

          <div className="mt-6">
            <div className="inline-flex rounded-lg border border-gray-700 p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${billingPeriod === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                Annuel <span className="ml-1 text-xs text-green-400">−17%</span>
              </button>
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{displayedPrice} €</span>
              <span className="mb-1 text-gray-500">/ mois</span>
              {billingPeriod === 'annual' && (
                <span className="mb-1 text-sm text-gray-500">soit {product.price_monthly * 10} € / an, facturé en une fois</span>
              )}
            </div>
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