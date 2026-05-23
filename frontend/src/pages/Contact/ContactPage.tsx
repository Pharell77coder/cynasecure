import { useRef } from "react";
import { Mail, Phone, MapPin, Clock, Shield } from "lucide-react";
import { ContactForm } from "../../components/contact/ContactForm";
import { ChatbotWidget } from "../../components/contact/ChatbotWidget";
import React from "react";

const INFOS = [
  {
    icon: Mail,
    label: "Email général",
    value: "contact@cynasecure.fr",
    note: "Réponse sous 4h ouvrées",
  },
  {
    icon: Shield,
    label: "Support technique",
    value: "support@cynasecure.fr",
    note: "Incidents P1/P2 : 24h/7j",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+33 1 42 XX XX XX",
    note: "Lun – Ven, 9h – 18h",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "42 avenue de la Grande Armée",
    note: "75008 Paris, France",
  },
];

export default function ContactPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const [prefillSubject, setPrefillSubject] = React.useState("");
  const [prefillMessage, setPrefillMessage] = React.useState("");
  const [formKey, setFormKey]               = React.useState(0);

  const handleEscalate = (message: string) => {
    setPrefillSubject("Assistance générale");
    setPrefillMessage(message);
    setFormKey((k) => k + 1);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

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

        <div className="relative container max-w-4xl">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">CONTACT</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            Parlons de votre
            <br />
            <span className="text-blue-400">sécurité.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            Une question, un incident, un projet — notre équipe répond sous 4 heures ouvrées.
            Pour les urgences, le SOC est disponible 24h/7j.
          </p>
        </div>
      </section>

      {/* ── Informations de contact ──────────────────────────────────── */}
      <section className="border-b border-gray-800">
        <div className="container grid sm:grid-cols-2 lg:grid-cols-4">
          {INFOS.map((info, i) => (
            <div
              key={info.label}
              className={`py-8 px-6 ${i < 3 ? "border-r border-gray-800" : ""}`}
            >
              <info.icon className="h-4 w-4 text-blue-500 mb-3" />
              <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-1">{info.label.toUpperCase()}</p>
              <p className="text-white text-sm font-medium">{info.value}</p>
              <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {info.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Formulaire ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start">

            {/* Formulaire */}
            <div ref={formRef}>
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">FORMULAIRE</div>
              <h2
                className="text-2xl font-black text-white tracking-tight mb-8"
                style={{ letterSpacing: "-0.02em" }}
              >
                Envoyez-nous un message
              </h2>
              <ContactForm
                key={formKey}
                prefillSubject={prefillSubject}
                prefillMessage={prefillMessage}
              />
            </div>

            {/* Sidebar informative */}
            <div className="space-y-5 lg:pt-16">
              <div className="border border-gray-800 bg-gray-900 p-6">
                <p className="text-white font-semibold text-sm mb-3">Engagement de réponse</p>
                <div className="space-y-3">
                  {[
                    { label: "Demande standard", delay: "< 4h ouvrées" },
                    { label: "Incident P2", delay: "< 2h" },
                    { label: "Incident P1 (critique)", delay: "< 15 min — 24h/7j" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">{r.label}</span>
                      <span className="text-blue-400 font-mono text-xs">{r.delay}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-800 bg-gray-900 p-6">
                <p className="text-white font-semibold text-sm mb-2">Accès direct au support</p>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                  Clients avec accès actif : connectez-vous et ouvrez un ticket depuis "Mon espace"
                  pour un traitement prioritaire avec votre contexte client pré-rempli.
                </p>
                <a
                  href="/connexion"
                  className="text-blue-400 font-mono text-xs hover:text-blue-300 transition-colors"
                >
                  Se connecter →
                </a>
              </div>

              <div className="border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="text-blue-300 text-xs font-mono tracking-widest mb-1">CHATBOT DISPONIBLE</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Utilisez le bouton <span className="text-white font-medium">"Contact Me"</span> en
                  bas à droite pour des réponses instantanées sur les questions courantes.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Chatbot local à la page Contact */}
      <ChatbotWidget onEscalate={handleEscalate} />
    </div>
  );
}
