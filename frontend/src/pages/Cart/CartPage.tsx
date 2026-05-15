import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
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

  /* ─────────────────────────────────────────────── */
  /* PANIER VIDE                                     */
  /* ─────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center text-center">

        {/* Glow bleu */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
          }}
        />

        {/* Grille technique */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10">
          <ShoppingCart className="mx-auto h-14 w-14 text-gray-500" />

          <h1 className="mt-6 text-3xl font-black text-white">
            Votre panier est vide
          </h1>

          <p className="mt-2 text-gray-400">
            Explorez nos solutions de cybersécurité avancées.
          </p>

          <Link to="/catalogue" className="mt-6 inline-block">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-500 rounded-none">
              Voir le catalogue <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────── */
  /* PANIER AVEC ARTICLES                            */
  /* ─────────────────────────────────────────────── */
  return (
    <div className="relative container py-16">

      {/* Glow bleu */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 mb-10">
        <ShoppingCart className="h-6 w-6 text-blue-500" />
        <h1 className="text-3xl font-black text-white tracking-tight">
          Panier ({items.length})
        </h1>
      </header>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_360px]">

        {/* Liste des items */}
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="p-5 bg-gray-900 border-gray-800 rounded-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 border border-gray-800 object-cover"
                    />
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.cycle === "monthly"
                        ? "Facturation mensuelle"
                        : "Facturation annuelle"}
                    </p>

                    <p className="mt-1 text-xl font-black text-white">
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
                  className="text-gray-500 hover:text-red-500 transition"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Résumé */}
        <Card className="h-fit p-6 bg-gray-900 border border-blue-500/20 rounded-none">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-400">Total</span>
            <span className="text-4xl font-black text-white">
              {formatPrice(total)}
            </span>
          </div>

          <Button
            fullWidth
            size="lg"
            className="mt-6 bg-blue-600 hover:bg-blue-500 rounded-none"
            onClick={checkout}
          >
            Passer commande <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            onClick={clearCart}
            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-red-500 transition"
          >
            — Vider le panier
          </button>
        </Card>
      </div>
    </div>
  );
}
