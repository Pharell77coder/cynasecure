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
  ImageOff,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ServiceCard } from "../../components/shared/ServiceCard";
import { homeApi, type CarouselSlide, type HomeCategory, type HomeService } from "../../api/home";
import { type Service } from "../../api/services";
import React from "react";

/* ─── Ticker de menaces (simulation live) ─────────────────────────────── */
const THREAT_EVENTS = [
  { type: "BLOQUÉ", label: "Tentative d'intrusion — AS45102 (CN)", severity: "high" },
  { type: "DÉTECTÉ", label: "Mouvement latéral réseau — endpoint #4812", severity: "med" },
  { type: "BLOQUÉ", label: "Exfiltration DNS — domaine suspect", severity: "high" },
  { type: "ANALYSÉ", label: "Payload chiffré — sandbox détonation", severity: "low" },
  { type: "BLOQUÉ", label: "Credential stuffing — 3 412 tentatives/min", severity: "high" },
  { type: "DÉTECTÉ", label: "Élévation de privilèges — compte service", severity: "med" },
  { type: "BLOQUÉ", label: "C2 callback — Cobalt Strike beacon", severity: "high" },
];

function ThreatTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % THREAT_EVENTS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const ev = THREAT_EVENTS[idx];
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

/* ─── Stat counter animé ──────────────────────────────────────────────── */
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

/* ─── Timeline d'incident ─────────────────────────────────────────────── */
const INCIDENT_STEPS = [
  { icon: AlertTriangle, label: "Détection", time: "T+0s", desc: "Anomalie comportementale identifiée par l'IA" },
  { icon: ScanLine, label: "Corrélation", time: "T+4s", desc: "Croisement avec 140+ flux de renseignement" },
  { icon: Zap, label: "Confinement", time: "T+12s", desc: "Isolation automatique de l'asset compromis" },
  { icon: Terminal, label: "Forensique", time: "T+45s", desc: "Reconstruction de la chaîne d'attaque" },
  { icon: CheckCircle, label: "Remédiation", time: "T+2min", desc: "Patch et restauration à l'état sain" },
];

/* ─── Stats principales ───────────────────────────────────────────────── */
const STATS = [
  { value: 500, suffix: "+", label: "Entreprises protégées", icon: Shield },
  { value: 99, suffix: ".9%", label: "Disponibilité SLA", icon: Activity },
  { value: 14, suffix: "s", label: "MTTD moyen", icon: Clock },
  { value: 3200000, suffix: "", label: "Événements / jour analysés", icon: Database },
];

/* ─── Capacités ───────────────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    icon: Eye,
    title: "XDR unifié",
    tag: "Détection étendue",
    desc: "Corrélation native endpoints, réseau, cloud et identités. Une seule console, zéro angle mort. Réduction du MTTD de 87 % en moyenne.",
    metrics: ["<14s MTTD", "95% faux positifs éliminés"],
  },
  {
    icon: Binary,
    title: "IA comportementale",
    tag: "Machine Learning",
    desc: "Modèles entraînés sur 10 ans d'attaques réelles. Détection d'anomalies sans signatures, adaptative aux environnements de chaque client.",
    metrics: ["10B+ événements d'entraînement", "99.4% de précision"],
  },
  {
    icon: Fingerprint,
    title: "Zero Trust Network",
    tag: "Accès conditionnel",
    desc: "Vérification continue de chaque accès, chaque requête, chaque identité. Micro-segmentation dynamique sans refonte de l'infrastructure.",
    metrics: ["Micro-segmentation L3/L7", "MFA adaptatif"],
  },
  {
    icon: Radio,
    title: "Threat Intelligence",
    tag: "Renseignement",
    desc: "Accès en temps réel aux indicateurs de compromission issus de 140 sources mondiales. Enrichissement automatique de chaque alerte.",
    metrics: ["140+ flux CTI", "Mise à jour <5min"],
  },
  {
    icon: Layers,
    title: "Cloud Security Posture",
    tag: "CSPM / CNAPP",
    desc: "Audit continu de vos configurations AWS, Azure, GCP. Détection de dérives et application de politiques avant tout incident.",
    metrics: ["AWS / Azure / GCP", "Conformité CIS / NIST"],
  },
  {
    icon: Network,
    title: "NDR réseau",
    tag: "Trafic réseau",
    desc: "Analyse du trafic est-ouest et nord-sud par deep packet inspection. Détection de mouvements latéraux invisibles aux outils legacy.",
    metrics: ["DPI 100Gbps", "Protocoles OT/ICS"],
  },
];

/* ─── Comparaison approche ─────────────────────────────────────────────── */
const COMPARISON = [
  { label: "SIEM traditionnel", issues: ["Règles statiques", "Fort taux de faux positifs", "Couverture endpoint nulle", "Temps de déploiement 6-12 mois"] },
  { label: "CynaSecure XDR", advantages: ["IA comportementale", "Précision 99.4%", "Couverture unifiée XDR", "Opérationnel en 48h"] },
];

/* ─── Témoignage ───────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "En six mois, nous avons réduit notre surface d'attaque de 60 % et éliminé la quasi-totalité des faux positifs qui paralysaient notre SOC.",
    author: "RSSI",
    company: "Groupe industriel CAC 40",
    sector: "Industrie",
  },
  {
    quote: "Le déploiement a pris 48 heures. Dès le lendemain, l'IA avait détecté un mouvement latéral que nos outils EDR précédents avaient manqué.",
    author: "Directeur infrastructure",
    company: "Banque régionale européenne",
    sector: "Finance",
  },
];

/* ─── Certifications ───────────────────────────────────────────────────── */
const CERTIFICATIONS = ["ISO 27001", "SOC 2 Type II", "ANSSI PRIS", "HDS", "PCI DSS", "RGPD"];

/* ─── Carousel principal ──────────────────────────────────────────────── */
function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
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
    const t = setInterval(() => go(idx + 1), 5000);
    return () => clearInterval(t);
  }, [idx, total]);

  if (total === 0) return null;

  const slide = slides[idx];

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>
      {/* Background image */}
      {slide.imagePath ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{ backgroundImage: `url(/${slide.imagePath})`, opacity: fade ? 1 : 0 }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gray-950/80" />

      {/* Grid deco */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
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
                Démarrer un POC gratuit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link to="/catalogue">
            <Button variant="ghost" size="lg" className="text-white border border-white/20 hover:bg-white/10 rounded-none gap-2 font-mono text-sm tracking-wide">
              Explorer la plateforme
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Certifications */}
        <div className="mt-16 flex flex-wrap items-center gap-2">
          <span className="text-gray-600 text-xs font-mono tracking-widest mr-2">CERTIFIÉ</span>
          {CERTIFICATIONS.map((c) => (
            <span key={c} className="text-gray-500 border border-gray-800 text-xs font-mono px-2 py-0.5 rounded">{c}</span>
          ))}
        </div>
      </div>

      {/* Navigation dots + arrows */}
      {total > 1 && (
        <>
          <button onClick={() => go(idx - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/30 text-white hover:bg-black/50 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(idx + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/30 text-white hover:bg-black/50 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => go(i)} className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-blue-400" : "bg-white/30 hover:bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
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

  return (
    <div className="space-y-0">

      {/* ══════════════════════════════════════════════════════════════════
          HERO — carrousel éditable
      ══════════════════════════════════════════════════════════════════ */}
      {loadingSlides ? (
        <section className="bg-gray-950" style={{ minHeight: "92vh" }}>
          <div className="container flex items-center justify-center" style={{ minHeight: "92vh" }}>
            <span className="text-gray-700 font-mono text-sm animate-pulse">Chargement…</span>
          </div>
        </section>
      ) : slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        /* Fallback statique si aucune slide */
        <section className="relative bg-gray-950 overflow-hidden" style={{ minHeight: "92vh" }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="relative container flex flex-col justify-center pt-28 pb-24" style={{ minHeight: "92vh" }}>
            <h1 className="text-white font-black leading-none tracking-tight mb-6" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}>
              Stopper les attaques
              <br /><span className="text-blue-400">avant qu'elles frappent.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/inscription">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 gap-2 rounded-none">
                  Démarrer un POC gratuit <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STATS — bandeau sombre
      ══════════════════════════════════════════════════════════════════ */}
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
              <div className="mt-1 text-xs text-gray-500 font-mono tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THREAT INTELLIGENCE — contexte d'attaque
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 py-28">
        <div className="container grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">CONTEXTE</div>
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-6" style={{ letterSpacing: "-0.02em" }}>
              Le paysage des menaces
              <br />
              <span className="text-gray-500">a radicalement changé.</span>
            </h2>
            <div className="space-y-6 text-gray-400 text-sm leading-loose">
              <p>
                Les attaquants opèrent aujourd'hui comme des entreprises : équipes spécialisées,
                outils commerciaux loués, accès initiaux achetés sur des marchés darknet.
                Le temps moyen de latéralisation après compromission initiale est passé sous{" "}
                <span className="text-white font-semibold">19 minutes</span>.
              </p>
              <p>
                Les outils de sécurité en silos — antivirus, SIEM legacy, EDR isolé — ne peuvent
                plus suivre le rythme. Il faut une plateforme capable de{" "}
                <span className="text-white font-semibold">corréler, prioriser et agir</span>{" "}
                en quelques secondes, pas en quelques heures.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { value: "19min", label: "Temps de latéralisation moyen (2024)" },
                { value: "82%", label: "Attaques sans malware identifiable" },
                { value: "4.5M€", label: "Coût moyen d'une violation en Europe" },
              ].map((s) => (
                <div key={s.label} className="border-l-2 border-blue-600 pl-4">
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparaison approche */}
          <div className="space-y-4">
            {/* Legacy */}
            <div className="border border-red-500/20 bg-red-500/5 rounded-none p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-mono text-xs tracking-widest">APPROCHE LEGACY</span>
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

            {/* CynaSecure */}
            <div className="border border-blue-500/30 bg-blue-500/5 rounded-none p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-mono text-xs tracking-widest">CYNAECURE XDR</span>
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
                Voir la plateforme complète <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CAPACITÉS — grille dense, style technique
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-900 py-28 border-y border-gray-800">
        <div className="container">
          <div className="mb-16">
            <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">PLATEFORME</div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                Six capacités. Un seul agent.
              </h2>
              <Link to="/catalogue">
                <Button variant="ghost" className="text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 rounded-none font-mono text-xs tracking-wide gap-2">
                  Catalogue complet <ArrowRight className="h-3 w-3" />
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
                  <span className="text-[10px] font-mono tracking-widest text-gray-600 border border-gray-700 px-2 py-0.5">
                    {cap.tag}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{cap.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{cap.desc}</p>
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

      {/* ══════════════════════════════════════════════════════════════════
          TIMELINE D'INCIDENT — réponse en temps réel
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 py-28">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">RÉPONSE AUTOMATISÉE</div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
            De la détection à la remédiation
            <br />
            <span className="text-gray-500">en moins de deux minutes.</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mb-16 leading-relaxed">
            Notre moteur SOAR orchestre automatiquement la réponse aux incidents les plus courants
            — sans intervention humaine pour les étapes critiques.
          </p>

          {/* Timeline horizontale */}
          <div className="relative">
            {/* Ligne */}
            <div className="absolute top-8 left-0 right-0 h-px bg-gray-800 hidden lg:block" />

            <div className="grid lg:grid-cols-5 gap-8 lg:gap-4">
              {INCIDENT_STEPS.map((step, i) => (
                <div key={step.label} className="relative">
                  {/* Point */}
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
                    <div className="text-gray-500 text-xs leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DOMAINES — couverture complète (éditable depuis admin)
      ══════════════════════════════════════════════════════════════════ */}
      {(loadingCats || categories.length > 0) && (
        <section className="bg-gray-900 py-28 border-y border-gray-800">
          <div className="container space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">COUVERTURE</div>
                <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                  Domaines de protection
                </h2>
                <p className="mt-3 text-gray-500 text-sm max-w-lg">
                  Du poste de travail à l'OT industriel, chaque couche de votre infrastructure
                  est couverte par un capteur natif.
                </p>
              </div>
            </div>

            <div className={`grid gap-px bg-gray-800 ${categories.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-5"}`}>
              {loadingCats ? (
                <p className="col-span-full text-center text-gray-600 py-12 font-mono text-sm">
                  Chargement des domaines…
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
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SOLUTIONS POPULAIRES (éditables depuis admin)
      ══════════════════════════════════════════════════════════════════ */}
      {(loadingTop || topProducts.length > 0) && (
        <section className="bg-gray-950 py-28">
          <div className="container space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">DÉPLOYÉ EN PRODUCTION</div>
                <h2 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                  Solutions les plus adoptées
                </h2>
              </div>
              <Link to="/catalogue">
                <Button variant="ghost" className="text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 rounded-none font-mono text-xs tracking-wide gap-2 flex-shrink-0">
                  Toutes les solutions <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loadingTop ? (
                <p className="col-span-full text-center text-gray-600 py-12 font-mono text-sm">
                  Chargement…
                </p>
              ) : (
                topProducts.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={{
                      id: s.id,
                      name: s.name,
                      description: s.description ?? "",
                      priceMonthly: s.priceMonthly ?? 0,
                      priceYearly: null,
                      image: s.image,
                      category: s.category ?? "",
                      categorySlug: s.categorySlug ?? "",
                      type: s.type ?? "saas",
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
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-900 py-28 border-y border-gray-800">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-12">RETOURS CLIENTS</div>

          <div className="grid lg:grid-cols-2 gap-px bg-gray-800">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-gray-900 p-10">
                <div className="text-4xl text-blue-600 font-serif leading-none mb-6 select-none">
                  "
                </div>
                <blockquote className="text-gray-300 text-base leading-relaxed mb-8 italic">
                  {t.quote}
                </blockquote>
                <div className="border-t border-gray-800 pt-6 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold text-sm">{t.author}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{t.company}</div>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-gray-600 border border-gray-700 px-2 py-0.5">
                    {t.sector}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Logos clients — placeholder minimaliste */}
          <div className="mt-16 flex flex-wrap items-center gap-8 justify-center">
            <span className="text-gray-700 text-xs font-mono tracking-widest">FONT CONFIANCE</span>
            {["Groupe A", "Banque B", "Énergie C", "Infra D", "Santé E", "Défense F"].map((name) => (
              <span key={name} className="text-gray-600 font-bold text-sm tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ARCHITECTURE — notre approche technique
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 py-28">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">ARCHITECTURE</div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-16" style={{ letterSpacing: "-0.02em" }}>
            Conçue pour les environnements critiques.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800">
            {[
              {
                icon: Server,
                title: "Agent léger universel",
                desc: "Un seul agent pour endpoints Windows, Linux, macOS. Empreinte mémoire < 1 %. Déployable via GPO, Ansible ou votre orchestrateur.",
              },
              {
                icon: Cloud,
                title: "Cloud-native, souverain",
                desc: "Infrastructure hébergée en France (SecNumCloud). Aucune donnée ne quitte le territoire européen. Option air-gap disponible.",
              },
              {
                icon: Cpu,
                title: "IA embarquée sur l'agent",
                desc: "Détection offline possible. Le modèle tourne localement — pas de dépendance au cloud pour la protection endpoint.",
              },
              {
                icon: TrendingUp,
                title: "Scalabilité instantanée",
                desc: "De 500 à 500 000 endpoints sans changement d'architecture. Le data lake scale horizontalement sans interruption.",
              },
              {
                icon: Lock,
                title: "Chiffrement de bout en bout",
                desc: "Chiffrement E2E des données en transit et au repos. Clés de chiffrement sous votre contrôle exclusif (BYOK).",
              },
              {
                icon: Globe,
                title: "API-first & intégrations",
                desc: "API REST documentée, webhooks, SDK Python. Intégrations natives ITSM, SOAR, SIEM, IdP du marché.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-950 p-8 hover:bg-gray-900/60 transition-colors">
                <item.icon className="h-5 w-5 text-blue-500 mb-5" />
                <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CTA FINAL — impact fort
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-blue-700 overflow-hidden">
        {/* Grille déco */}
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
            <div className="text-blue-200 font-mono text-xs tracking-widest mb-4">SANS ENGAGEMENT</div>
            <h2 className="text-4xl font-black text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Évaluez la plateforme sur
              <br />
              votre propre infrastructure.
            </h2>
            <p className="mt-4 text-blue-100/70 text-sm max-w-md leading-relaxed">
              POC de 30 jours, déploiement pris en charge par nos ingénieurs.
              Rapport de maturité sécurité offert à l'issue.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link to="/inscription">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 rounded-none gap-2 w-full"
              >
                Démarrer le POC
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border border-white/30 hover:bg-white/10 rounded-none gap-2 font-mono text-sm tracking-wide w-full"
              >
                Parler à un expert
                <Users className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-blue-200/50 text-xs text-center font-mono">
              Réponse sous 4h · Ingénieur dédié
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}