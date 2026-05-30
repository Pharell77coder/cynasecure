import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Users, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";
import { useTranslation } from "react-i18next";
import React from "react";

export default function AProposPage() {
  const { t } = useTranslation();

  const VALEURS = [
    {
      icon: Eye,
      titre: t("legal.valTransparenceTitle"),
      texte: t("legal.valTransparenceText"),
    },
    {
      icon: Lock,
      titre: t("legal.valSouveraineteTitle"),
      texte: t("legal.valSouveraineteText"),
    },
    {
      icon: Zap,
      titre: t("legal.valEfficaciteTitle"),
      texte: t("legal.valEfficaciteText"),
    },
    {
      icon: Users,
      titre: t("legal.valPartenariatTitle"),
      texte: t("legal.valPartenariatText"),
    },
  ];

  const CHIFFRES = [
    { valeur: "2019", label: t("legal.chiffreFondation"), note: t("legal.chiffreFondationNote") },
    { valeur: "140+", label: t("legal.chiffreExperts"), note: t("legal.chiffreExpertsNote") },
    { valeur: "500+", label: t("legal.chiffreOrgs"), note: t("legal.chiffreOrgsNote") },
    { valeur: "24/7", label: t("legal.chiffreSoc"), note: t("legal.chiffreSocNote") },
  ];

  return (
    <PageTransition>
    <div className="bg-gray-950 min-h-screen">

      {/* En-tête */}
      <section className="relative overflow-hidden pt-28 pb-20 border-b border-gray-800">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative container max-w-3xl">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">{t("legal.aboutTag")}</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-6"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
          >
            {t("legal.aboutTitle")}
            <br />
            <span className="text-blue-400">{t("legal.aboutTitleHighlight")}</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl">
            {t("legal.aboutDesc")}
          </p>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="border-b border-gray-800">
        <div className="container grid grid-cols-2 md:grid-cols-4">
          {CHIFFRES.map((c, i) => (
            <div
              key={c.label}
              className={`py-10 px-6 ${i < 3 ? "border-r border-gray-800" : ""}`}
            >
              <div className="text-3xl font-black text-white tracking-tight">{c.valeur}</div>
              <div className="mt-1 text-sm text-white font-semibold">{c.label}</div>
              <div className="mt-0.5 text-xs text-gray-600 font-mono">{c.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Notre histoire */}
      <section className="py-24 border-b border-gray-800">
        <div className="container grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("legal.aboutOrigin")}</div>
            <h2
              className="text-3xl font-black text-white tracking-tight mb-8"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t("legal.aboutOriginTitle")}
            </h2>

            <div className="space-y-5 text-gray-400 text-sm leading-loose">
              <p>{t("legal.aboutOriginP1")}</p>
              <p>{t("legal.aboutOriginP2")}</p>
              <p>{t("legal.aboutOriginP3")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-800 bg-gray-900 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2019</div>
              <p className="text-white font-semibold text-sm mb-1">{t("legal.timeline2019Title")}</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {t("legal.timeline2019Desc")}
              </p>
            </div>
            <div className="border border-gray-800 bg-gray-900 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2021</div>
              <p className="text-white font-semibold text-sm mb-1">{t("legal.timeline2021Title")}</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {t("legal.timeline2021Desc")}
              </p>
            </div>
            <div className="border border-gray-800 bg-gray-900 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2023</div>
              <p className="text-white font-semibold text-sm mb-1">{t("legal.timeline2023Title")}</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {t("legal.timeline2023Desc")}
              </p>
            </div>
            <div className="border border-blue-500/30 bg-blue-500/5 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2025</div>
              <p className="text-white font-semibold text-sm mb-1">{t("legal.timeline2025Title")}</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {t("legal.timeline2025Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-24 border-b border-gray-800 bg-gray-900">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("legal.aboutValues")}</div>
          <h2
            className="text-3xl font-black text-white tracking-tight mb-14"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("legal.aboutValuesTitle")}
          </h2>

          <div className="grid md:grid-cols-2 gap-px bg-gray-800">
            {VALEURS.map((v) => (
              <div key={v.titre} className="bg-gray-900 p-8 hover:bg-gray-800/60 transition-colors">
                <v.icon className="h-5 w-5 text-blue-500 mb-5" />
                <h3 className="text-white font-bold text-base mb-3">{v.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 border-b border-gray-800">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("legal.aboutCompliance")}</div>
          <h2
            className="text-2xl font-black text-white tracking-tight mb-10"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("legal.aboutComplianceTitle")}
          </h2>

          <div className="flex flex-wrap gap-3">
            {["ISO 27001", "SOC 2 Type II", "ANSSI PRIS", "HDS", "PCI DSS", "RGPD", "SecNumCloud", "NIS 2"].map((c) => (
              <span
                key={c}
                className="border border-gray-700 text-gray-300 font-mono text-xs px-4 py-2 hover:border-blue-500/40 hover:text-blue-300 transition-colors"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg">{t("legal.aboutCtaTitle")}</p>
            <p className="text-gray-500 text-sm mt-1">
              {t("legal.aboutCtaDesc")}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/catalogue">
              <Button
                variant="ghost"
                className="border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-none font-mono text-xs tracking-wide gap-2"
              >
                {t("legal.aboutCtaExplore")}
                <Globe className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/inscription">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-none gap-2 font-semibold">
                {t("legal.aboutCtaPoc")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
    </PageTransition>
  );
}
