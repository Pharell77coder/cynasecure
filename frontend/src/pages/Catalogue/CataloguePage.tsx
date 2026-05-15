import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  List,
  Filter,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { apiFetch } from "../../api/apiFetch";
import { type Service } from "../../api/services";
import { cn } from "../../lib/utils";
import React from "react";

/* ─── Types ────────────────────────────────────────────────────────────── */
type SortMode = "default" | "asc" | "desc";
type TypeFilter = "all" | "saas" | "one_shot";
type ViewMode = "grid" | "list";

/* ─── Constantes ───────────────────────────────────────────────────────── */
const SORT_LABELS: Record<SortMode, string> = {
  default: "Pertinence",
  asc: "Prix croissant",
  desc: "Prix décroissant",
};

const TYPE_OPTIONS: { value: TypeFilter; label: string; tag: string }[] = [
  { value: "all", label: "Tous les types", tag: "ALL" },
  { value: "saas", label: "Abonnements SaaS", tag: "SaaS" },
  { value: "one_shot", label: "Produits One-shot", tag: "ONE" },
];

/* ─── Skeleton card ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 animate-pulse">
      <div className="h-3 w-20 bg-gray-800 mb-4" />
      <div className="h-5 w-3/4 bg-gray-800 mb-2" />
      <div className="h-3 w-full bg-gray-800 mb-1" />
      <div className="h-3 w-2/3 bg-gray-800 mb-6" />
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-gray-800" />
        <div className="h-8 w-28 bg-gray-800" />
      </div>
    </div>
  );
}

/* ─── Sort dropdown ────────────────────────────────────────────────────── */
function SortDropdown({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600 hover:text-white px-4 py-2.5 text-xs font-mono tracking-wide transition-colors"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        {SORT_LABELS[value]}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] border border-gray-700 bg-gray-900 shadow-xl">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { onChange(mode); setOpen(false); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-xs font-mono tracking-wide transition-colors",
                value === mode
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              {SORT_LABELS[mode]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get("cat") ?? "all";

  const [active, setActive] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Reset catégorie quand on change de type ── */
  useEffect(() => {
    setActive("all");
    params.delete("cat");
    setParams(params, { replace: true });
  }, [typeFilter]);

  /* ── Fetch services ── */
  useEffect(() => {
    setLoading(true);
    const url = typeFilter === "all" ? "/api/services" : `/api/services?type=${typeFilter}`;
    apiFetch<Service[]>(url)
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  /* ── Catégories dynamiques ── */
  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    services.forEach((s) => {
      if (!s.categorySlug) return;
      const cur = map.get(s.categorySlug);
      map.set(s.categorySlug, {
        name: s.category ?? "Sans catégorie",
        count: cur ? cur.count + 1 : 1,
      });
    });
    return Array.from(map.entries()).map(([slug, v]) => ({ slug, ...v }));
  }, [services]);

  /* ── Sync URL ── */
  useEffect(() => {
    setActive(params.get("cat") ?? "all");
  }, [params]);

  /* ── Filtrage + tri ── */
  const filtered = useMemo(() => {
    let list = [...services];
    if (active !== "all") list = list.filter((s) => s.categorySlug === active);
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

  const resetAll = () => {
    setActive("all");
    setQuery("");
    setSort("default");
    setTypeFilter("all");
    params.delete("cat");
    setParams(params, { replace: true });
  };

  const hasFilters = active !== "all" || query.trim() !== "" || sort !== "default" || typeFilter !== "all";

  /* ── Compte par catégorie dans les résultats filtrés (hors cat filter) ── */
  const countForCat = (slug: string) => {
    return services.filter((s) => {
      const matchType = typeFilter === "all" || s.type === typeFilter;
      const matchQuery = !query.trim() || s.name.toLowerCase().includes(query.toLowerCase());
      const matchCat = slug === "all" || s.categorySlug === slug;
      return matchType && matchQuery && matchCat;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── Header de page ─────────────────────────────────────────────── */}
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="container py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-xs text-gray-600 mb-6">
            <span>Accueil</span>
            <span>/</span>
            <span className="text-blue-500">Catalogue</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">
                SOLUTIONS DE SÉCURITÉ
              </div>
              <h1
                className="text-white font-black leading-none tracking-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em" }}
              >
                Catalogue des solutions
              </h1>
              <p className="mt-3 text-gray-500 text-sm max-w-xl leading-relaxed">
                {loading
                  ? "Chargement…"
                  : `${services.length} solutions disponibles — XDR, CSPM, Zero Trust, NDR, Audit et plus.`}
              </p>
            </div>

            {/* Barre de recherche principale */}
            <div className="w-full lg:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher une solution..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800 bg-gray-900 sticky top-0 z-30">
        <div className="container flex items-center justify-between gap-4 py-3">

          {/* Filtres type — inline */}
          <div className="flex items-center gap-1">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono tracking-widest transition-colors border",
                  typeFilter === opt.value
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600"
                )}
              >
                {opt.tag}
              </button>
            ))}
          </div>

          {/* Droite : résultats + sort + view */}
          <div className="flex items-center gap-3">
            {/* Compteur */}
            <span className="text-gray-600 text-xs font-mono hidden sm:block">
              {loading ? "…" : `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""}`}
            </span>

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-2 py-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                Réinitialiser
              </button>
            )}

            {/* Sort */}
            <SortDropdown value={sort} onChange={setSort} />

            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-xs font-mono tracking-wide border transition-colors",
                sidebarOpen
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                  : "border-gray-700 text-gray-500 hover:text-gray-300"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtres</span>
            </button>

            {/* View mode */}
            <div className="flex border border-gray-700">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-2.5 py-2.5 transition-colors",
                  viewMode === "grid" ? "bg-gray-700 text-white" : "text-gray-600 hover:text-gray-400"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2.5 py-2.5 border-l border-gray-700 transition-colors",
                  viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-600 hover:text-gray-400"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Corps principal : sidebar + grille ─────────────────────────── */}
      <div className="container py-10">
        <div className={cn("flex gap-8", !sidebarOpen && "block")}>

          {/* ── Sidebar catégories ─────────────────────────────────────── */}
          {sidebarOpen && (
            <aside className="w-56 flex-shrink-0">
              <div className="sticky top-20 space-y-1">
                <div className="text-gray-600 font-mono text-[10px] tracking-widest px-2 mb-3">
                  CATÉGORIES
                </div>

                {/* Toutes */}
                <button
                  onClick={() => setCat("all")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors border-l-2",
                    active === "all"
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                  )}
                >
                  <span className="font-mono text-xs tracking-wide">Toutes catégories</span>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-sm",
                    active === "all" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"
                  )}>
                    {countForCat("all")}
                  </span>
                </button>

                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCat(c.slug)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors border-l-2",
                      active === c.slug
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                    )}
                  >
                    <span className="font-mono text-xs tracking-wide truncate text-left">{c.name}</span>
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded-sm flex-shrink-0 ml-2",
                      active === c.slug ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"
                    )}>
                      {countForCat(c.slug)}
                    </span>
                  </button>
                ))}

                {/* Séparateur */}
                <div className="pt-6 border-t border-gray-800 mt-4">
                  <div className="text-gray-600 font-mono text-[10px] tracking-widest px-2 mb-3">
                    TYPE
                  </div>
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTypeFilter(opt.value)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono tracking-wide transition-colors border-l-2",
                        typeFilter === opt.value
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0",
                          typeFilter === opt.value ? "bg-blue-400" : "bg-gray-700"
                        )}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* CTA compact */}
                <div className="pt-6 mt-4 border-t border-gray-800 px-3">
                  <div className="bg-blue-600/10 border border-blue-500/20 p-4">
                    <Zap className="h-4 w-4 text-blue-500 mb-2" />
                    <p className="text-white text-xs font-semibold mb-1">Besoin d'un conseil ?</p>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">
                      Un expert vous oriente vers la bonne solution.
                    </p>
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-1 text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors"
                    >
                      Contacter →
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* ── Grille de services ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Filtres actifs — pills */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-gray-800">
                <span className="text-gray-600 text-xs font-mono">Filtres actifs :</span>

                {active !== "all" && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    {categories.find((c) => c.slug === active)?.name ?? active}
                    <button onClick={() => setCat("all")} className="hover:text-white">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {typeFilter !== "all" && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
                    <button onClick={() => setTypeFilter("all")} className="hover:text-white">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {query && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    "{query}"
                    <button onClick={() => setQuery("")} className="hover:text-white">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {sort !== "default" && (
                  <span className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-400 text-xs font-mono px-2 py-1">
                    {SORT_LABELS[sort]}
                    <button onClick={() => setSort("default")} className="hover:text-white">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Grille / liste */}
            <div
              className={cn(
                "gap-px",
                viewMode === "grid"
                  ? "grid md:grid-cols-2 xl:grid-cols-3 bg-gray-800"
                  : "flex flex-col divide-y divide-gray-800"
              )}
            >
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}

              {!loading &&
                filtered.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "bg-gray-950",
                      viewMode === "list" && "hover:bg-gray-900 transition-colors"
                    )}
                  >
                    <ServiceCard service={s} />
                  </div>
                ))}
            </div>

            {/* État vide */}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="border border-gray-800 p-6 mb-6">
                  <Search className="h-8 w-8 text-gray-700 mx-auto" />
                </div>
                <p className="text-white font-semibold mb-2">Aucune solution trouvée</p>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                  Essayez d'élargir vos critères ou de réinitialiser les filtres.
                </p>
                <button
                  onClick={resetAll}
                  className="flex items-center gap-2 text-xs font-mono text-blue-400 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Réinitialiser tous les filtres
                </button>
              </div>
            )}

            {/* Footer de grille */}
            {!loading && filtered.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
                <span className="text-gray-600 text-xs font-mono">
                  {filtered.length} solution{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}
                </span>
                <a
                  href="/contact"
                  className="text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors"
                >
                  Solution manquante ? Contactez-nous →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}