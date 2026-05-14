import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Zap, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CategoryCard } from "../../components/shared/CategoryCard";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { servicesApi, type Service } from "../../api/services";
import React from "react";

const stats = [
  { value: "500+", label: "Entreprises protégées" },
  { value: "99.9%", label: "Disponibilité SLA" },
  { value: "24/7", label: "SOC opérationnel" },
  { value: "<15min", label: "Temps de réponse" },
];

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les services depuis le backend (mock ou réel)
  useEffect(() => {
    setLoading(true);

    servicesApi
      .getAll()
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setServices([]); // 🔥 sécurité anti-crash
        }
      })
      .catch(() => setServices([])) // 🔥 sécurité anti-crash
      .finally(() => setLoading(false));
  }, []);

  // Extraire les catégories dynamiquement (corrigé + sécurisé)
  const categories = useMemo(() => {
    if (!Array.isArray(services)) return []; // 🔥 sécurité anti-crash

    const map = new Map<
      string,
      {
        slug: string;
        name: string;
        description: string;
        count: number;
        icon: any;
      }
    >();

    services.forEach((s) => {
      if (!map.has(s.categorySlug)) {
        map.set(s.categorySlug, {
          slug: s.categorySlug,
          name: s.category,
          description: s.description,
          count: 1,
          icon: Shield,
        });
      } else {
        map.get(s.categorySlug)!.count += 1;
      }
    });

    return Array.from(map.values());
  }, [services]);

  // Services populaires
  const popular = useMemo(() => {
    if (!Array.isArray(services)) return [];
    return services.filter((s) => s.badge).slice(0, 3);
  }, [services]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute right-0 top-0 hidden h-full w-1/2 opacity-20 lg:block">
          <Shield className="h-full w-full text-primary" strokeWidth={0.5} />
        </div>

        <div className="container relative grid gap-10 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" />
              Plateforme de cybersécurité B2B #1 en France
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-6xl">
              Protégez votre entreprise avec des{" "}
              <span className="text-gradient-primary">solutions de pointe</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-muted-foreground">
              SOC, EDR, XDR — souscrivez en ligne à nos services de cybersécurité managés.
              Déploiement instantané, protection immédiate.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogue">
                <Button size="lg">
                  Explorer le catalogue <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Demander une démo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container grid grid-cols-2 gap-4 pb-16 md:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Nos catégories de solutions</h2>
          <p className="mt-3 text-muted-foreground">
            Des solutions adaptées à chaque besoin de sécurité, de la protection endpoint au SOC managé.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {loading && (
            <p className="col-span-full text-center text-muted-foreground">
              Chargement…
            </p>
          )}

          {!loading &&
            categories.map((c) => (
              <CategoryCard key={c.slug} item={c} />
            ))}
        </div>
      </section>

      {/* Popular */}
      <section className="container py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Services populaires</h2>
          <p className="mt-3 text-muted-foreground">
            Les solutions les plus adoptées par nos clients entreprises.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="col-span-full text-center text-muted-foreground">
              Chargement…
            </p>
          )}

          {!loading &&
            popular.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>

        <div className="mt-10 text-center">
          <Link to="/catalogue">
            <Button variant="outline" size="lg">
              Voir tout le catalogue <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="border-primary/30 bg-surface-elevated p-12 text-center">
          <div className="mx-auto mb-6 flex justify-center gap-3">
            {[Lock, Zap, Shield].map((Icon, i) => (
              <div
                key={i}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10"
              >
                <Icon className="h-5 w-5 text-primary" />
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold md:text-4xl">
            Prêt à sécuriser votre infrastructure ?
          </h2>

          <p className="mt-3 text-muted-foreground">
            Essai gratuit 14 jours. Aucune carte bancaire requise. Déploiement en quelques minutes.
          </p>

          <Link to="/inscription" className="mt-6 inline-block">
            <Button size="lg">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>
    </>
  );
}
