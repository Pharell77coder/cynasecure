import { Mail, MapPin, Phone, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageTransition } from "../../components/ui/PageTransition";
import React from "react";

const SECTIONS = [
  {
    id: "editeur",
    label: "ÉDITEUR DU SITE",
    titre: "Informations sur l'éditeur",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>Le site <span className="text-white font-medium">cynasecure.fr</span> est édité par :</p>
        <div className="border border-gray-800 bg-gray-900 p-5 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-3">
            <Shield className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-gray-300">CynaSecure SAS</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-gray-300">42 avenue de la Grande Armée, 75008 Paris</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-gray-300">contact@cynasecure.fr</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-gray-300">+33 1 42 XX XX XX</span>
          </div>
        </div>
        <p>
          Capital social : 2 500 000 € — RCS Paris 901 234 567 — SIRET 901 234 567 00012
          <br />
          Directeur de la publication : Jean-Baptiste Moreau, Président.
        </p>
      </div>
    ),
  },
  {
    id: "hebergement",
    label: "HÉBERGEMENT",
    titre: "Infrastructure et hébergement",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          L'ensemble de l'infrastructure CynaSecure est hébergée exclusivement sur des
          datacenters situés en France, conformément aux exigences SecNumCloud de l'ANSSI.
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 font-mono text-xs space-y-2">
          <div className="text-gray-300 font-semibold">Fournisseur cloud principal</div>
          <div className="text-gray-500">OVHcloud SAS — 2 rue Kellermann, 59100 Roubaix</div>
          <div className="text-gray-500">Certification SecNumCloud — Qualification ANSSI</div>
        </div>
        <p>
          Aucune donnée client ne transite ou n'est stockée en dehors du territoire de l'Union
          européenne. Les sauvegardes sont chiffrées et répliquées sur deux zones géographiques
          distinctes en France.
        </p>
      </div>
    ),
  },
  {
    id: "propriete",
    label: "PROPRIÉTÉ INTELLECTUELLE",
    titre: "Droits et contenus protégés",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          L'ensemble des éléments composant le site cynasecure.fr — textes, images, graphismes,
          logo, icônes, sons, logiciels — est la propriété exclusive de CynaSecure SAS ou fait
          l'objet d'une autorisation d'utilisation accordée à CynaSecure SAS.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou
          partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
          sauf autorisation écrite préalable de CynaSecure SAS.
        </p>
        <p>
          Le non-respect de cette interdiction constitue une contrefaçon pouvant engager la
          responsabilité civile et pénale du contrefacteur.
        </p>
      </div>
    ),
  },
  {
    id: "donnees",
    label: "DONNÉES PERSONNELLES",
    titre: "Traitement des données",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          CynaSecure SAS traite vos données personnelles dans le respect du Règlement Général
          sur la Protection des Données (RGPD — Règlement UE 2016/679) et de la loi Informatique
          et Libertés modifiée.
        </p>
        <p>
          Le responsable du traitement est CynaSecure SAS, représentée par son Délégué à la
          Protection des Données (DPO) joignable à{" "}
          <span className="text-blue-400 font-mono">dpo@cynasecure.fr</span>.
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 space-y-3">
          <p className="text-white text-xs font-semibold">Vos droits</p>
          <ul className="space-y-1.5 text-xs">
            {[
              "Droit d'accès à vos données personnelles",
              "Droit de rectification des données inexactes",
              "Droit à l'effacement (droit à l'oubli)",
              "Droit à la limitation du traitement",
              "Droit à la portabilité de vos données",
              "Droit d'opposition au traitement",
            ].map((d) => (
              <li key={d} className="flex items-center gap-2 text-gray-400">
                <span className="text-blue-500">›</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
        <p>
          Pour exercer ces droits, contactez-nous à{" "}
          <span className="text-blue-400 font-mono">dpo@cynasecure.fr</span> ou par courrier
          à notre siège social. Vous disposez également du droit d'introduire une réclamation
          auprès de la CNIL (www.cnil.fr).
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    label: "COOKIES",
    titre: "Utilisation des cookies",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Le site cynasecure.fr utilise des cookies strictement nécessaires au fonctionnement
          technique de la plateforme (session utilisateur, préférences de langue, sécurité CSRF).
          Aucun cookie publicitaire ou de traçage tiers n'est déposé sans votre consentement explicite.
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs font-mono border-b border-gray-800 pb-2">
            <span className="text-gray-600">NOM</span>
            <span className="text-gray-600">FINALITÉ</span>
            <span className="text-gray-600">DURÉE</span>
          </div>
          {[
            ["session_token", "Authentification", "Session"],
            ["csrf_token", "Sécurité CSRF", "Session"],
            ["preferences", "Préférences UI", "12 mois"],
          ].map(([nom, fin, dur]) => (
            <div key={nom} className="grid grid-cols-3 gap-2 text-xs">
              <span className="text-blue-400 font-mono">{nom}</span>
              <span className="text-gray-400">{fin}</span>
              <span className="text-gray-500">{dur}</span>
            </div>
          ))}
        </div>
        <p>
          Vous pouvez paramétrer votre navigateur pour refuser les cookies. Cela peut affecter
          le bon fonctionnement de certaines parties de la plateforme.
        </p>
      </div>
    ),
  },
  {
    id: "responsabilite",
    label: "RESPONSABILITÉ",
    titre: "Limitation de responsabilité",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          CynaSecure SAS s'efforce d'assurer l'exactitude et la mise à jour des informations
          publiées sur ce site. Toutefois, elle ne peut garantir l'exactitude, la complétude
          ou l'actualité des informations diffusées.
        </p>
        <p>
          CynaSecure SAS se réserve le droit de corriger, à tout moment et sans préavis, le
          contenu de ce site. Elle ne saurait être tenue responsable des dommages directs ou
          indirects résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.
        </p>
        <p>
          Les liens hypertextes mis en place vers d'autres ressources ne sauraient engager la
          responsabilité de CynaSecure SAS quant au contenu de ces ressources externes.
        </p>
      </div>
    ),
  },
  {
    id: "droit",
    label: "DROIT APPLICABLE",
    titre: "Loi applicable et juridiction",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige,
          et à défaut de résolution amiable, les tribunaux compétents sont ceux du ressort
          de la Cour d'appel de Paris.
        </p>
        <p>
          Dernière mise à jour : <span className="text-white font-mono">23 mai 2026</span>
        </p>
      </div>
    ),
  },
];

export default function MentionsLegalesPage() {
  const { t } = useTranslation();
  const disclaimer = t("legal.unofficialTranslation");

  return (
    <PageTransition>
    <div className="bg-gray-950 min-h-screen">

      {/* En-tête */}
      <section className="relative overflow-hidden pt-28 pb-16 border-b border-gray-800">
        <div
          className="absolute top-0 right-0 w-[500px] h-[400px] opacity-10 pointer-events-none"
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

        <div className="relative container max-w-4xl">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">{t("legal.tag")}</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em" }}
          >
            {t("legal.mentionsTitle")}
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            {t("legal.mentionsVersion")}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <div className="container max-w-4xl py-16">

        {/* Unofficial translation disclaimer (EN/ES only) */}
        {disclaimer && (
          <div className="mb-8 border border-amber-500/30 bg-amber-500/5 px-5 py-3 text-amber-300 text-xs font-mono leading-relaxed">
            {disclaimer}
          </div>
        )}

        <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">

          {/* Navigation latérale */}
          <nav className="hidden lg:block sticky top-8 space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-xs font-mono text-gray-600 hover:text-blue-400 transition-colors py-1 border-l border-gray-800 hover:border-blue-500/40 pl-3"
              >
                {s.label}
              </a>
            ))}
          </nav>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id}>
                <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">
                  {String(i + 1).padStart(2, "0")} — {s.label}
                </div>
                <h2
                  className="text-xl font-bold text-white mb-5"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {s.titre}
                </h2>
                {s.contenu}
              </section>
            ))}
          </div>

        </div>
      </div>

    </div>
    </PageTransition>
  );
}
