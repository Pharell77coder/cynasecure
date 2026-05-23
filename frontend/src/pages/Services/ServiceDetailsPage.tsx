import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Check, X, ShoppingCart, ArrowLeft, Sparkles, Shield, Layers, Lock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { servicesApi, type Service } from "../../api/services";
import type { BillingCycle } from "../../context/CartContext";

function Skeleton() {
  return (
    <div className="container py-16 animate-pulse">
      <div className="h-4 w-32 bg-gray-800 mb-10" />
      <div className="grid gap-16 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="h-72 bg-gray-800" />
          <div className="h-52 bg-gray-800" />
        </div>
        <div className="space-y-5">
          <div className="h-5 w-24 bg-gray-800" />
          <div className="h-10 w-3/4 bg-gray-800" />
          <div className="h-20 bg-gray-800" />
          <div className="h-28 bg-gray-800" />
          <div className="h-12 bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth() as { isAuthenticated: boolean };
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [similar, setSimilar] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    servicesApi.getById(id).then((data) => {
      setService(data);
      servicesApi.getAll().then((all) => {
        setSimilar(all.filter((s) => s.categorySlug === data.categorySlug && s.id !== data.id).slice(0, 3));
      });
    })
    .catch(() => setService(null))
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton />;

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-500 mb-4">Service introuvable.</p>
        <Link to="/catalogue"><Button variant="outline">Retour au catalogue</Button></Link>
      </div>
    );
  }

  const imageSrc = service.image ? `/${service.image}` : "";
  const yearlyPrice = service.priceYearly ?? Math.round(service.priceMonthly * 12 * 0.85);
  const yearlySaving = Math.round(service.priceMonthly * 12 - yearlyPrice);

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast("Connectez-vous pour vous abonner", "error");
      navigate("/connexion");
      return;
    }
    addToCart({
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      priceMonthly: service.priceMonthly,
      cycle,
      image: imageSrc || undefined,
    });
    navigate("/checkout");
  };

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-10"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
      />

      <div className="container py-12 relative">

        {/* Breadcrumb */}
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Link>

        <div className="grid gap-14 lg:grid-cols-2">

          {/* Left — image + features */}
          <div>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={service.name}
                className="w-full border border-gray-800 object-cover aspect-video"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center">
                <Shield className="h-16 w-16 text-gray-700" />
              </div>
            )}

            {service.features && service.features.length > 0 && (
              <div className="mt-6 border border-gray-800 bg-gray-900 p-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
                  <Layers className="h-4 w-4 text-blue-500" />
                  Fonctionnalités incluses
                </h3>
                <ul className="space-y-2.5">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {f.included
                        ? <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        : <X className="h-4 w-4 text-gray-700 flex-shrink-0" />}
                      <span className={f.included ? "text-gray-200" : "text-gray-600 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — info + pricing + CTA */}
          <div>
            <span className="inline-flex items-center gap-1.5 border border-blue-500/30 bg-blue-500/10 text-blue-400 px-3 py-1 text-[11px] font-mono tracking-widest">
              <Shield className="h-3 w-3" />
              {service.category?.toUpperCase()}
            </span>

            {service.badge && (
              <span className="ml-2 inline-flex items-center border border-amber-500/30 bg-amber-500/10 text-amber-400 px-2.5 py-1 text-[11px] font-mono tracking-widest">
                {service.badge}
              </span>
            )}

            <h1 className="mt-4 text-4xl font-black text-white tracking-tight leading-tight">
              {service.name}
            </h1>

            <p className="mt-4 text-gray-400 leading-relaxed text-sm">
              {service.longDescription || service.description}
            </p>

            {/* SaaS pricing */}
            {service.type === "saas" && (
              <div className="mt-8">
                <p className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-3">
                  Choisissez votre formule
                </p>

                <div className="flex border border-gray-700">
                  <button
                    onClick={() => setCycle("monthly")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                      cycle === "monthly"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    onClick={() => setCycle("yearly")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-l border-gray-700 ${
                      cycle === "yearly"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Annuel
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      −17%
                    </span>
                  </button>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      {cycle === "monthly" ? service.priceMonthly : yearlyPrice}€
                    </span>
                    <span className="text-gray-500 text-sm">
                      /{cycle === "monthly" ? "mois" : "an"}
                    </span>
                  </div>
                  {cycle === "yearly" && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Économie de {yearlySaving} € vs mensuel
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* One-shot pricing */}
            {service.type === "one_shot" && (
              <div className="mt-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{service.priceMonthly}€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Paiement unique · Licence perpétuelle</p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3">
              {service.type === "one_shot" && (
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast("Connectez-vous pour passer commande", "error");
                      navigate("/connexion");
                      return;
                    }
                    addToCart({
                      id: service.id,
                      name: service.name,
                      description: service.description ?? "",
                      priceMonthly: service.priceMonthly,
                      cycle: "monthly",
                      image: imageSrc || undefined,
                    });
                    navigate("/checkout");
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Commander maintenant
                </Button>
              )}

              {service.type === "saas" && (
                <Button size="lg" fullWidth onClick={handleSubscribe}>
                  <Sparkles className="h-4 w-4" />
                  S'abonner maintenant
                </Button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600 mt-1">
                <Lock className="h-3 w-3" />
                Paiement sécurisé · Résiliable à tout moment
              </div>
            </div>
          </div>
        </div>

        {/* Similar services */}
        {similar.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">Services similaires</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {similar.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
