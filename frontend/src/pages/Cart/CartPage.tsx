import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { formatPrice } from "../../lib/utils";
import React from "react";

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
    navigate("/profil");
  };

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold">Votre panier est vide</h1>
        <p className="mt-2 text-muted-foreground">
          Découvrez nos solutions de cybersécurité.
        </p>
        <Link to="/catalogue" className="mt-6 inline-block">
          <Button>
            Voir le catalogue <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <header className="flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Panier ({items.length})</h1>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Liste des items */}
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-md border object-cover"
                    />
                  )}

                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.cycle === "monthly"
                        ? "Facturation mensuelle"
                        : "Facturation annuelle"}
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatPrice(
                        item.cycle === "yearly"
                          ? Math.round(item.priceMonthly * 12 * 0.83)
                          : item.priceMonthly
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Résumé */}
        <Card className="h-fit border-primary/30 p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-3xl font-bold">{formatPrice(total)}</span>
          </div>

          <Button fullWidth size="lg" className="mt-6" onClick={checkout}>
            Passer commande <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            onClick={clearCart}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-destructive"
          >
            — Vider le panier
          </button>
        </Card>
      </div>
    </div>
  );
}
