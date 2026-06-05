import React from "react";
import { Link } from "react-router-dom";
import { Fingerprint, Network, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  const sections = [
    {
      key: "solutions",
      title: t("common.footerSolutions"),
      links: [
        { label: "SOC managé", to: "/catalogue?cat=soc" },
        { label: "Protection Endpoint", to: "/catalogue?cat=edr" },
        { label: "Détection étendue (XDR)", to: "/catalogue?cat=xdr" },
        { label: "Sécurité Cloud", to: "/catalogue?cat=cloud" },
      ],
      icon: <Network className="h-4 w-4 text-blue-500" aria-hidden="true" />,
    },
    {
      key: "company",
      title: t("common.footerCompany"),
      links: [
        { label: "Notre mission", to: "/a-propos" },
        { label: "Nous contacter", to: "/contact" },
        { label: "Recrutement", to: "/carrieres" },
        { label: "Actualités", to: "/blog" },
      ],
      icon: <Fingerprint className="h-4 w-4 text-blue-500" aria-hidden="true" />,
    },
    {
      key: "legal",
      title: t("common.footerLegal"),
      links: [
        { label: "Mentions légales", to: "/mentions-legales" },
        { label: "Conditions générales", to: "/cgv" },
        { label: "Confidentialité", to: "/confidentialite" },
      ],
      icon: <Lock className="h-4 w-4 text-blue-500" aria-hidden="true" />,
    },
  ];

  return (
    <footer className="relative border-t border-light-border bg-slate-50 pt-20 pb-10">
      <div className="relative container">

        <div className="grid gap-12 md:grid-cols-4">

          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2" aria-label="CynaSecure — Accueil">
              <img src="/favicon.ico" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
              <span className="text-xl font-bold tracking-tight text-slate-900">CynaSecure</span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              {t("common.footerDesc")}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {["ISO 27001", "SOC 2", "ANSSI"].map((c) => (
                <span key={c} className="inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 font-mono text-[10px] tracking-wide">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <nav key={section.key} aria-label={section.title}>
              <h2 className="mb-5 font-mono text-[0.65rem] font-medium tracking-[0.18em] uppercase text-slate-400 flex items-center gap-2">
                {section.icon}
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-slate-500 hover:text-blue-600 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 border-t border-light-border pt-6 text-center">
          <p className="text-xs text-slate-400 font-mono tracking-widest">
            {t("common.footerCopyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
