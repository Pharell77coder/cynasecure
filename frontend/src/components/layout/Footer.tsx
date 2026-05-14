import { Shield } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  const cols = [
    {
      title: "Solutions",
      links: [
        { label: "SOC Managé", to: "/catalogue?cat=soc" },
        { label: "EDR / Endpoint", to: "/catalogue?cat=edr" },
        { label: "XDR Étendu", to: "/catalogue?cat=xdr" },
        { label: "Cloud Security", to: "/catalogue?cat=cloud" },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos", to: "/a-propos" },
        { label: "Contact", to: "/contact" },
        { label: "Carrières", to: "/carrieres" },
        { label: "Blog", to: "/blog" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "Mentions légales", to: "/mentions-legales" },
        { label: "CGV", to: "/cgv" },
        { label: "Politique de confidentialité", to: "/confidentialite" },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo + description */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                Cyna<span className="text-primary">Secure</span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground">
              Solutions de cybersécurité SaaS pour protéger votre entreprise
              contre les menaces modernes.
            </p>
          </div>

          {/* Colonnes dynamiques */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {col.title}
              </h4>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bas de page */}
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 CynaSecure. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
