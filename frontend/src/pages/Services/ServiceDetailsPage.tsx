import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Check, X, ShoppingCart, ArrowLeft, Sparkles } from "lucide-react";
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
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Chargement du service…</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Service introuvable.</p>
        <Link to="/catalogue">
          <Button className="mt-4" variant="outline">
            Retour
          </Button>
        </Link>
      </div>
    );
  }

  // 🔥 Correction : image depuis /public
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
    <div className="container py-10">
      <Link
        to="/catalogue"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Colonne gauche */}
        <div>
          <img
            src={imageSrc}
            alt={service.name}
            className="w-full rounded-xl border border-border object-cover"
          />

          <Card className="mt-6 p-6">
            <h3 className="text-lg font-bold">Fonctionnalités</h3>

            <ul className="mt-4 space-y-2">
              {service.features?.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {f.included ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}

                  <span
                    className={
                      f.included
                        ? "text-foreground"
                        : "text-muted-foreground line-through"
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
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {service.category}
          </span>

          <h1 className="mt-4 text-4xl font-bold">{service.name}</h1>

          <p className="mt-3 text-muted-foreground">
            {service.longDescription}
          </p>

          {/* 🔥 Pricing dynamique selon type */}
          {service.type === "saas" && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold">
                Choisissez votre formule
              </p>

              <div className="flex gap-3">
                <Button
                  variant={cycle === "monthly" ? "primary" : "outline"}
                  onClick={() => setCycle("monthly")}
                >
                  Mensuel
                </Button>
                <Button
                  variant={cycle === "yearly" ? "primary" : "outline"}
                  onClick={() => setCycle("yearly")}
                >
                  Annuel
                </Button>
              </div>

              <p className="mt-4 text-3xl font-bold">
                {cycle === "monthly"
                  ? `${service.priceMonthly}€/mois`
                  : `${yearlyPrice}€/an`}
              </p>
            </div>
          )}

          {service.type === "one_shot" && (
            <div className="mt-8">
              <p className="text-3xl font-bold">
                {service.priceMonthly}€
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Paiement unique
              </p>
            </div>
          )}

          {/* 🔥 Boutons dynamiques */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {/* One‑shot → Ajouter au panier */}
            {service.type === "one_shot" && (
              <Button
                size="lg"
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

            {/* SaaS → S’abonner */}
            {service.type === "saas" && (
              <Button
                size="lg"
                variant="outline"
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
        <section className="mt-20">
          <h2 className="text-2xl font-bold">Services similaires</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {similar.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
