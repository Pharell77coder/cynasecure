import { Link } from 'react-router-dom';
import Button from './Button';

const CATEGORY_ICONS = { soc: '🛡️', edr: '💻', xdr: '🔍' };

/**
 * Carte produit SaaS (accueil, catalogue, recherche).
 * @param {object} product - { id, name, price_monthly, available, category_id }
 * @param {string} categoryIcon - emoji déjà résolu (évite de refaire le lookup à chaque carte)
 * @param {string} variant - 'grid' | 'list'
 */
const ProductCard = ({ product, categoryIcon, variant = 'grid' }) => {
  const { id, name, price_monthly, available = true } = product;
  const icon = categoryIcon || CATEGORY_ICONS[product.categorySlug] || '🔒';

  return (
    <Link
      to={`/produits/${id}`}
      className={`group flex rounded-xl border border-gray-800 bg-gray-900 transition hover:border-blue-700/60 ${
        variant === 'list' ? 'items-center gap-4 p-4' : 'flex-col p-6'
      } ${!available ? 'opacity-60' : ''}`}
    >
      <div className={`flex items-center justify-center rounded-lg bg-gray-800 text-3xl ${variant === 'list' ? 'h-16 w-16 shrink-0' : 'mb-4 h-20 w-20 self-start'}`}>
        {icon}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="font-semibold text-white">{name}</h3>
        {!available && (
          <span className="mt-1 w-fit rounded border border-red-800/40 bg-red-950/50 px-2 py-0.5 text-xs text-red-400">
            Stock épuisé
          </span>
        )}
        <div className="mt-2">
          {available ? (
            <>
              <span className="text-xl font-bold text-white">{price_monthly} €</span>
              <span className="text-sm text-gray-500"> / mois</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Indisponible</span>
          )}
        </div>

        {variant === 'list' && (
          <div className="mt-3">
            <Button variant="primary" size="sm">Voir le service</Button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
