import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Users, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import React from "react";

const VALEURS = [
  {
    icon: Eye,
    titre: "Transparence",
    texte:
      "Nous ne vendons pas de sécurité obscure. Chaque détection, chaque alerte, chaque décision algorithmique est expliquée — pour que vos équipes comprennent, pas seulement qu'elles subissent.",
  },
  {
    icon: Lock,
    titre: "Souveraineté",
    texte:
      "Vos données restent en France, sous infrastructure SecNumCloud. Aucun accès externe, aucune revente, aucune dépendance à des acteurs non-européens.",
  },
  {
    icon: Zap,
    titre: "Efficacité réelle",
    texte:
      "Un outil que personne n'utilise ne protège rien. Notre obsession : réduire le bruit, prioriser le signal, et rendre les réponses actionnables en quelques secondes.",
  },
  {
    icon: Users,
    titre: "Partenariat",
    texte:
      "Nous n'abandonnons pas après le déploiement. Un ingénieur dédié, des revues mensuelles de posture, un support humain — pas un ticket vers nulle part.",
  },
];

const CHIFFRES = [
  { valeur: "2019", label: "Année de fondation", note: "Paris, France" },
  { valeur: "140+", label: "Experts sécurité", note: "Analystes, ingénieurs, chercheurs" },
  { valeur: "500+", label: "Organisations protégées", note: "Du PME au CAC 40" },
  { valeur: "24/7", label: "Centre d'opérations", note: "SOC managé, toujours actif" },
];

export default function AProposPage() {
  return (
    <div className="bg-gray-950 min-h-screen">

      {/* ── En-tête ─────────────────────────────────────────────────── */}
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
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">À PROPOS</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-6"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}
          >
            Nous croyons que la cybersécurité
            <br />
            <span className="text-blue-400">devrait être compréhensible.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl">
            CynaSecure est une plateforme XDR fondée à Paris en 2019 par des anciens de la DGSI
            et des CERT européens. Notre conviction : la complexité du paysage des menaces ne
            justifie pas la complexité des outils censés y répondre.
          </p>
        </div>
      </section>

      {/* ── Chiffres clés ────────────────────────────────────────────── */}
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

      {/* ── Notre histoire ───────────────────────────────────────────── */}
      <section className="py-24 border-b border-gray-800">
        <div className="container grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">ORIGINE</div>
            <h2
              className="text-3xl font-black text-white tracking-tight mb-8"
              style={{ letterSpacing: "-0.02em" }}
            >
              Nés d'une frustration, construits avec méthode.
            </h2>

            <div className="space-y-5 text-gray-400 text-sm leading-loose">
              <p>
                En 2018, les fondateurs de CynaSecure travaillaient dans des SOC d'organisations
                critiques. Chaque jour, la même réalité : des dizaines d'outils mal intégrés, des
                alertes sans contexte, des analystes épuisés à trier du bruit.
              </p>
              <p>
                CynaSecure est né de cette frustration — et d'une certitude : une plateforme
                unifiée, construite autour de l'IA comportementale et de la corrélation native,
                pouvait changer radicalement le rapport signal/bruit.
              </p>
              <p>
                Depuis 2019, nous protégeons des infrastructures critiques en France et en Europe.
                Nos clients vont des ETI industrielles aux établissements financiers en passant
                par des entités de santé soumises aux exigences HDS.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-800 bg-gray-900 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2019</div>
              <p className="text-white font-semibold text-sm mb-1">Création à Paris</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Cinq cofondateurs issus de la DGSI, de l'ANSSI et de grands CERT européens.
                Première levée de fonds seed de 3 M€.
              </p>
            </div>
            <div className="border border-gray-800 bg-gray-900 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2021</div>
              <p className="text-white font-semibold text-sm mb-1">Certification ANSSI PRIS</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Première plateforme XDR native à obtenir la qualification PRIS de l'ANSSI.
                Déploiement chez 50 organisations critiques.
              </p>
            </div>
            <div className="border border-gray-800 bg-gray-900 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2023</div>
              <p className="text-white font-semibold text-sm mb-1">Série B — 28 M€</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Expansion en Belgique, Allemagne et Espagne. Lancement du SOC managé 24/7
                et de la couverture OT/ICS.
              </p>
            </div>
            <div className="border border-blue-500/30 bg-blue-500/5 p-6">
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-3">2025</div>
              <p className="text-white font-semibold text-sm mb-1">500+ organisations protégées</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Lancement de la plateforme en self-service. 140 experts. Infrastructure
                hébergée en France, certifiée SecNumCloud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valeurs ──────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-gray-800 bg-gray-900">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">VALEURS</div>
          <h2
            className="text-3xl font-black text-white tracking-tight mb-14"
            style={{ letterSpacing: "-0.02em" }}
          >
            Ce qui guide chaque décision.
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

      {/* ── Certifications ────────────────────────────────────────────── */}
      <section className="py-20 border-b border-gray-800">
        <div className="container">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">CONFORMITÉ</div>
          <h2
            className="text-2xl font-black text-white tracking-tight mb-10"
            style={{ letterSpacing: "-0.02em" }}
          >
            Certifications et reconnaissances
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

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg">Vous voulez en savoir plus ?</p>
            <p className="text-gray-500 text-sm mt-1">
              Nos ingénieurs répondent sous 4h ouvrées.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/catalogue">
              <Button
                variant="ghost"
                className="border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-none font-mono text-xs tracking-wide gap-2"
              >
                Explorer la plateforme
                <Globe className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/inscription">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-none gap-2 font-semibold">
                Démarrer un POC
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
