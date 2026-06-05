import React from "react";
import { useTranslation } from "react-i18next";
import { PageTransition } from "../../components/ui/PageTransition";

const SECTIONS = [
  {
    id: "intro",
    label: "INTRODUCTION",
    titre: "Notre engagement",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          CynaSecure SAS accorde une importance fondamentale à la protection de vos données
          personnelles. En tant que plateforme de cybersécurité, nous appliquons à nos propres
          pratiques les mêmes exigences que celles que nous imposons à nos systèmes de protection.
        </p>
        <p>
          La présente politique décrit quelles données nous collectons, pourquoi, comment nous
          les utilisons et quels droits vous avez sur celles-ci. Elle s'applique à l'ensemble
          des services CynaSecure — site web, plateforme SaaS, SOC managé et API.
        </p>
        <p>
          Nous sommes soumis au Règlement Général sur la Protection des Données (RGPD —
          Règlement UE 2016/679) et à la loi Informatique et Libertés modifiée. Notre
          Délégué à la Protection des Données (DPO) est joignable à{" "}
          <span className="text-blue-400 font-mono">dpo@cynasecure.fr</span>.
        </p>
      </div>
    ),
  },
  {
    id: "collecte",
    label: "DONNÉES COLLECTÉES",
    titre: "Quelles données nous collectons",
    contenu: (
      <div className="space-y-5 text-gray-400 text-sm leading-relaxed">
        <p>Nous collectons uniquement les données strictement nécessaires à la fourniture de nos services.</p>

        <div className="space-y-3">
          <div className="border border-gray-800 bg-gray-900 p-5">
            <p className="text-white font-semibold text-xs mb-3">Données de compte</p>
            <ul className="space-y-1.5 text-xs">
              {[
                "Nom, prénom, adresse e-mail professionnelle",
                "Organisation et rôle (RSSI, administrateur, analyste…)",
                "Mot de passe haché (bcrypt, jamais en clair)",
                "Date et adresse IP de création du compte",
              ].map((d) => (
                <li key={d} className="flex items-start gap-2 text-gray-400">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-gray-800 bg-gray-900 p-5">
            <p className="text-white font-semibold text-xs mb-3">Données d'utilisation</p>
            <ul className="space-y-1.5 text-xs">
              {[
                "Journaux de connexion (IP, horodatage, user-agent)",
                "Actions réalisées dans l'interface (navigation, recherches)",
                "Préférences et paramètres de l'interface",
                "Tickets support et échanges avec nos équipes",
              ].map((d) => (
                <li key={d} className="flex items-start gap-2 text-gray-400">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-gray-800 bg-gray-900 p-5">
            <p className="text-white font-semibold text-xs mb-3">Données opérationnelles (clients SOC/XDR)</p>
            <ul className="space-y-1.5 text-xs">
              {[
                "Journaux de sécurité, alertes et événements de vos systèmes",
                "Inventaire des assets que vous déclarez dans la plateforme",
                "Configurations et règles de détection personnalisées",
                "Rapports et exports générés depuis la plateforme",
              ].map((d) => (
                <li key={d} className="flex items-start gap-2 text-gray-400">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                  {d}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 text-xs mt-3 italic">
              Pour ces données, CynaSecure agit en qualité de sous-traitant — vous en êtes
              le responsable de traitement.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "finalites",
    label: "FINALITÉS",
    titre: "Pourquoi nous utilisons vos données",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <div className="border border-gray-800 bg-gray-900 p-5">
          <div className="grid grid-cols-3 gap-3 text-xs font-mono border-b border-gray-800 pb-2 mb-3">
            <span className="text-gray-600">FINALITÉ</span>
            <span className="text-gray-600">BASE LÉGALE</span>
            <span className="text-gray-600">DURÉE</span>
          </div>
          {[
            ["Gestion du compte et authentification", "Exécution du contrat", "Durée du contrat + 3 ans"],
            ["Fourniture des services XDR/SOC", "Exécution du contrat", "Durée du contrat + 90 jours"],
            ["Facturation et comptabilité", "Obligation légale", "10 ans (art. L.123-22 C.com)"],
            ["Support client et incidents", "Intérêt légitime", "3 ans"],
            ["Amélioration des modèles de détection", "Intérêt légitime", "Données anonymisées"],
            ["Envoi de communications produit", "Consentement", "Jusqu'au désabonnement"],
            ["Détection de fraude et sécurité", "Obligation légale / intérêt légitime", "1 an"],
          ].map(([fin, base, dur]) => (
            <div key={fin} className="grid grid-cols-3 gap-3 text-xs py-2 border-b border-gray-900">
              <span className="text-gray-300">{fin}</span>
              <span className="text-gray-500">{base}</span>
              <span className="text-gray-600 font-mono">{dur}</span>
            </div>
          ))}
        </div>
        <p>
          Nous ne traitons jamais vos données à des fins publicitaires ni ne les revendons
          à des tiers. L'amélioration de nos modèles de détection utilise exclusivement des
          données agrégées et anonymisées.
        </p>
      </div>
    ),
  },
  {
    id: "partage",
    label: "PARTAGE",
    titre: "Avec qui nous partageons vos données",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement dans
          les situations suivantes :
        </p>
        <div className="space-y-3">
          {[
            {
              destinataire: "Sous-traitants techniques",
              detail: "Hébergeurs cloud (OVHcloud, France), outils internes d'exploitation — tous liés par contrat de sous-traitance conforme art. 28 RGPD.",
              zone: "Union européenne",
            },
            {
              destinataire: "Équipes CynaSecure",
              detail: "Accès strictement limité aux analystes SOC et ingénieurs support dans le cadre de la prestation contractuelle, sur le principe du moindre privilège.",
              zone: "France",
            },
            {
              destinataire: "Autorités légales",
              detail: "Sur réquisition judiciaire valide uniquement — nous notifions le client dans les limites de ce qu'autorise la loi.",
              zone: "Selon réquisition",
            },
          ].map((r) => (
            <div key={r.destinataire} className="border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-xs">{r.destinataire}</p>
                <span className="text-[10px] font-mono text-gray-600 border border-gray-700 px-2 py-0.5">
                  {r.zone}
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{r.detail}</p>
            </div>
          ))}
        </div>
        <p>
          Aucun transfert de données vers des pays hors Union européenne n'est effectué.
          L'intégralité de notre infrastructure est hébergée en France.
        </p>
      </div>
    ),
  },
  {
    id: "securite",
    label: "SÉCURITÉ",
    titre: "Comment nous protégeons vos données",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          La sécurité des données n'est pas un module optionnel — c'est le cœur de notre métier.
          Nous appliquons à notre propre infrastructure les mêmes standards que nous déployons
          chez nos clients.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Chiffrement au repos", detail: "AES-256 pour toutes les données stockées" },
            { label: "Chiffrement en transit", detail: "TLS 1.3 — pas de version antérieure acceptée" },
            { label: "Gestion des secrets", detail: "Vault (HashiCorp) — rotation automatique des clés" },
            { label: "Contrôle d'accès", detail: "RBAC + MFA obligatoire pour tous les accès internes" },
            { label: "Tests de pénétration", detail: "Audit annuel par un prestataire PASSI qualifié ANSSI" },
            { label: "BYOK disponible", detail: "Apportez votre propre clé de chiffrement (entreprise)" },
          ].map((m) => (
            <div key={m.label} className="border border-gray-800 bg-gray-900 p-4">
              <p className="text-white font-semibold text-xs mb-1">{m.label}</p>
              <p className="text-gray-500 text-xs">{m.detail}</p>
            </div>
          ))}
        </div>
        <p>
          En cas de violation de données susceptible d'affecter vos droits et libertés, nous
          notifions la CNIL dans les 72 heures et vous en informons sans délai injustifié,
          conformément à l'article 33 du RGPD.
        </p>
      </div>
    ),
  },
  {
    id: "droits",
    label: "VOS DROITS",
    titre: "Exercer vos droits",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits
          suivants sur vos données personnelles :
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 space-y-3">
          {[
            { droit: "Accès", desc: "Obtenir une copie de toutes les données que nous détenons sur vous." },
            { droit: "Rectification", desc: "Corriger des informations inexactes ou incomplètes." },
            { droit: "Effacement", desc: "Demander la suppression de vos données (sous réserve d'obligations légales)." },
            { droit: "Limitation", desc: "Restreindre l'utilisation de vos données dans certains cas." },
            { droit: "Portabilité", desc: "Recevoir vos données dans un format structuré et lisible par machine." },
            { droit: "Opposition", desc: "Vous opposer au traitement fondé sur l'intérêt légitime." },
            { droit: "Retrait du consentement", desc: "Retirer votre consentement à tout moment sans que cela n'affecte les traitements passés." },
          ].map((r) => (
            <div key={r.droit} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
              <span className="text-blue-400 font-mono text-xs w-36 flex-shrink-0 pt-0.5">{r.droit}</span>
              <span className="text-gray-500 text-xs leading-relaxed">{r.desc}</span>
            </div>
          ))}
        </div>
        <div className="border border-blue-500/20 bg-blue-500/5 p-5 space-y-2">
          <p className="text-white font-semibold text-xs">Comment exercer vos droits</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Envoyez votre demande à{" "}
            <span className="text-blue-400 font-mono">dpo@cynasecure.fr</span> en précisant
            votre identité et le droit que vous souhaitez exercer. Nous répondons dans un
            délai maximum d'un mois. En cas de réponse insatisfaisante, vous pouvez saisir
            la <span className="text-white">CNIL</span> (www.cnil.fr) ou toute autorité de
            contrôle européenne compétente.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "cookies",
    label: "COOKIES",
    titre: "Politique de cookies",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Nous utilisons uniquement des cookies nécessaires au bon fonctionnement de la
          plateforme. Aucun cookie publicitaire ni outil de suivi comportemental tiers
          n'est actif par défaut.
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5">
          <div className="grid grid-cols-4 gap-2 text-xs font-mono border-b border-gray-800 pb-2 mb-3">
            <span className="text-gray-600">NOM</span>
            <span className="text-gray-600">TYPE</span>
            <span className="text-gray-600">FINALITÉ</span>
            <span className="text-gray-600">DURÉE</span>
          </div>
          {[
            ["session_token", "Technique", "Authentification", "Session"],
            ["csrf_token", "Sécurité", "Protection CSRF", "Session"],
            ["preferences", "Fonctionnel", "Préférences UI", "12 mois"],
            ["consent", "Légal", "Mémorisation du consentement", "13 mois"],
          ].map(([nom, type, fin, dur]) => (
            <div key={nom} className="grid grid-cols-4 gap-2 text-xs py-1.5 border-b border-gray-900 last:border-0">
              <span className="text-blue-400 font-mono">{nom}</span>
              <span className="text-gray-500">{type}</span>
              <span className="text-gray-400">{fin}</span>
              <span className="text-gray-600">{dur}</span>
            </div>
          ))}
        </div>
        <p>
          Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies.
          Notez que la désactivation des cookies techniques peut empêcher la connexion à
          la plateforme.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    label: "CONTACT",
    titre: "Nous contacter",
    contenu: (
      <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
        <p>
          Pour toute question relative à cette politique ou à l'exercice de vos droits :
        </p>
        <div className="border border-gray-800 bg-gray-900 p-5 font-mono text-xs space-y-3">
          <div>
            <p className="text-gray-600 mb-0.5">DPO — Délégué à la Protection des Données</p>
            <p className="text-blue-400">dpo@cynasecure.fr</p>
          </div>
          <div>
            <p className="text-gray-600 mb-0.5">Courrier</p>
            <p className="text-gray-300">CynaSecure SAS — DPO</p>
            <p className="text-gray-300">42 avenue de la Grande Armée, 75008 Paris</p>
          </div>
          <div>
            <p className="text-gray-600 mb-0.5">Autorité de contrôle compétente</p>
            <p className="text-gray-300">CNIL — Commission Nationale de l'Informatique et des Libertés</p>
            <p className="text-gray-500">3 place de Fontenoy, 75007 Paris — www.cnil.fr</p>
          </div>
        </div>
        <p className="text-gray-600 text-xs font-mono">
          Dernière mise à jour : 23 mai 2026 — Version 2.4
        </p>
      </div>
    ),
  },
];

export default function ConfidentialitePage() {
  const { t } = useTranslation();
  const disclaimer = t("legal.unofficialTranslation");

  return (
    <PageTransition>
    <div className="bg-gray-950 min-h-screen">

      {/* En-tête */}
      <section className="relative overflow-hidden pt-28 pb-16 border-b border-gray-800">
        <div
          className="absolute top-0 right-1/4 w-[600px] h-[400px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />

        <div className="relative container max-w-4xl">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">{t("legal.tag")}</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em" }}
          >
            {t("legal.confidentialiteTitle")}
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            {t("legal.confidentialiteVersion")}
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
