import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  Lock,
  Cloud,
  Server,
  Globe,
  Cpu,
  Eye,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Network,
  Database,
  Terminal,
  Radio,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  ChevronLeft,
  Fingerprint,
  Binary,
  Layers,
  ScanLine,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { FadeIn } from "../../components/ui/FadeIn";
import { PageTransition } from "../../components/ui/PageTransition";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { homeApi, type CarouselSlide, type HomeCategory, type HomeService } from "../../api/home";
import { type Service } from "../../api/services";
import { useTranslation } from "react-i18next";
import React from "react";

/* Ticker de menaces */
function getThreatEvents(t: (k: string) => string) {
  return [
    { type: t("home.threatBlocked"), label: t("home.threat1Label"), severity: "high" },
    { type: t("home.threatDetected"), label: t("home.threat2Label"), severity: "med" },
    { type: t("home.threatBlocked"), label: t("home.threat3Label"), severity: "high" },
    { type: t("home.threatAnalyzed"), label: t("home.threat4Label"), severity: "low" },
    { type: t("home.threatBlocked"), label: t("home.threat5Label"), severity: "high" },
    { type: t("home.threatDetected"), label: t("home.threat6Label"), severity: "med" },
    { type: t("home.threatBlocked"), label: t("home.threat7Label"), severity: "high" },
  ];
}

function ThreatTicker() {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const events = getThreatEvents(t);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % events.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, [events.length]);

  const ev = events[idx];
  const color =
    ev.severity === "high"
      ? "text-red-400"
      : ev.severity === "med"
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div
      className="flex items-center gap-3 font-mono text-xs border border-white/10 rounded px-4 py-2 bg-white/5 backdrop-blur-sm w-fit"
      style={{ transition: "opacity 0.3s", opacity: visible ? 1 : 0 }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            ev.severity === "high" ? "bg-red-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            ev.severity === "high" ? "bg-red-400" : "bg-amber-400"
          }`}
        />
      </span>
      <span className={`font-bold tracking-widest ${color}`}>{ev.type}</span>
      <span className="text-white/50">—</span>
      <span className="text-white/70">{ev.label}</span>
    </div>
  );
}

/* Stat counter animé */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          setCount(start);
          if (start >= target) clearInterval(timer);
        }, 20);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/* Certifications (noms de standards — non traduits) */
const CERTIFICATIONS = ["ISO 27001", "SOC 2 Type II", "ANSSI PRIS", "HDS", "PCI DSS", "RGPD"];

/* Carousel principal */
function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const total = slides.length;

  const go = (next: number) => {
    setFade(false);
    setTimeout(() => {
      setIdx((next + total) % total);
      setFade(true);
    }, 200);
  };

  useEffect(() => {
    if (total < 2) return;
    const timer = setInterval(() => go(idx + 1), 5000);
    return () => clearInterval(timer);
  }, [idx, total]);

  if (total === 0) return null;

  const slide = slides[idx];

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>
      {slide.imagePath ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{ backgroundImage: `url(/${slide.imagePath})`, opacity: fade ? 1 : 0 }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gray-950/80" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="relative container flex flex-col justify-center pt-28 pb-24"
        style={{ minHeight: "92vh", transition: "opacity 0.3s", opacity: fade ? 1 : 0 }}
      >
        <div className="max-w-3xl space-y-6 mb-10">
          <h1 className="text-white font-black leading-none tracking-tight" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-gray-300 text-xl max-w-2xl leading-relaxed font-light">{slide.subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {slide.ctaLabel && slide.ctaUrl ? (
            <Link to={slide.ctaUrl}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 gap-2 rounded-none">
                {slide.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/inscription">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 gap-2 rounded-none">
                {t("home.startPoc")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link to="/catalogue">
            <Button variant="ghost" size="lg" className="text-white border border-white/20 hover:bg-white/10 rounded-none gap-2 font-mono text-sm tracking-wide">
              {t("home.explorePlatform")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-2">
          <span className="text-gray-400 text-xs font-mono tracking-widest mr-2">{t("home.certifiedBy")}</span>
          {CERTIFICATIONS.map((c) => (
            <span key={c} className="text-gray-500 border border-gray-800 text-xs font-mono px-2 py-0.5 rounded">{c}</span>
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button onClick={() => go(idx - 1)} aria-label={t("common.prevSlide")} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/30 text-white hover:bg-black/50 transition-colors">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button onClick={() => go(idx + 1)} aria-label={t("common.nextSlide")} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/30 text-white hover:bg-black/50 transition-colors">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={t("common.goToSlide", { n: i + 1 })} aria-current={i === idx ? "true" : undefined} className="flex items-center justify-center w-11 h-11">
                <span className={`block w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-blue-400" : "bg-white/30 hover:bg-white/60"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [topProducts, setTopProducts] = useState<HomeService[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    homeApi.getCarousel().then((d) => setSlides(Array.isArray(d) ? d : [])).finally(() => setLoadingSlides(false));
    homeApi.getCategories().then((d) => setCategories(Array.isArray(d) ? d : [])).finally(() => setLoadingCats(false));
    homeApi.getTopProducts().then((d) => setTopProducts(Array.isArray(d) ? d : [])).finally(() => setLoadingTop(false));
  }, []);

  const STATS = [
    { value: 500, suffix: "+", label: t("home.statsProtected"), icon: Shield },
    { value: 99, suffix: ".9%", label: t("home.statsUptime"), icon: Activity },
    { value: 14, suffix: "s", label: t("home.statsMttd"), icon: Clock },
    { value: 3200000, suffix: "", label: t("home.statsEvents"), icon: Database },
  ];

  const INCIDENT_STEPS = [
    { icon: AlertTriangle, label: t("home.incidentDetection"), time: "T+0s", desc: t("home.incidentDetectionDesc") },
    { icon: ScanLine, label: t("home.incidentCorrelation"), time: "T+4s", desc: t("home.incidentCorrelationDesc") },
    { icon: Zap, label: t("home.incidentConfinement"), time: "T+12s", desc: t("home.incidentConfinementDesc") },
    { icon: Terminal, label: t("home.incidentForensics"), time: "T+45s", desc: t("home.incidentForensicsDesc") },
    { icon: CheckCircle, label: t("home.incidentRemediation"), time: "T+2min", desc: t("home.incidentRemediationDesc") },
  ];

  const CAPABILITIES = [
    {
      icon: Eye,
      title: t("home.capXdrTitle"),
      tag: t("home.capXdrTag"),
      desc: t("home.capXdrDesc"),
      metrics: ["<14s MTTD", "95% faux positifs éliminés"],
    },
    {
      icon: Binary,
      title: t("home.capAiTitle"),
      tag: t("home.capAiTag"),
      desc: t("home.capAiDesc"),
      metrics: ["10B+ événements d'entraînement", "99.4% de précision"],
    },
    {
      icon: Fingerprint,
      title: t("home.capZtTitle"),
      tag: t("home.capZtTag"),
      desc: t("home.capZtDesc"),
      metrics: ["Micro-segmentation L3/L7", "MFA adaptatif"],
    },
    {
      icon: Radio,
      title: t("home.capTiTitle"),
      tag: t("home.capTiTag"),
      desc: t("home.capTiDesc"),
      metrics: ["140+ flux CTI", "Mise à jour <5min"],
    },
    {
      icon: Layers,
      title: t("home.capCspmTitle"),
      tag: t("home.capCspmTag"),
      desc: t("home.capCspmDesc"),
      metrics: ["AWS / Azure / GCP", "Conformité CIS / NIST"],
    },
    {
      icon: Network,
      title: t("home.capNdrTitle"),
      tag: t("home.capNdrTag"),
      desc: t("home.capNdrDesc"),
      metrics: ["DPI 100Gbps", "Protocoles OT/ICS"],
    },
  ];

  const COMPARISON = [
    {
      label: t("home.legacyLabel"),
      issues: [
        t("home.legacyIssue1"),
        t("home.legacyIssue2"),
        t("home.legacyIssue3"),
        t("home.legacyIssue4"),
      ],
    },
    {
      label: t("home.cynasecureLabel"),
      advantages: [
        t("home.cynasecureAdv1"),
        t("home.cynasecureAdv2"),
        t("home.cynasecureAdv3"),
        t("home.cynasecureAdv4"),
      ],
    },
  ];

  const TESTIMONIALS = [
    {
      quote: t("home.testimonial1Quote"),
      author: t("home.testimonial1Author"),
      company: t("home.testimonial1Company"),
      sector: t("home.testimonial1Sector"),
    },
    {
      quote: t("home.testimonial2Quote"),
      author: t("home.testimonial2Author"),
      company: t("home.testimonial2Company"),
      sector: t("home.testimonial2Sector"),
    },
  ];

  const ARCH_ITEMS = [
    { icon: Server, title: t("home.archAgentTitle"), desc: t("home.archAgentDesc") },
    { icon: Cloud, title: t("home.archCloudTitle"), desc: t("home.archCloudDesc") },
    { icon: Cpu, title: t("home.archAiTitle"), desc: t("home.archAiDesc") },
    { icon: TrendingUp, title: t("home.archScaleTitle"), desc: t("home.archScaleDesc") },
    { icon: Lock, title: t("home.archEncryptTitle"), desc: t("home.archEncryptDesc") },
    { icon: Globe, title: t("home.archApiTitle"), desc: t("home.archApiDesc") },
  ];

  const THREAT_STATS = [
    { value: "19min", label: t("home.lateralizationTime") },
    { value: "82%", label: t("home.attacksNoMalware") },
    { value: "4.5M€", label: t("home.breachCost") },
  ];

  const heroMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: "easeOut" } };

  return (
    <PageTransition>
      <div className="space-y-0">

        {/* HERO */}
        {loadingSlides ? (
          <section className="bg-gray-950" style={{ minHeight: "92vh" }}>
            <div className="container flex items-center justify-center" style={{ minHeight: "92vh" }}>
              <span className="text-gray-400 font-mono text-sm animate-pulse">{t("home.loading")}</span>
            </div>
          </section>
        ) : slides.length > 0 ? (
          <HeroCarousel slides={slides} />
        ) : (
          <section className="relative bg-gray-950 overflow-hidden" style={{ minHeight: "92vh" }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
            <div className="relative container flex flex-col justify-center pt-28 pb-24" style={{ minHeight: "92vh" }}>
              <motion.h1
                className="text-white font-black leading-none tracking-tight mb-6"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}
                {...heroMotion}
              >
                {t("home.stopAttacks")}
                <br /><span className="text-blue-400">{t("home.beforeTheyHit")}</span>
              </motion.h1>
              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={heroMotion.initial}
                animate={heroMotion.animate}
                transition={{ ...heroMotion.transition, delay: reduced ? 0 : 0.2 }}
              >
                <Link to="/inscription">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 gap-2 rounded-none">
                    {t("home.startPoc")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* STATS */}
        <FadeIn>
          <section className="bg-gray-900 border-y border-gray-800">
            <div className="container grid grid-cols-2 md:grid-cols-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-10 px-8 text-center ${i < 3 ? "border-r border-gray-800" : ""}`}
                >
                  <s.icon className="h-5 w-5 text-blue-500 mx-auto mb-3 opacity-70" />
                  <div className="text-3xl font-black text-white tracking-tight">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-xs text-gray-400 font-mono tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* THREAT INTELLIGENCE */}
        <FadeIn>
          <section className="bg-gray-950 py-28">
            <div className="container grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("home.context")}</div>
                <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-6" style={{ letterSpacing: "-0.02em" }}>
                  {t("home.threatLandscape")}
                  <br />
                  <span className="text-gray-500">{t("home.threatLandscapeChanged")}</span>
                </h2>
                <div className="space-y-6 text-gray-400 text-sm leading-loose">
                  <p>
                    {t("home.threatContextP1").replace(/<1>/g, "").replace(/<\/1>/g, "")}
                  </p>
                  <p>
                    {t("home.threatContextP2").replace(/<1>/g, "").replace(/<\/1>/g, "")}
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-6">
                  {THREAT_STATS.map((s) => (
                    <div key={s.label} className="border-l-2 border-blue-600 pl-4">
                      <div className="text-2xl font-black text-white">{s.value}</div>
                      <div className="text-xs text-gray-400 mt-1 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-red-500/20 bg-red-500/5 rounded-none p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-mono text-xs tracking-widest">{t("home.legacyApproach")}</span>
                  </div>
                  <p className="text-white text-sm font-semibold mb-3">{COMPARISON[0].label}</p>
                  <ul className="space-y-2">
                    {COMPARISON[0].issues!.map((issue) => (
                      <li key={issue} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-red-500 text-lg leading-none">×</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-blue-500/30 bg-blue-500/5 rounded-none p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-mono text-xs tracking-widest">{t("home.cynasecureApproach")}</span>
                  </div>
                  <p className="text-white text-sm font-semibold mb-3">{COMPARISON[1].label}</p>
                  <ul className="space-y-2">
                    {COMPARISON[1].advantages!.map((adv) => (
                      <li key={adv} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-blue-400 text-lg leading-none">✓</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                  <Link to="/catalogue" className="mt-5 inline-flex items-center gap-1 text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors">
                    {t("home.viewPlatform")} <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* CAPACITÉS */}
        <FadeIn>
          <section className="bg-gray-900 py-28 border-y border-gray-800">
            <div className="container">
              <div className="mb-16">
                <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("home.platform")}</div>
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                    {t("home.sixCapabilities")}
                  </h2>
                  <Link to="/catalogue">
                    <Button variant="ghost" className="text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 rounded-none font-mono text-xs tracking-wide gap-2">
                      {t("home.fullCatalogue")} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800">
                {CAPABILITIES.map((cap) => (
                  <div
                    key={cap.title}
                    className="bg-gray-900 p-8 hover:bg-gray-800/60 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <cap.icon className="h-6 w-6 text-blue-500" />
                      <span className="text-[10px] font-mono tracking-widest text-gray-400 border border-gray-700 px-2 py-0.5">
                        {cap.tag}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{cap.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{cap.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {cap.metrics.map((m) => (
                        <span key={m} className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* TIMELINE D'INCIDENT */}
        <FadeIn>
          <section className="bg-gray-950 py-28">
            <div className="container">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("home.automatedResponse")}</div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
                {t("home.detectionToRemediation")}
                <br />
                <span className="text-gray-500">{t("home.inUnderTwoMin")}</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-xl mb-16 leading-relaxed">
                {t("home.soarDesc")}
              </p>

              <div className="relative">
                <div className="absolute top-8 left-0 right-0 h-px bg-gray-800 hidden lg:block" />

                <div className="grid lg:grid-cols-5 gap-8 lg:gap-4">
                  {INCIDENT_STEPS.map((step, i) => (
                    <div key={step.label} className="relative">
                      <div className="hidden lg:flex items-center justify-center w-16 h-16 border border-blue-500/30 bg-gray-950 rounded-none mb-6 mx-auto relative z-10">
                        <step.icon className="h-6 w-6 text-blue-400" />
                      </div>

                      <div className="lg:hidden flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 border border-blue-500/30 bg-gray-950 flex-shrink-0">
                          <step.icon className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="h-px flex-1 bg-gray-800" />
                      </div>

                      <div className="text-center lg:text-center">
                        <div className="text-blue-500 font-mono text-xs mb-1">{step.time}</div>
                        <div className="text-white font-bold text-sm mb-1">{step.label}</div>
                        <div className="text-gray-400 text-xs leading-relaxed">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* DOMAINES */}
        {(loadingCats || categories.length > 0) && (
          <FadeIn>
            <section className="bg-gray-900 py-28 border-y border-gray-800">
              <div className="container space-y-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div>
                    <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("home.coverage")}</div>
                    <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                      {t("home.protectionDomains")}
                    </h2>
                    <p className="mt-3 text-gray-400 text-sm max-w-lg">
                      {t("home.protectionDomainsDesc")}
                    </p>
                  </div>
                </div>

                <div className={`grid gap-px bg-gray-800 ${categories.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-5"}`}>
                  {loadingCats ? (
                    <p className="col-span-full text-center text-gray-400 py-12 font-mono text-sm">
                      {t("home.loadingDomains")}
                    </p>
                  ) : (
                    categories.map((c) => (
                      <Link key={c.id} to={`/catalogue?cat=${c.slug}`} className="group bg-gray-900 hover:bg-gray-800/60 transition-colors p-8 flex flex-col gap-4">
                        {c.imagePath ? (
                          <img src={`/${c.imagePath}`} alt={c.name} className="w-12 h-12 object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-bold text-sm">{c.name}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </section>
          </FadeIn>
        )}

        {/* SOLUTIONS POPULAIRES */}
        {(loadingTop || topProducts.length > 0) && (
          <FadeIn>
            <section className="bg-gray-950 py-28">
              <div className="container space-y-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div>
                    <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("home.inProduction")}</div>
                    <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                      {t("home.mostAdopted")}
                    </h2>
                  </div>
                  <Link to="/catalogue">
                    <Button variant="ghost" className="text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 rounded-none font-mono text-xs tracking-wide gap-2 flex-shrink-0">
                      {t("home.allSolutions")} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {loadingTop ? (
                    <p className="col-span-full text-center text-gray-400 py-12 font-mono text-sm">
                      {t("home.loading")}
                    </p>
                  ) : (
                    topProducts.map((s) => (
                      <ServiceCard
                        key={s.id}
                        service={{
                          id: s.id,
                          name: s.name,
                          description: s.description ?? "",
                          longDescription: null,
                          priceMonthly: s.priceMonthly ?? 0,
                          priceYearly: null,
                          image: s.image,
                          category: s.category ?? "",
                          categorySlug: s.categorySlug ?? "",
                          type: s.type === "one_shot" ? "one_shot" : "saas",
                          badge: undefined,
                          features: [],
                          isAvailable: true,
                        } as Service}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>
          </FadeIn>
        )}

        {/* TÉMOIGNAGES */}
        <FadeIn>
          <section className="bg-gray-900 py-28 border-y border-gray-800">
            <div className="container">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-12">{t("home.clientFeedback")}</div>

              <div className="grid lg:grid-cols-2 gap-px bg-gray-800">
                {TESTIMONIALS.map((testimonial) => (
                  <div key={testimonial.author} className="bg-gray-900 p-10">
                    <div className="text-4xl text-blue-600 font-serif leading-none mb-6 select-none">
                      "
                    </div>
                    <blockquote className="text-gray-300 text-base leading-relaxed mb-8 italic">
                      {testimonial.quote}
                    </blockquote>
                    <div className="border-t border-gray-800 pt-6 flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">{testimonial.author}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{testimonial.company}</div>
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-gray-400 border border-gray-700 px-2 py-0.5">
                        {testimonial.sector}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex flex-wrap items-center gap-8 justify-center">
                <span className="text-gray-400 text-xs font-mono tracking-widest">{t("home.trustedBy")}</span>
                {["Groupe A", "Banque B", "Énergie C", "Infra D", "Santé E", "Défense F"].map((name) => (
                  <span key={name} className="text-gray-400 font-bold text-sm tracking-wide">{name}</span>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ARCHITECTURE */}
        <FadeIn>
          <section className="bg-gray-950 py-28">
            <div className="container">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("home.architecture")}</div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-16" style={{ letterSpacing: "-0.02em" }}>
                {t("home.builtForCritical")}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800">
                {ARCH_ITEMS.map((item) => (
                  <div key={item.title} className="bg-gray-950 p-8 hover:bg-gray-900/60 transition-colors">
                    <item.icon className="h-5 w-5 text-blue-500 mb-5" />
                    <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* CTA FINAL */}
        <FadeIn>
          <section className="relative bg-blue-700 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative container py-24 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="text-blue-200 font-mono text-xs tracking-widest mb-4">{t("home.noCommitment")}</div>
                <h2 className="text-4xl font-black text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
                  {t("home.evaluatePlatform")}
                  <br />
                  {t("home.yourInfrastructure")}
                </h2>
                <p className="mt-4 text-blue-100/70 text-sm max-w-md leading-relaxed">
                  {t("home.pocDesc")}
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link to="/inscription">
                  <Button
                    size="lg"
                    className="bg-blue-700 text-white hover:bg-blue-600 active:bg-blue-800 font-bold px-10 rounded-none gap-2 w-full cursor-pointer transition-colors duration-150"
                  >
                    {t("home.startPocBtn")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white border border-white/30 hover:bg-white/10 rounded-none gap-2 font-mono text-sm tracking-wide w-full"
                  >
                    {t("home.talkToExpert")}
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-blue-200/50 text-xs text-center font-mono">
                  {t("home.responseTime")}
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

      </div>
    </PageTransition>
  );
}
