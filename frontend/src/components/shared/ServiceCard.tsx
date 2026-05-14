import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Check } from "lucide-react";
import { Card } from "../ui/Card";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../lib/utils";
import React from "react";

// 🔥 On importe le type Service depuis l'API
import type { Service } from "../../api/services";

export function ServiceCard({ service }: { service: Service }) {
  const { addToCart, has } = useCart();
  const inCart = has(service.id);

  const monthlyPrice = service.priceMonthly;
  const yearlyPrice =
    service.priceYearly ?? Math.round(service.priceMonthly * 12 * 0.83);

  return (
    <Card className="relative flex flex-col p-5">
      {/* Badge */}
      {service.badge && (
        <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
          {service.badge}
        </span>
      )}

      {/* Image */}
      {service.image && (
        <img
          src={`/${service.image}`}
          alt={service.name}
          className="mb-4 h-32 w-full rounded-lg object-cover"
        />
      )}

      {/* Titre */}
      <h3 className="text-lg font-bold">{service.name}</h3>

      {/* Description */}
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {service.description}
      </p>

      {/* 🔥 Prix dynamique selon type */}
      <div className="mt-6">
        {service.type === "saas" && (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {formatPrice(monthlyPrice)}
              </span>
              <span className="text-sm text-muted-foreground">/mois</span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              ou {formatPrice(yearlyPrice)} / an
            </p>
          </>
        )}

        {service.type === "one_shot" && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              {formatPrice(monthlyPrice)}
            </span>
            <span className="text-sm text-muted-foreground">/achat</span>
          </div>
        )}
      </div>

      {/* 🔥 Actions dynamiques */}
      <div className="mt-6 flex items-center gap-2">
        {/* Découvrir */}
        <Link
          to={`/services/${service.id}`}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          Découvrir
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* 🔥 SaaS → pas de panier */}
        {service.type === "saas" && (
          <Link
            to={`/subscribe/${service.id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="S’abonner"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        {/* 🔥 One‑shot → bouton panier */}
        {service.type === "one_shot" && (
          <button
            onClick={() =>
              addToCart({
                id: service.id,
                name: service.name,
                description: service.description,
                priceMonthly: service.priceMonthly,
                cycle: "monthly",
                image: service.image ? `/${service.image}` : undefined,
              })
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
              inCart
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            aria-label="Ajouter au panier"
          >
            {inCart ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </Card>
  );
}
