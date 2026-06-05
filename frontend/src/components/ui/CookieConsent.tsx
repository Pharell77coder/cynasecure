import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Shield, BarChart2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const STORAGE_KEY = "cynasecure_cookie_consent";

interface ConsentState {
  necessary: true;
  analytics: boolean;
  decided: boolean;
}

function loadConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConsent(state: ConsentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function CookieConsent() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const consent = loadConsent();
    if (!consent?.decided) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (all: boolean) => {
    saveConsent({ necessary: true, analytics: all ? true : analytics, decided: true });
    setVisible(false);
  };

  const save = () => {
    saveConsent({ necessary: true, analytics, decided: true });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 16 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="false"
          aria-label={t("cookies.title")}
          className="fixed bottom-4 right-4 z-[60] w-80"
        >
          <div className="bg-gray-900 border border-gray-700 shadow-2xl shadow-black/50">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-blue-600/10 border border-blue-500/20">
                  <img
                    src="/favicon.ico"
                    alt="CynaSecure"
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-xs leading-tight">{t("cookies.title")}</p>
                  <p className="text-[9px] font-mono text-blue-400 tracking-widest uppercase mt-0.5">
                    {t("cookies.poweredBy")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => accept(false)}
                aria-label="Fermer"
                className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
              <p className="text-gray-400 text-xs leading-relaxed">
                {t("cookies.desc")}
              </p>

              {/* Panneau détaillé */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">

                      {/* Essentiels */}
                      <div className="flex items-start gap-2 p-2.5 bg-gray-800/60 border border-gray-700">
                        <Shield className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white text-[11px] font-semibold">{t("cookies.necessary")}</span>
                            <span className="text-emerald-400 font-mono text-[9px] tracking-widest">ON</span>
                          </div>
                          <p className="text-gray-500 text-[10px] mt-0.5 leading-relaxed">{t("cookies.necessaryDesc")}</p>
                        </div>
                      </div>

                      {/* Analytiques */}
                      <div className="flex items-start gap-2 p-2.5 bg-gray-800/60 border border-gray-700">
                        <BarChart2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white text-[11px] font-semibold">{t("cookies.analytics")}</span>
                            <button
                              role="switch"
                              aria-checked={analytics}
                              onClick={() => setAnalytics((v) => !v)}
                              className={`relative w-8 h-4 flex-shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                analytics ? "bg-blue-600" : "bg-gray-700"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white transition-transform duration-200 ${
                                  analytics ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                              <span className="sr-only">{analytics ? "Activé" : "Désactivé"}</span>
                            </button>
                          </div>
                          <p className="text-gray-500 text-[10px] mt-0.5 leading-relaxed">{t("cookies.analyticsDesc")}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personnaliser toggle */}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-2.5 flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-blue-400 transition-colors"
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
                {t("cookies.customize")}
              </button>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 px-4 pb-4">
              {expanded ? (
                <button
                  onClick={save}
                  className="btn-cta text-[11px] px-3 py-2 w-full justify-center"
                >
                  {t("cookies.save")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => accept(false)}
                    className="flex-1 px-3 py-2 text-[11px] font-mono text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white transition-colors"
                  >
                    {t("cookies.rejectAll")}
                  </button>
                  <button
                    onClick={() => accept(true)}
                    className="btn-cta flex-1 text-[11px] px-3 py-2 justify-center"
                  >
                    {t("cookies.acceptAll")}
                  </button>
                </div>
              )}
              <Link
                to="/confidentialite"
                className="text-[10px] text-gray-600 hover:text-blue-400 transition-colors font-mono text-center"
              >
                {t("cookies.learnMore")} →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
