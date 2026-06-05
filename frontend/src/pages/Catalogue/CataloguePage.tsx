import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  List,
  Filter,
  Zap,
  RefreshCw,
} from "lucide-react";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { servicesApi, type Service, type SearchCriteria } from "../../api/services";
import { toast } from "../../hooks/useToast";
import { cn } from "../../lib/utils";
import { PageTransition } from "../../components/ui/PageTransition";
import { FadeIn } from "../../components/ui/FadeIn";
import { useTranslation } from "react-i18next";
import React from "react";

/* Types */
type SortMode = "relevance" | "price_asc" | "price_desc" | "newest";
type TypeFilter = "all" | "saas" | "one_shot";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 9;

function validSort(v: string | null): SortMode {
  return (["relevance", "price_asc", "price_desc", "newest"] as SortMode[]).includes(v as SortMode)
    ? (v as SortMode)
    : "relevance";
}
function validType(v: string | null): TypeFilter {
  return (["all", "saas", "one_shot"] as TypeFilter[]).includes(v as TypeFilter)
    ? (v as TypeFilter)
    : "all";
}

/* Skeleton card */
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

/* Sort dropdown */
function SortDropdown({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const SORT_LABELS: Record<SortMode, string> = {
    relevance: t("catalogue.sortRelevance"),
    price_asc: t("catalogue.sortPriceAsc"),
    price_desc: t("catalogue.sortPriceDesc"),
    newest: t("catalogue.sortNewest"),
  };

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
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
                value === mode ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"
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

/* Pagination */
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const { t } = useTranslation();
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === total || Math.abs(p - page) <= 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-8 pt-6 border-t border-gray-800">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="px-3 py-2 text-xs font-mono text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-colors">
        ← {t("common.previous")}
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span className="px-2 text-gray-400 text-xs select-none">…</span>}
            <button onClick={() => onChange(p)}
              className={cn("w-9 h-9 text-xs font-mono border transition-colors",
                p === page ? "bg-blue-600 border-blue-600 text-white" : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              )}>
              {p}
            </button>
          </React.Fragment>
        );
      })}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        className="px-3 py-2 text-xs font-mono text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-colors">
        {t("common.next")} →
      </button>
    </div>
  );
}

export default function CataloguePage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const TYPE_OPTIONS: { value: TypeFilter; label: string; tag: string }[] = [
    { value: "all", label: t("catalogue.typeAll"), tag: "ALL" },
    { value: "saas", label: t("catalogue.typeSaas"), tag: "SaaS" },
    { value: "one_shot", label: t("catalogue.typeOneShot"), tag: "ONE" },
  ];

  /* Filtres */
  const [q, setQ]             = useState(params.get("q") ?? "");
  const [debouncedQ, setDQ]   = useState(q);
  const [cats, setCats]       = useState<Set<string>>(new Set(params.get("cats")?.split(",").filter(Boolean) ?? []));
  const [pmin, setPmin]       = useState<number | "">(params.get("pmin") ? Number(params.get("pmin")) : "");
  const [pmax, setPmax]       = useState<number | "">(params.get("pmax") ? Number(params.get("pmax")) : "");
  const [dPmin, setDPmin]     = useState(pmin);
  const [dPmax, setDPmax]     = useState(pmax);
  const [dispo, setDispo]     = useState(params.get("dispo") === "1");
  const [sort, setSort]       = useState<SortMode>(validSort(params.get("sort")));
  const [type, setType]       = useState<TypeFilter>(validType(params.get("type")));

  /* UI */
  const [viewMode, setViewMode]     = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage]             = useState(1);

  /* Données */
  const [allCategories, setAllCategories] = useState<{ slug: string; name: string }[]>([]);
  const [results, setResults]             = useState<Service[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [fetching, setFetching]           = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDQ(q), 250);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => setDPmin(pmin), 300);
    return () => clearTimeout(timer);
  }, [pmin]);
  useEffect(() => {
    const timer = setTimeout(() => setDPmax(pmax), 300);
    return () => clearTimeout(timer);
  }, [pmax]);

  useEffect(() => {
    servicesApi.getAll().then((data) => {
      const map = new Map<string, string>();
      data.forEach((s) => { if (s.categorySlug) map.set(s.categorySlug, s.category ?? ""); });
      setAllCategories([...map.entries()].map(([slug, name]) => ({ slug, name })));
    });
  }, []);

  useEffect(() => {
    const criteria: SearchCriteria = {
      q: debouncedQ || undefined,
      cats: cats.size ? [...cats].join(",") : undefined,
      pmin: dPmin !== "" ? dPmin : undefined,
      pmax: dPmax !== "" ? dPmax : undefined,
      dispo: dispo || undefined,
      sort,
      type: type !== "all" ? type : undefined,
    };
    setFetching(true);
    servicesApi.search(criteria)
      .then((res) => { setResults(res.items); setTotal(res.total); })
      .catch(() => toast(t("common.error"), "error"))
      .finally(() => { setLoading(false); setFetching(false); });
  }, [debouncedQ, cats, dPmin, dPmax, dispo, sort, type]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q)            p.set("q", q);
    if (cats.size)    p.set("cats", [...cats].join(","));
    if (pmin !== "")  p.set("pmin", String(pmin));
    if (pmax !== "")  p.set("pmax", String(pmax));
    if (dispo)        p.set("dispo", "1");
    if (sort !== "relevance") p.set("sort", sort);
    if (type !== "all")       p.set("type", type);
    setParams(p, { replace: true });
  }, [q, cats, pmin, pmax, dispo, sort, type]);

  useEffect(() => { setPage(1); }, [debouncedQ, cats, dPmin, dPmax, dispo, sort, type]);

  const toggleCat = (slug: string) =>
    setCats((prev) => { const n = new Set(prev); if (n.has(slug)) { n.delete(slug); } else { n.add(slug); } return n; });

  const resetAll = () => {
    setQ(""); setDQ("");
    setCats(new Set());
    setPmin(""); setPmax(""); setDPmin(""); setDPmax("");
    setDispo(false);
    setSort("relevance");
    setType("all");
  };

  const hasFilters = q.trim() !== "" || cats.size > 0 || pmin !== "" || pmax !== "" || dispo || sort !== "relevance" || type !== "all";
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated  = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasPriceFilter = pmin !== "" || pmax !== "";

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <FadeIn>
      <div className="bg-gray-950 border-b border-gray-800">
        <div className="container py-12">
          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 mb-6">
            <span>{t("catalogue.breadcrumbHome")}</span><span>/</span><span className="text-blue-500">{t("catalogue.breadcrumbCatalogue")}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">{t("catalogue.securitySolutions")}</div>
              <h1 className="text-white font-black leading-none tracking-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em" }}>
                {t("catalogue.catalogTitle")}
              </h1>
              <p className="mt-3 text-gray-400 text-sm max-w-xl leading-relaxed">
                {loading
                  ? t("catalogue.catalogDesc_loading")
                  : t("catalogue.catalogDesc", { total, plural: total !== 1 ? t("catalogue.catalogDescPlural") : t("catalogue.catalogDescSingular") })}
              </p>
            </div>
            <div className="w-full lg:w-96">
              <div className="relative">
                <label htmlFor="catalogue-search" className="sr-only">{t("common.searchLabel")}</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
                <input
                  id="catalogue-search"
                  type="text"
                  placeholder={t("catalogue.searchPlaceholder")}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                {q && (
                  <button onClick={() => setQ("")} aria-label={t("common.clearSearch")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      </FadeIn>

      {/* Toolbar */}
      <div className="border-b border-gray-800 bg-gray-900 sticky top-0 z-30">
        <div className="container flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-1">
            {TYPE_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setType(opt.value)}
                className={cn("px-3 py-1.5 text-xs font-mono tracking-widest transition-colors border",
                  type === opt.value ? "bg-blue-600 border-blue-600 text-white" : "border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600"
                )}>
                {opt.tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs font-mono hidden sm:block">
              {loading
                ? "…"
                : total === 0
                ? `0 ${t("catalogue.sortRelevance").toLowerCase()}`
                : t("catalogue.resultRange", { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, total), total })}
            </span>
            {hasFilters && (
              <button onClick={resetAll}
                className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-2 py-1.5">
                <RefreshCw className="h-3 w-3" /> {t("catalogue.resetFilters")}
              </button>
            )}
            <SortDropdown value={sort} onChange={setSort} />
            <button onClick={() => setSidebarOpen((o) => !o)}
              className={cn("flex items-center gap-2 px-3 py-2.5 text-xs font-mono tracking-wide border transition-colors",
                sidebarOpen ? "bg-blue-600/20 border-blue-500/40 text-blue-400" : "border-gray-700 text-gray-500 hover:text-gray-300"
              )}>
              <Filter className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("catalogue.filters")}</span>
            </button>
            <div className="flex border border-gray-700">
              <button onClick={() => setViewMode("grid")} aria-label={t("common.viewGrid")} aria-pressed={viewMode === "grid"}
                className={cn("px-2.5 py-2.5 transition-colors", viewMode === "grid" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300")}>
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button onClick={() => setViewMode("list")} aria-label={t("common.viewList")} aria-pressed={viewMode === "list"}
                className={cn("px-2.5 py-2.5 border-l border-gray-700 transition-colors", viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300")}>
                <List className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Corps principal */}
      <div className="container py-10">
        <div className={cn("flex gap-8", !sidebarOpen && "block")}>

          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-56 flex-shrink-0">
              <div className="sticky top-20 space-y-1">

                <div className="text-gray-400 font-mono text-[10px] tracking-widest px-2 mb-3">{t("catalogue.filterCategories")}</div>
                {allCategories.map((c) => (
                  <label key={c.slug}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-900 transition-colors group">
                    <input
                      type="checkbox"
                      checked={cats.has(c.slug)}
                      onChange={() => toggleCat(c.slug)}
                      className="accent-blue-500 w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className={cn("font-mono text-xs tracking-wide truncate",
                      cats.has(c.slug) ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>
                      {c.name}
                    </span>
                  </label>
                ))}

                <div className="pt-5 border-t border-gray-800 mt-4">
                  <div className="text-gray-400 font-mono text-[10px] tracking-widest px-2 mb-3">{t("catalogue.filterMonthlyPrice")}</div>
                  <div className="px-3 flex gap-2">
                    <label htmlFor="price-min" className="sr-only">{t("catalogue.filterMin")}</label>
                    <input
                      id="price-min"
                      type="number"
                      min={0}
                      placeholder={t("catalogue.filterMin")}
                      value={pmin}
                      onChange={(e) => setPmin(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                    />
                    <label htmlFor="price-max" className="sr-only">{t("catalogue.filterMax")}</label>
                    <input
                      id="price-max"
                      type="number"
                      min={0}
                      placeholder={t("catalogue.filterMax")}
                      value={pmax}
                      onChange={(e) => setPmax(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                    />
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-800 mt-4 px-3">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={dispo}
                      onChange={(e) => setDispo(e.target.checked)}
                      className="accent-blue-500 w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className={cn("font-mono text-xs tracking-wide", dispo ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>
                      {t("catalogue.filterAvailable")}
                    </span>
                  </label>
                </div>

                <div className="pt-5 border-t border-gray-800 mt-4">
                  <div className="text-gray-400 font-mono text-[10px] tracking-widest px-2 mb-3">{t("catalogue.filterType")}</div>
                  {TYPE_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setType(opt.value)}
                      className={cn("w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono tracking-wide transition-colors border-l-2",
                        type === opt.value ? "border-blue-500 bg-blue-500/10 text-white" : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900"
                      )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", type === opt.value ? "bg-blue-400" : "bg-gray-700")} />
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="pt-6 mt-4 border-t border-gray-800 px-3">
                  <div className="bg-blue-600/10 border border-blue-500/20 p-4">
                    <Zap className="h-4 w-4 text-blue-500 mb-2" />
                    <p className="text-white text-xs font-semibold mb-1">{t("catalogue.ctaAdvice")}</p>
                    <p className="text-gray-400 text-xs leading-relaxed mb-3">{t("catalogue.ctaAdviceDesc")}</p>
                    <a href="/contact" className="inline-flex items-center gap-1 text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors">
                      {t("catalogue.ctaContact")}
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Grille */}
          <div className="flex-1 min-w-0">

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-gray-800">
                <span className="text-gray-400 text-xs font-mono">{t("catalogue.activeFilters")}</span>
                {[...cats].map((slug) => (
                  <span key={slug} className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    {allCategories.find((c) => c.slug === slug)?.name ?? slug}
                    <button onClick={() => toggleCat(slug)} aria-label={t("common.removeFilter")} className="hover:text-white"><X className="h-2.5 w-2.5" aria-hidden="true" /></button>
                  </span>
                ))}
                {type !== "all" && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    {TYPE_OPTIONS.find((o) => o.value === type)?.label}
                    <button onClick={() => setType("all")} aria-label={t("common.removeFilter")} className="hover:text-white"><X className="h-2.5 w-2.5" aria-hidden="true" /></button>
                  </span>
                )}
                {q && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    "{q}"
                    <button onClick={() => setQ("")} aria-label={t("common.removeFilter")} className="hover:text-white"><X className="h-2.5 w-2.5" aria-hidden="true" /></button>
                  </span>
                )}
                {hasPriceFilter && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    {t("catalogue.filterPriceRange", { min: pmin !== "" ? `${pmin}€` : "0€", max: pmax !== "" ? `${pmax}€` : "∞" })}
                    <button onClick={() => { setPmin(""); setPmax(""); }} aria-label={t("common.removeFilter")} className="hover:text-white"><X className="h-2.5 w-2.5" aria-hidden="true" /></button>
                  </span>
                )}
                {dispo && (
                  <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2 py-1">
                    {t("catalogue.filterAvailableTag")}
                    <button onClick={() => setDispo(false)} aria-label={t("common.removeFilter")} className="hover:text-white"><X className="h-2.5 w-2.5" aria-hidden="true" /></button>
                  </span>
                )}
                {sort !== "relevance" && (
                  <span className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-400 text-xs font-mono px-2 py-1">
                    {t(`catalogue.sort${sort.charAt(0).toUpperCase() + sort.slice(1).replace(/_([a-z])/g, (_, l) => l.toUpperCase())}` as never) || sort}
                    <button onClick={() => setSort("relevance")} aria-label={t("common.removeFilter")} className="hover:text-white"><X className="h-2.5 w-2.5" aria-hidden="true" /></button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className={cn("gap-px", viewMode === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 bg-gray-800" : "flex flex-col divide-y divide-gray-800")}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${type}-${sort}-${page}-${[...cats].join(",")}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn("gap-px", fetching && "opacity-60",
                    viewMode === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 bg-gray-800" : "flex flex-col divide-y divide-gray-800"
                  )}
                >
                  {paginated.map((s) => (
                    <div key={s.id} className={cn("bg-gray-950", viewMode === "list" && "hover:bg-gray-900 transition-colors")}>
                      <ServiceCard service={s} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {!loading && total === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="border border-gray-800 p-6 mb-6">
                  <Search className="h-8 w-8 text-gray-500 mx-auto" />
                </div>
                <p className="text-white font-semibold mb-2">{t("catalogue.noResultsTitle")}</p>
                <p className="text-gray-400 text-sm max-w-xs mb-2">
                  {t("catalogue.noResultsDesc")}
                </p>
                {hasPriceFilter && (
                  <p className="text-gray-400 text-xs mb-4">
                    {t("catalogue.noResultsPriceHint")}
                  </p>
                )}
                <button onClick={resetAll}
                  className="flex items-center gap-2 text-xs font-mono text-blue-400 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors">
                  <RefreshCw className="h-3 w-3" /> {t("catalogue.resetAllFilters")}
                </button>
              </div>
            )}

            {!loading && total > 0 && (
              <>
                <Pagination page={page} total={totalPages} onChange={setPage} />
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-mono">
                    {t("catalogue.totalResults", { total, plural: total !== 1 ? t("catalogue.catalogDescPlural") : t("catalogue.catalogDescSingular") })}
                  </span>
                  <a href="/contact" className="text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors">
                    {t("catalogue.missingContact")}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
