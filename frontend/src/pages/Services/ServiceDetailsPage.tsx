import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  Cpu,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { useCart } from "../../hooks/useCart";
import { toast } from "../../hooks/useToast";
import { servicesApi, type Service } from "../../api/services";
import { subscriptionsApi } from "../../api/subscriptions";
import type { BillingCycle } from "../../context/CartContext";
import React from "react";

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [similar, setSimilar] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    servicesApi
      .getById(id)
      .then((data) => {
        setService(data);

        servicesApi.getAll().then((all) => {
          const filtered = all
            .filter(
              (s) =>
                s.categorySlug === data.categorySlug && s.id !== data.id
            )
            .slice(0, 3);

          setSimilar(filtered);
        });
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 text-center text-gray-400">
        Chargement du service…
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-500">Service introuvable.</p>
        <Link to="/catalogue">
          <Button className="mt-4" variant="outline">
            Retour
          </Button>
        </Link>
      </div>
    );
  }

  const imageSrc = service.image ? `/${service.image}` : "";
  const yearlyPrice =
    service.priceYearly ?? Math.round(service.priceMonthly * 12 * 0.85);

  const handleSubscribe = async () => {
    try {
      await subscriptionsApi.create(Number(service.id), cycle);
      toast("Abonnement créé avec succès", "success");
      navigate("/mes-abonnements");
    } catch (err: any) {
      toast(err.message || "Erreur lors de l’abonnement", "error");
    }
  };

  return (
    <div className="relative">

      {/* Glow bleu */}
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] opacity-10 pointer-events-none"
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

      <div className="container py-16 relative z-10">

        {/* Retour */}
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au catalogue
        </Link>

        {/* HEADER */}
        <div className="mt-10 grid gap-16 lg:grid-cols-2">

          {/* Colonne gauche */}
          <div>
            <img
              src={imageSrc}
              alt={service.name}
              className="w-full rounded-none border border-gray-800 object-cover"
            />

            <Card className="mt-8 bg-gray-900 border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                Fonctionnalités
              </h3>

              <ul className="mt-6 space-y-3">
                {service.features?.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 text-blue-400" />
                    ) : (
                      <X className="h-4 w-4 text-gray-600" />
                    )}

                    <span
                      className={
                        f.included
                          ? "text-gray-200"
                          : "text-gray-600 line-through"
                      }
                    >
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Colonne droite */}
          <div>
            <span className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 px-3 py-1 text-xs font-mono tracking-widest">
              <Shield className="h-3 w-3" />
              {service.category?.toUpperCase()}
            </span>

            <h1 className="mt-4 text-5xl font-black text-white tracking-tight">
              {service.name}
            </h1>

            <p className="mt-4 text-gray-400 leading-relaxed">
              {service.longDescription}
            </p>

            {/* Pricing */}
            {service.type === "saas" && (
              <div className="mt-10">
                <p className="text-sm font-semibold text-gray-300">
                  Choisissez votre formule
                </p>

                <div className="flex gap-3 mt-3">
                  <Button
                    variant={cycle === "monthly" ? "primary" : "outline"}
                    onClick={() => setCycle("monthly")}
                    className="rounded-none"
                  >
                    Mensuel
                  </Button>
                  <Button
                    variant={cycle === "yearly" ? "primary" : "outline"}
                    onClick={() => setCycle("yearly")}
                    className="rounded-none"
                  >
                    Annuel
                  </Button>
                </div>

                <p className="mt-6 text-4xl font-black text-white">
                  {cycle === "monthly"
                    ? `${service.priceMonthly}€/mois`
                    : `${yearlyPrice}€/an`}
                </p>
              </div>
            )}

            {service.type === "one_shot" && (
              <div className="mt-10">
                <p className="text-4xl font-black text-white">
                  {service.priceMonthly}€
                </p>
                <p className="text-sm text-gray-500 mt-1">Paiement unique</p>
              </div>
            )}

            {/* Boutons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">

              {/* One-shot */}
              {service.type === "one_shot" && (
                <Button
                  size="lg"
                  className="rounded-none"
                  fullWidth
                  onClick={() => {
                    addToCart({
                      id: service.id,
                      name: service.name,
                      description: service.description,
                      priceMonthly: service.priceMonthly,
                      cycle: "monthly",
                      image: imageSrc,
                    });
                    toast(`${service.name} ajouté au panier`, "success");
                  }}
                >
                  <ShoppingCart className="h-4 w-4" /> Ajouter au panier
                </Button>
              )}

              {/* SaaS */}
              {service.type === "saas" && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none"
                  fullWidth
                  onClick={handleSubscribe}
                >
                  <Sparkles className="h-4 w-4" /> S’abonner maintenant
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Services similaires */}
        {similar.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Services similaires
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {similar.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
