import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, Package, Lock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { formatPrice } from "../../lib/utils";

export default function CartPage() {
  const { items, removeFromCart, clearCart, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const checkout = () => {
    if (!isAuthenticated) {
      toast("Connectez-vous pour passer commande", "error");
      navigate("/connexion");
      return;
    }
    toast("Commande passée avec succès !", "success");
    clearCart();
    navigate("/dashboard");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="border border-gray-800 bg-gray-900 p-8 mb-6">
          <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-white">Votre panier est vide</h1>
        <p className="mt-2 text-gray-500 text-sm max-w-xs">
          Ajoutez des solutions de cybersécurité depuis notre catalogue.
        </p>
        <Link to="/catalogue" className="mt-6">
          <Button className="gap-2">
            Voir le catalogue <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-5 w-5 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">
          Panier
          <span className="ml-2 text-gray-500 font-normal text-base">
            {items.length} article{items.length > 1 ? "s" : ""}
          </span>
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 object-cover border border-gray-800 flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Paiement unique · Licence perpétuelle</p>
              </div>

              <p className="text-lg font-bold text-white flex-shrink-0">
                {formatPrice(item.priceMonthly)}
              </p>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside>
          <div className="border border-gray-800 bg-gray-900 p-6 sticky top-24">
            <h2 className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-5">
              Récapitulatif
            </h2>

            <div className="space-y-2.5 pb-5 border-b border-gray-800 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400 truncate mr-2">{item.name}</span>
                  <span className="text-gray-300 flex-shrink-0">{formatPrice(item.priceMonthly)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-gray-400 text-sm">Total TTC</span>
              <span className="text-3xl font-black text-white">{formatPrice(total)}</span>
            </div>

            <Button fullWidth size="lg" onClick={checkout} className="gap-2">
              Commander <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              onClick={clearCart}
              className="mt-4 w-full text-xs text-gray-600 hover:text-red-400 transition-colors text-center py-1"
            >
              Vider le panier
            </button>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
              <Lock className="h-3 w-3" />
              Paiement sécurisé · Support inclus
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
