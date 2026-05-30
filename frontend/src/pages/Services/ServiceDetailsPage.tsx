import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  Lock,
  Cpu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { PageTransition } from "../../components/ui/PageTransition";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "../../hooks/useToast";
import { servicesApi, type Service } from "../../api/services";
import type { BillingCycle } from "../../context/CartContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth() as { isAuthenticated: boolean };
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [similar, setSimilar] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    setImgIdx(0);
    setLoading(true);
    servicesApi
      .getById(id)
      .then((data) => {
        setService(data);
        servicesApi.getSimilar(id, 6).then(setSimilar).catch(() => setSimilar([]));
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton />;

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-500 mb-4">{t("service.notFound")}</p>
        <Link to="/catalogue">
          <Button variant="outline">{t("service.backToCatalogue")}</Button>
        </Link>
      </div>
    );
  }

  const imgs: string[] = (service.images && service.images.length > 0)
    ? service.images
    : service.image
    ? [service.image]
    : [];

  const mainImg = imgs.length > 0 ? `/${imgs[imgIdx]}` : "";
  const yearlyPrice = service.priceYearly ?? Math.round(service.priceMonthly * 12 * 0.85);
  const yearlySaving = Math.round(service.priceMonthly * 12 - yearlyPrice);
  const avail = service.availability ?? "available";
  const unavail = avail === "unavailable" || avail === "maintenance";

  const doSubscribe = (tryCycle: BillingCycle = cycle) => {
    if (!isAuthenticated) {
      toast(t("service.loginToSubscribe"), "error");
      navigate("/connexion");
      return;
    }
    addToCart({
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      priceMonthly: service.priceMonthly,
      cycle: tryCycle,
      image: mainImg || undefined,
    });
    navigate("/checkout");
  };

  const goImg = (dir: -1 | 1) =>
    setImgIdx((i) => (i + dir + imgs.length) % imgs.length);

  return (
    <PageTransition>
    <div className="relative">
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-10"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
      />

      <div className="container py-12 relative">

        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("service.backToCatalogue")}
        </Link>

        <div className="grid gap-14 lg:grid-cols-2">

          {/* Left — carrousel + features */}
          <div>
            <div className="relative w-full aspect-video bg-gray-900 border border-gray-800">
              {mainImg ? (
                <img
                  src={mainImg}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shield className="h-16 w-16 text-gray-500" />
                </div>
              )}

              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => goImg(-1)}
                    aria-label={t("common.prevImage")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => goImg(1)}
                    aria-label={t("common.nextImage")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex">
                    {imgs.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        aria-label={t("common.selectImage", { n: i + 1 })}
                        aria-current={i === imgIdx ? "true" : undefined}
                        className="flex items-center justify-center w-8 h-8"
                      >
                        <span className={`block w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? "bg-blue-400" : "bg-white/30 hover:bg-white/60"}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {imgs.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    aria-label={t("common.selectImage", { n: i + 1 })}
                    aria-pressed={i === imgIdx}
                    className={`flex-shrink-0 w-16 h-10 border transition-colors overflow-hidden ${i === imgIdx ? "border-blue-500" : "border-gray-700 hover:border-gray-500"}`}
                  >
                    <img src={`/${src}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {service.features && service.features.length > 0 && (
              <div className="mt-6 border border-gray-800 bg-gray-900 p-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
                  <Layers className="h-4 w-4 text-blue-500" />
                  {t("service.features")}
                </h3>
                <ul className="space-y-2.5">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {f.included
                        ? <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        : <X className="h-4 w-4 text-gray-500 flex-shrink-0" />}
                      <span className={f.included ? "text-gray-200" : "text-gray-500 line-through"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.technicalSpecs && service.technicalSpecs.length > 0 && (
              <div className="mt-4 border border-gray-800 bg-gray-900 p-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  {t("service.technicalSpecs")}
                </h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {service.technicalSpecs.map((spec, i) => (
                    <div key={i} className="contents">
                      <dt className="text-xs font-mono text-gray-400 self-center">{spec.label}</dt>
                      <dd className="text-sm text-gray-200 self-center">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
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

            {unavail && (
              <div className="mt-6 flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {avail === "maintenance"
                  ? t("service.maintenanceBanner")
                  : t("service.unavailableBanner")}
              </div>
            )}

            {service.type === "saas" && !unavail && (
              <div className="mt-8">
                <p className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-3">
                  {t("service.choosePlan")}
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
                    {t("service.monthly")}
                  </button>
                  <button
                    onClick={() => setCycle("yearly")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-l border-gray-700 ${
                      cycle === "yearly"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    {t("service.yearly")}
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
                    <span className="text-gray-400 text-sm">
                      {cycle === "monthly" ? t("service.perMonth") : t("service.perYear")}
                    </span>
                  </div>
                  {cycle === "yearly" && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {t("service.yearlySaving", { amount: yearlySaving })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {service.type === "one_shot" && !unavail && (
              <div className="mt-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{service.priceMonthly}€</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t("service.perpetualLicense")}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              {unavail ? (
                <Button size="lg" fullWidth disabled className="opacity-40 cursor-not-allowed">
                  {t("service.serviceUnavailable")}
                </Button>
              ) : service.type === "one_shot" ? (
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast(t("service.loginToOrder"), "error");
                      navigate("/connexion");
                      return;
                    }
                    addToCart({
                      id: service.id,
                      name: service.name,
                      description: service.description ?? "",
                      priceMonthly: service.priceMonthly,
                      cycle: "monthly",
                      image: mainImg || undefined,
                    });
                    navigate("/checkout");
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t("service.orderNow")}
                </Button>
              ) : (
                <>
                  {service.trialAvailable && (
                    <Button
                      size="lg"
                      fullWidth
                      variant="outline"
                      onClick={() => doSubscribe("monthly")}
                    >
                      <FlaskConical className="h-4 w-4" />
                      {t("service.tryNow")}
                    </Button>
                  )}
                  <Button size="lg" fullWidth onClick={() => doSubscribe()}>
                    <Sparkles className="h-4 w-4" />
                    {t("service.subscribeNow")}
                  </Button>
                </>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-1">
                <Lock className="h-3 w-3" />
                {t("service.securePayment")}
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">{t("service.similarServices")}</h2>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {similar.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
