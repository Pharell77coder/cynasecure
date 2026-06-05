import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Clock, Shield, CornerDownRight, Inbox } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ContactForm } from "../../components/contact/ContactForm";
import { ChatbotWidget } from "../../components/contact/ChatbotWidget";
import { contactApi, type UserMessage } from "../../api/contact";
import { useAuth } from "../../hooks/useAuth";
import { PageTransition } from "../../components/ui/PageTransition";
import { Reveal } from "../../components/motion/Reveal";
import { useTranslation } from "react-i18next";
import React from "react";

const STATUS_COLORS: Record<string, string> = {
  new:      "bg-gray-800 text-gray-400 border-gray-700",
  read:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
  answered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function fmt(d: string) {
  try { return format(new Date(d), "dd MMM yyyy HH:mm", { locale: fr }); }
  catch { return d; }
}

export default function ContactPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  const [prefillSubject, setPrefillSubject] = useState("");
  const [prefillMessage, setPrefillMessage] = useState("");
  const [formKey, setFormKey]               = useState(0);
  const [myMessages, setMyMessages]         = useState<UserMessage[]>([]);
  const [expanded, setExpanded]             = useState<number | null>(null);

  const STATUS_LABELS: Record<string, string> = {
    new:      t("contact.statusNew"),
    read:     t("contact.statusRead"),
    answered: t("contact.statusAnswered"),
  };

  const INFOS = [
    {
      icon: Mail,
      label: t("contact.infoEmailLabel"),
      value: "contact@cynasecure.fr",
      note: t("contact.infoEmailNote"),
    },
    {
      icon: Shield,
      label: t("contact.infoSupportLabel"),
      value: "support@cynasecure.fr",
      note: t("contact.infoSupportNote"),
    },
    {
      icon: Phone,
      label: t("contact.infoPhoneLabel"),
      value: "+33 1 42 XX XX XX",
      note: t("contact.infoPhoneNote"),
    },
    {
      icon: MapPin,
      label: t("contact.infoAddressLabel"),
      value: "42 avenue de la Grande Armée",
      note: "75008 Paris, France",
    },
  ];

  const COMMITMENTS = [
    { label: t("contact.commitmentStandard"), delay: "< 4h ouvrées" },
    { label: t("contact.commitmentP2"), delay: "< 2h" },
    { label: t("contact.commitmentP1"), delay: "< 15 min — 24h/7j" },
  ];

  useEffect(() => {
    if (!isAuthenticated) return;
    contactApi.user.myMessages().then(setMyMessages).catch(() => {});
    contactApi.user.markRead().catch(() => {});
  }, [isAuthenticated]);

  const handleEscalate = (message: string) => {
    setPrefillSubject(t("contact.subjectGeneral"));
    setPrefillMessage(message);
    setFormKey((k) => k + 1);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <PageTransition>
    <div className="bg-gray-950 min-h-screen">

      {/* En-tête */}
      <Reveal variant="fadeIn">
      <section className="relative overflow-hidden pt-28 pb-20 border-b border-gray-800">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />

        <div className="relative container max-w-4xl">
          <div className="text-blue-500 font-mono text-xs tracking-widest mb-5">{t("contact.pageTag")}</div>
          <h1
            className="font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            {t("contact.title")}
            <br />
            <span className="text-blue-400">{t("contact.titleHighlight")}</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>
      </Reveal>

      {/* Informations de contact */}
      <section className="border-b border-gray-800">
        <div className="container grid sm:grid-cols-2 lg:grid-cols-4">
          {INFOS.map((info, i) => (
            <div
              key={info.label}
              className={`py-8 px-6 ${i < 3 ? "border-r border-gray-800" : ""}`}
            >
              <info.icon className="h-4 w-4 text-blue-500 mb-3" />
              <p className="text-[10px] font-mono tracking-widest text-gray-400 mb-1">{info.label.toUpperCase()}</p>
              <p className="text-white text-sm font-medium">{info.value}</p>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {info.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mes échanges */}
      {isAuthenticated && myMessages.length > 0 && (
        <section className="border-b border-gray-800 bg-gray-900/40">
          <div className="container max-w-4xl py-12">
            <div className="flex items-center gap-3 mb-6">
              <Inbox className="h-4 w-4 text-blue-500" />
              <div className="text-blue-500 font-mono text-xs tracking-widest">{t("contact.myMessages")}</div>
              {myMessages.some((m) => m.adminReply && !m.replyReadAt) && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 font-mono">
                  {t("contact.newReply")}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {myMessages.map((m) => (
                <div key={m.id} className={`border ${m.adminReply && !m.replyReadAt ? "border-blue-500/40 bg-blue-500/5" : "border-gray-800 bg-gray-900"}`}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {m.adminReply && !m.replyReadAt && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Nouveau" />
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{m.subject}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{fmt(m.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`ml-4 flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 border font-mono ${STATUS_COLORS[m.status]}`}>
                      {STATUS_LABELS[m.status]}
                    </span>
                  </button>

                  {expanded === m.id && (
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-800">
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap pt-4">{m.message}</p>

                      {m.adminReply && (
                        <div className="border-l-2 border-blue-500/50 pl-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-blue-400 text-xs font-mono">
                              {t("contact.replyFrom", { date: m.repliedAt ? fmt(m.repliedAt) : "" })}
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{m.adminReply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Formulaire */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start">

            <div ref={formRef}>
              <div className="text-blue-500 font-mono text-xs tracking-widest mb-4">{t("contact.formTag")}</div>
              <h2
                className="text-2xl font-black text-white tracking-tight mb-8"
                style={{ letterSpacing: "-0.02em" }}
              >
                {t("contact.formTitle")}
              </h2>
              <ContactForm
                key={formKey}
                prefillSubject={prefillSubject}
                prefillMessage={prefillMessage}
              />
            </div>

            <div className="space-y-5 lg:pt-16">
              <div className="border border-gray-800 bg-gray-900 p-6">
                <p className="text-white font-semibold text-sm mb-3">{t("contact.responseCommitment")}</p>
                <div className="space-y-3">
                  {COMMITMENTS.map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{r.label}</span>
                      <span className="text-blue-400 font-mono text-xs">{r.delay}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-800 bg-gray-900 p-6">
                <p className="text-white font-semibold text-sm mb-2">{t("contact.directSupport")}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">
                  {t("contact.directSupportDesc")}
                </p>
                <a
                  href="/connexion"
                  className="text-blue-400 font-mono text-xs hover:text-blue-300 transition-colors"
                >
                  {t("contact.loginLink")}
                </a>
              </div>

              <div className="border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="text-blue-300 text-xs font-mono tracking-widest mb-1">{t("contact.chatbotAvailable")}</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t("contact.chatbotDesc")}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <ChatbotWidget onEscalate={handleEscalate} />
    </div>
    </PageTransition>
  );
}
