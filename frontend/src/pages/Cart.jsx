import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const Cart = () => {
  const { cart, cartTotal, unitPriceFor, updateQuantity, updateBillingPeriod, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <span className="text-4xl">🛒</span>
        <h2 className="mt-4 text-xl font-bold text-white">Votre panier est vide</h2>
        <p className="mt-2 text-gray-400">Découvrez nos solutions de sécurité SaaS</p>
        <Link to="/catalogue" className="mt-6 inline-block">
          <Button variant="primary" size="lg">Voir le catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">Mon panier</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {cart.map((item) => {
            const unitPrice = unitPriceFor(item);
            return (
              <div key={`${item.id}-${item.billing_period}`} className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                  {item.name.includes('SOC') ? '🛡️' : item.name.includes('EDR') ? '💻' : '🔍'}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.name}</h3>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <select
                      value={item.billing_period}
                      onChange={(e) => updateBillingPeriod(item.id, item.billing_period, e.target.value)}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:outline-none"
                    >
                      <option value="monthly">Mensuel</option>
                      <option value="annual">Annuel (−17%)</option>
                    </select>

                    <div className="flex items-center gap-3 rounded-lg border border-gray-700 px-3 py-1">
                      <span className="text-sm text-gray-500">Utilisateurs</span>
                      <button onClick={() => updateQuantity(item.id, item.billing_period, item.quantity - 1)} className="text-gray-300 hover:text-white">−</button>
                      <span className="text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.billing_period, item.quantity + 1)} className="text-gray-300 hover:text-white">+</button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {item.billing_period === 'annual' ? `${unitPrice} € / an` : `${unitPrice} € / mois`}
                  </p>
                  <p className="font-semibold text-white">{unitPrice * item.quantity} €</p>
                  <button onClick={() => removeFromCart(item.id, item.billing_period)} className="mt-1 text-xs text-red-400 hover:underline" aria-label="Supprimer">
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Récapitulatif</h2>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Sous-total</span><span>{cartTotal} €</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-400">
            <span>TVA (20%)</span><span>{Math.round(cartTotal * 0.2)} €</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-800 pt-4 font-semibold text-white">
            <span>Total TTC</span><span>{Math.round(cartTotal * 1.2)} €</span>
          </div>

          {!user && (
            <div className="mt-4 rounded-lg border border-blue-800/40 bg-blue-950/30 p-3 text-xs text-blue-300">
              💡 <Link to="/connexion" className="underline">Connectez-vous</Link> pour finaliser votre commande.
            </div>
          )}

          <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={() => navigate(user ? '/checkout' : '/connexion')}>
            Passer à la caisse →
          </Button>
          <Link to="/catalogue" className="mt-4 block text-center text-sm text-gray-400 hover:text-blue-400">
            ← Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
