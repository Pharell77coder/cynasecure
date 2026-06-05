import React from "react";
import { useTranslation } from "react-i18next";
import { PageTransition } from "../../components/ui/PageTransition";

const SECTIONS = [
  {
    id: "objet",
    label: "OBJET",
    titre: "Objet et champ d'application",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
          de la plateforme CynaSecure, accessible à l'adresse{" "}
          <span className="text-blue-400 font-mono">cynasecure.fr</span> et de ses sous-domaines,
          ainsi que de l'ensemble des services associés.
        </p>
        <p>
          En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve les
          présentes CGU dans leur version en vigueur au moment de votre utilisation. Si vous
          n'acceptez pas ces conditions, vous devez cesser d'utiliser la plateforme.
        </p>
        <p>
          CynaSecure SAS se réserve le droit de modifier les présentes CGU à tout moment.
          Les utilisateurs seront informés de toute modification substantielle par e-mail ou
          par notification dans l'interface. L'utilisation continue de la plateforme après
          modification vaut acceptation des nouvelles conditions.
        </p>
      </div>
    ),
  },
  {
    id: "compte",
    label: "COMPTE UTILISATEUR",
    titre: "Création et gestion de compte",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          L'accès aux fonctionnalités de la plateforme nécessite la création d'un compte.
          Vous devez fournir des informations exactes, complètes et à jour lors de votre
          inscription et maintenir ces informations à jour.
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 space-y-3">
          <p className="text-white text-xs font-semibold">Engagements liés à votre compte</p>
          <ul className="space-y-2 text-xs">
            {[
              "Vous êtes seul responsable de la confidentialité de vos identifiants.",
              "Vous ne pouvez pas céder ou partager votre compte à un tiers.",
              "Toute utilisation de votre compte est présumée être de votre fait.",
              "Vous devez notifier immédiatement tout accès non autorisé à security@cynasecure.fr.",
              "Un seul compte par personne physique — les comptes d'organisations sont distincts.",
            ].map((e) => (
              <li key={e} className="flex items-start gap-2 text-gray-400">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
        <p>
          CynaSecure SAS se réserve le droit de suspendre ou supprimer tout compte en cas de
          violation des présentes CGU, sans préavis ni indemnité.
        </p>
      </div>
    ),
  },
  {
    id: "services",
    label: "SERVICES",
    titre: "Description des services",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          La plateforme CynaSecure propose des services de cybersécurité managés, notamment :
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { tag: "XDR", desc: "Détection et réponse étendues sur endpoints, réseau et cloud" },
            { tag: "SOC Managé", desc: "Centre d'opérations de sécurité disponible 24/7" },
            { tag: "CSPM", desc: "Gestion de la posture de sécurité cloud (AWS, Azure, GCP)" },
            { tag: "NDR", desc: "Détection et réponse réseau par analyse de flux" },
            { tag: "Zero Trust", desc: "Accès conditionnel et micro-segmentation réseau" },
            { tag: "CTI", desc: "Renseignement sur les menaces en temps réel" },
          ].map((s) => (
            <div key={s.tag} className="border border-gray-800 bg-gray-900 p-4">
              <span className="text-blue-400 font-mono text-xs">{s.tag}</span>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <p>
          Les caractéristiques détaillées de chaque service, les niveaux de service (SLA) et
          les conditions tarifaires sont précisées dans les contrats spécifiques et les fiches
          produit accessibles depuis le catalogue.
        </p>
      </div>
    ),
  },
  {
    id: "utilisation",
    label: "UTILISATION ACCEPTABLE",
    titre: "Règles d'utilisation acceptable",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          La plateforme CynaSecure est mise à disposition exclusivement dans un cadre
          professionnel légal. En utilisant nos services, vous vous engagez à ne pas :
        </p>
        <div className="border border-red-500/20 bg-red-500/5 p-5 space-y-2">
          <p className="text-red-400 font-mono text-xs tracking-widest mb-3">UTILISATIONS INTERDITES</p>
          <ul className="space-y-2 text-xs">
            {[
              "Utiliser la plateforme pour mener des activités illicites ou frauduleuses",
              "Tenter d'accéder à des systèmes ou données sans autorisation explicite",
              "Utiliser les outils de la plateforme contre des tiers non consentants",
              "Contourner, désactiver ou interférer avec les mécanismes de sécurité",
              "Revendre, sous-licencier ou redistribuer l'accès à la plateforme",
              "Collecter des données d'autres utilisateurs sans leur consentement",
              "Surcharger intentionnellement l'infrastructure par des requêtes excessives",
            ].map((r) => (
              <li key={r} className="flex items-start gap-2 text-gray-400">
                <span className="text-red-500 mt-0.5 flex-shrink-0">×</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <p>
          Tout manquement à ces règles entraîne la résiliation immédiate de l'accès et peut
          donner lieu à des poursuites judiciaires.
        </p>
      </div>
    ),
  },
  {
    id: "donnees",
    label: "DONNÉES PERSONNELLES",
    titre: "Protection des données (RGPD)",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          CynaSecure SAS agit en qualité de responsable de traitement pour les données
          personnelles collectées dans le cadre de la gestion de votre compte (identité,
          e-mail, historique de connexion).
        </p>
        <p>
          Pour les données que vous confiez à la plateforme dans le cadre de vos opérations
          de sécurité (journaux, alertes, assets), CynaSecure SAS agit en qualité de
          sous-traitant au sens de l'article 28 du RGPD. Un DPA (Data Processing Agreement)
          est disponible sur demande.
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Durée de conservation</p>
              <p className="text-gray-300">3 ans après la fin du contrat</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Base légale</p>
              <p className="text-gray-300">Exécution du contrat (art. 6.1.b RGPD)</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Transferts hors UE</p>
              <p className="text-gray-300">Aucun — données stockées en France</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">DPO</p>
              <p className="text-blue-400 font-mono">dpo@cynasecure.fr</p>
            </div>
          </div>
        </div>
        <p>
          Vous disposez des droits d'accès, rectification, effacement, limitation, portabilité
          et opposition. Pour les exercer : <span className="text-blue-400 font-mono">dpo@cynasecure.fr</span>.
          Vous pouvez également déposer une réclamation auprès de la CNIL.
        </p>
      </div>
    ),
  },
  {
    id: "tarifs",
    label: "TARIFICATION",
    titre: "Abonnements et facturation",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Les tarifs des services sont indiqués en euros HT sur les fiches produit du catalogue.
          Les prix peuvent évoluer — toute modification tarifaire sera communiquée 30 jours
          avant son entrée en vigueur pour les abonnements en cours.
        </p>
        <p>
          Les abonnements sont facturés mensuellement ou annuellement selon le plan souscrit.
          Le paiement est dû à la date d'échéance figurant sur la facture. Tout retard de
          paiement entraîne l'application de pénalités de retard au taux légal majoré de 5 points.
        </p>
        <p>
          En cas de non-paiement persistant, CynaSecure SAS se réserve le droit de suspendre
          l'accès à la plateforme après mise en demeure restée sans suite pendant 15 jours.
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
          CynaSecure SAS s'engage à mettre en œuvre tous les moyens techniques raisonnables
          pour assurer la disponibilité et la sécurité de la plateforme. La disponibilité
          contractuelle est précisée dans le SLA associé à votre abonnement.
        </p>
        <p>
          CynaSecure SAS ne saurait être tenue responsable des dommages indirects, immatériels
          ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser la
          plateforme, notamment la perte de données, manque à gagner ou atteinte à la réputation.
        </p>
        <p>
          En tout état de cause, la responsabilité de CynaSecure SAS est limitée au montant
          des sommes effectivement versées par le client au cours des 12 mois précédant le
          fait générateur du dommage.
        </p>
      </div>
    ),
  },
  {
    id: "resiliation",
    label: "RÉSILIATION",
    titre: "Résiliation du compte",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre espace
          utilisateur ou en contactant <span className="text-blue-400 font-mono">support@cynasecure.fr</span>.
          La résiliation prend effet à la fin de la période d'abonnement en cours.
        </p>
        <p>
          Après résiliation, vos données sont conservées pendant 90 jours pour vous permettre
          d'en extraire une copie, puis supprimées définitivement de nos systèmes conformément
          à notre politique de rétention.
        </p>
        <p>
          CynaSecure SAS peut résilier votre accès avec un préavis de 30 jours pour tout motif,
          ou immédiatement en cas de violation des présentes CGU.
        </p>
      </div>
    ),
  },
  {
    id: "droit",
    label: "DROIT APPLICABLE",
    titre: "Droit applicable et litiges",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige relatif à
          l'interprétation ou à l'exécution des présentes, les parties s'engagent à rechercher
          une solution amiable avant tout recours judiciaire.
        </p>
        <p>
          À défaut de résolution amiable dans un délai de 30 jours, tout litige sera soumis
          à la compétence exclusive des tribunaux du ressort de la Cour d'appel de Paris,
          même en cas d'appel en garantie ou de pluralité de défendeurs.
        </p>
        <p>
          Version en vigueur :{" "}
          <span className="text-white font-mono">23 mai 2026</span>
        </p>
      </div>
    ),
  },
];

export default function CguPage() {
  const { t } = useTranslation();
  const disclaimer = t("legal.unofficialTranslation");

  return (
    <PageTransition>
    <div className="bg-gray-950 min-h-screen">

      {/* En-tête */}
      <section className="relative overflow-hidden pt-28 pb-16 border-b border-gray-800">
        <div
          className="absolute top-0 left-0 w-[500px] h-[400px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />

        <div className="relative container max-w-4xl">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">{t("legal.tag")}</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em" }}
          >
            {t("legal.cguTitle")}
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            {t("legal.cguVersion")}
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
