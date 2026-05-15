import React from "react";
import { Link } from "react-router-dom";
import { Fingerprint, Network, Lock } from "lucide-react";

export function Footer() {
  const sections = [
    {
      title: "Solutions",
      links: [
        { label: "SOC managé", to: "/catalogue?cat=soc" },
        { label: "Protection Endpoint", to: "/catalogue?cat=edr" },
        { label: "Détection étendue (XDR)", to: "/catalogue?cat=xdr" },
        { label: "Sécurité Cloud", to: "/catalogue?cat=cloud" },
      ],
      icon: <Network className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Entreprise",
      links: [
        { label: "Notre mission", to: "/a-propos" },
        { label: "Nous contacter", to: "/contact" },
        { label: "Recrutement", to: "/carrieres" },
        { label: "Actualités", to: "/blog" },
      ],
      icon: <Fingerprint className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Légal",
      links: [
        { label: "Mentions légales", to: "/mentions-legales" },
        { label: "Conditions générales", to: "/cgv" },
        { label: "Confidentialité", to: "/confidentialite" },
      ],
      icon: <Lock className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <footer className="relative border-t border-gray-800 bg-gray-950 mt-32 pt-20 pb-10">

      {/* Glow bleu subtil */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative container">

        {/* Haut du footer */}
        <div className="grid gap-12 md:grid-cols-4">

          {/* Identité */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">

              {/* Favicon à la place du Shield */}
              <img
                src="/favicon.ico"
                alt="CynaSecure"
                className="h-5 w-5 object-contain"
              />

              <span className="text-xl font-bold tracking-tight text-white">
                CynaSecure
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Plateforme XDR de nouvelle génération conçue pour protéger les
              infrastructures critiques, du cloud aux endpoints.
            </p>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
                {section.icon}
                {section.title}
              </h4>

              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-500 hover:text-blue-400 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ligne séparatrice */}
        <div className="mt-16 border-t border-gray-800 pt-6 text-center">
          <p className="text-xs text-gray-600 font-mono tracking-widest">
            © {new Date().getFullYear()} CynaSecure — Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
