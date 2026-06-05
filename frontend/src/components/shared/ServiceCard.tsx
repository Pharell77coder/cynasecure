import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Check, Shield } from "lucide-react";
import { Card } from "../ui/Card";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../lib/utils";
import type { Service } from "../../api/services";
import { imageForCategory } from "../../lib/serviceImages";

export function ServiceCard({ service }: { service: Service }) {
  const { addToCart, has } = useCart();
  const inCart = has(service.id);
  const yearlyPrice = service.priceYearly ?? Math.round(service.priceMonthly * 12 * 0.83);

  return (
    <Card className="relative flex flex-col p-0 overflow-hidden group">

      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-gray-800 flex-shrink-0">
        {service.image ? (
          <img
            src={`/${service.image}`}
            alt={service.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : service.categorySlug ? (
          <img
            src={imageForCategory(service.categorySlug)}
            alt={service.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-gray-700" />
          </div>
        )}

        {/* Category tag */}
        {service.category && (
          <span className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-sm border border-gray-700 text-gray-400 text-[10px] font-mono tracking-widest px-2 py-0.5">
            {service.category.toUpperCase()}
          </span>
        )}

        {/* Badge */}
        {service.badge && (
          <span className="absolute top-3 right-3 border border-blue-500/40 bg-blue-500/20 text-blue-300 text-[10px] font-mono tracking-widest px-2 py-0.5 backdrop-blur-sm">
            {service.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-white text-base leading-tight">{service.name}</h3>

        <p className="mt-2 text-sm text-gray-400 line-clamp-2 flex-1">
          {service.description}
        </p>

        {/* Price */}
        <div className="mt-4">
          {service.type === "saas" && (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{formatPrice(service.priceMonthly)}</span>
                <span className="text-sm text-gray-400">/mois</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">ou {formatPrice(yearlyPrice)} / an</p>
            </>
          )}
          {service.type === "one_shot" && (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">{formatPrice(service.priceMonthly)}</span>
              <span className="text-sm text-gray-400">achat unique</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <Link
            to={`/services/${service.id}`}
            aria-label={`Voir le service ${service.name}`}
            className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 border border-gray-700 text-sm font-medium text-gray-300 hover:text-blue-400 hover:border-blue-500 transition-colors"
          >
            Découvrir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          {service.type === "saas" && (
            <Link
              to={`/services/${service.id}`}
              className="flex h-10 w-10 items-center justify-center bg-blue-600 hover:bg-blue-500 text-white transition-colors flex-shrink-0"
              tabIndex={-1}
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

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
              className={`flex h-10 w-10 items-center justify-center transition-colors flex-shrink-0 ${
                inCart
                  ? "bg-gray-800 text-gray-500 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
              aria-label="Ajouter au panier"
              disabled={inCart}
            >
              {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
