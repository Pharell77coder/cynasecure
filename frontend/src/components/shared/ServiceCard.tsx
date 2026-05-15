import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Check } from "lucide-react";
import { Card } from "../ui/Card";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../lib/utils";
import React from "react";
import type { Service } from "../../api/services";

export function ServiceCard({ service }: { service: Service }) {
  const { addToCart, has } = useCart();
  const inCart = has(service.id);

  const monthlyPrice = service.priceMonthly;
  const yearlyPrice =
    service.priceYearly ?? Math.round(service.priceMonthly * 12 * 0.83);

  return (
    <Card className="relative flex flex-col bg-gray-900 border border-gray-800 p-5 rounded-none hover:bg-gray-800 transition">

      {/* Badge */}
      {service.badge && (
        <span className="absolute -top-3 right-4 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px] font-mono tracking-widest px-3 py-1">
          {service.badge}
        </span>
      )}

      {/* Image */}
      {service.image && (
        <img
          src={`/${service.image}`}
          alt={service.name}
          className="mb-4 h-32 w-full border border-gray-800 object-cover"
        />
      )}

      {/* Titre */}
      <h3 className="text-lg font-bold text-white">{service.name}</h3>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-400 line-clamp-2">
        {service.description}
      </p>

      {/* Prix */}
      <div className="mt-6">
        {service.type === "saas" && (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">
                {formatPrice(monthlyPrice)}
              </span>
              <span className="text-sm text-gray-500">/mois</span>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              ou {formatPrice(yearlyPrice)} / an
            </p>
          </>
        )}

        {service.type === "one_shot" && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {formatPrice(monthlyPrice)}
            </span>
            <span className="text-sm text-gray-500">/achat</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-2">

        {/* Découvrir */}
        <Link
          to={`/services/${service.id}`}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-gray-700 text-sm font-semibold text-gray-300 hover:text-blue-400 hover:border-blue-500 transition rounded-none"
        >
          Découvrir
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* SaaS → bouton abonnement */}
        {service.type === "saas" && (
          <Link
            to={`/subscribe/${service.id}`}
            className="flex h-11 w-11 items-center justify-center bg-blue-600 hover:bg-blue-500 text-white transition rounded-none"
            aria-label="S’abonner"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        {/* One‑shot → bouton panier */}
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
            className={`flex h-11 w-11 items-center justify-center transition rounded-none ${
              inCart
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
            aria-label="Ajouter au panier"
          >
            {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        )}
      </div>
    </Card>
  );
}
