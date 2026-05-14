import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { apiFetch } from "../../api/apiFetch";
import { type Service } from "../../api/services";
import { cn } from "../../lib/utils";
import React from "react";

export default function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get("cat") ?? "all";

  const [active, setActive] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");

  const [typeFilter, setTypeFilter] = useState<"all" | "saas" | "one_shot">("all");

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Reset catégorie quand on change de type
  useEffect(() => {
    setActive("all");
    params.delete("cat");
    setParams(params, { replace: true });
  }, [typeFilter]);

  // 🔥 Charger les services selon le type (avec apiFetch)
  useEffect(() => {
    setLoading(true);

    const url =
      typeFilter === "all"
        ? "/api/services"
        : `/api/services?type=${typeFilter}`;

    apiFetch<Service[]>(url)
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  // 🔥 Extraire dynamiquement les catégories
  const categories = useMemo(() => {
    if (!Array.isArray(services)) return [];

    const map = new Map<string, string>();

    services.forEach((s) => {
      if (s.categorySlug) {
        map.set(s.categorySlug, s.category ?? "Sans catégorie");
      }
    });

    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [services]);

  // Mettre à jour la catégorie active depuis l’URL
  useEffect(() => {
    setActive(params.get("cat") ?? "all");
  }, [params]);

  // 🔥 Filtrage + recherche + tri
  const filtered = useMemo(() => {
    if (!Array.isArray(services)) return [];

    let list = [...services];

    if (active !== "all") {
      list = list.filter((s) => s.categorySlug === active);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      );
    }

    if (sort === "asc") list.sort((a, b) => a.priceMonthly - b.priceMonthly);
    if (sort === "desc") list.sort((a, b) => b.priceMonthly - a.priceMonthly);

    return list;
  }, [services, active, query, sort]);

  const setCat = (slug: string) => {
    setActive(slug);
    if (slug === "all") params.delete("cat");
    else params.set("cat", slug);
    setParams(params, { replace: true });
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold md:text-5xl">Catalogue des solutions</h1>
      <p className="mt-3 text-muted-foreground">
        Trouvez la protection adaptée à votre entreprise.
      </p>

      {/* Recherche + Tri */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Rechercher un service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-11 rounded-lg border border-border bg-input px-4 text-sm sm:w-56"
        >
          <option value="default">Tri par défaut</option>
          <option value="asc">Prix croissant</option>
          <option value="desc">Prix décroissant</option>
        </select>
      </div>

      {/* 🔥 Filtres SaaS / One‑shot */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTypeFilter("all")}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm transition-colors",
            typeFilter === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Tous les types
        </button>

        <button
          onClick={() => setTypeFilter("saas")}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm transition-colors",
            typeFilter === "saas"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Abonnements (SaaS)
        </button>

        <button
          onClick={() => setTypeFilter("one_shot")}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm transition-colors",
            typeFilter === "one_shot"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Produits (One‑shot)
        </button>
      </div>

      {/* Filtres catégories */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCat("all")}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm transition-colors",
            active === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Toutes catégories
        </button>

        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCat(c.slug)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm transition-colors",
              active === c.slug
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Liste des services */}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            Chargement…
          </p>
        )}

        {!loading &&
          filtered.map((s) => <ServiceCard key={s.id} service={s} />)}

        {!loading && filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            Aucun service trouvé.
          </p>
        )}
      </div>
    </div>
  );
}
