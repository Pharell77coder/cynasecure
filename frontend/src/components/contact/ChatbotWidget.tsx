import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ChevronDown, CornerDownLeft } from "lucide-react";
import { contactApi } from "../../api/contact";
import { useTranslation } from "react-i18next";
import React from "react";

interface Message {
  sender: "user" | "bot";
  content: string;
  escalate?: boolean;
}

interface Category {
  label: string;
  questions: string[];
}

interface Props {
  onEscalate: (message: string) => void;
}

function generateSessionId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function ChatbotWidget({ onEscalate }: Props) {
  const { t } = useTranslation();

  const [open, setOpen]               = useState(false);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [activeTab, setActiveTab]     = useState(0);
  const [messages, setMessages]       = useState<Message[]>([
    { sender: "bot", content: t("chatbot.welcome") },
  ]);
  const [loading, setLoading]         = useState(false);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [view, setView]               = useState<"questions" | "chat">("questions");

  const sessionId = useRef(generateSessionId());
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const els = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = () => els()[0];
    const last  = () => els()[els().length - 1];

    first()?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      const all = els();
      if (!all.length) return;
      if (e.shiftKey) {
        if (document.activeElement === all[0]) { e.preventDefault(); last()?.focus(); }
      } else {
        if (document.activeElement === all[all.length - 1]) { e.preventDefault(); first()?.focus(); }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    setLoadingSugg(true);
    contactApi.suggestions()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingSugg(false));
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  const ask = async (question: string) => {
    setView("chat");
    setMessages((prev) => [...prev, { sender: "user", content: question }]);
    setLoading(true);

    try {
      const res = await contactApi.chatbot({ sessionId: sessionId.current, message: question });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", content: res.reply, escalate: !res.matched },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", content: t("chatbot.errorMessage") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    const lastUser = [...messages].reverse().find((m) => m.sender === "user");
    onEscalate(lastUser?.content ?? "");
    setOpen(false);
  };

  const backToQuestions = () => setView("questions");

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] bg-gray-950 border border-gray-800 shadow-2xl z-50 flex flex-col"
          style={{ maxHeight: "560px" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span id="chatbot-title" className="text-white text-sm font-semibold">{t("chatbot.title")}</span>
              <span className="text-gray-600 font-mono text-[10px] tracking-widest">{t("chatbot.online")}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white transition-colors"
              aria-label={t("chatbot.closeChat")}
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Vue chat */}
          {view === "chat" && (
            <div className="flex flex-col flex-1 min-h-0">
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                aria-live="polite"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-200 border border-gray-700"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.escalate && (
                      <button
                        onClick={handleEscalate}
                        className="mt-2 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 transition-colors font-medium"
                      >
                        {t("chatbot.contactSupport")}
                      </button>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 px-3 py-2">
                      <span className="inline-flex gap-1 text-gray-500 text-sm">
                        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                        <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="border-t border-gray-800 px-4 py-3 flex-shrink-0">
                <button
                  onClick={backToQuestions}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                >
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  {t("chatbot.backToQuestions")}
                </button>
              </div>
            </div>
          )}

          {/* Vue questions */}
          {view === "questions" && (
            <div className="flex flex-col flex-1 min-h-0">
              <p className="px-4 pt-4 pb-3 text-gray-400 text-xs leading-relaxed flex-shrink-0">
                {t("chatbot.welcome")}
              </p>

              {loadingSugg ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600 text-xs font-mono animate-pulse">{t("chatbot.loading")}</p>
                </div>
              ) : (
                <>
                  {/* Onglets catégories */}
                  <div className="flex gap-1 px-4 border-b border-gray-800 flex-shrink-0">
                    {categories.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={`text-xs font-mono py-2 px-3 border-b-2 -mb-px transition-colors ${
                          activeTab === i
                            ? "text-blue-400 border-blue-500"
                            : "text-gray-600 border-transparent hover:text-gray-400"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Liste de questions */}
                  <div className="flex-1 overflow-y-auto py-2">
                    {categories[activeTab]?.questions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => ask(q)}
                        disabled={loading}
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors border-b border-gray-900 last:border-0 disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}

                    {categories[activeTab]?.questions.length === 0 && (
                      <p className="px-4 py-6 text-gray-600 text-xs text-center">
                        {t("chatbot.noQuestions")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bouton flottant */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:right-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 shadow-lg transition-colors z-50 font-medium text-sm"
        aria-label={open ? t("chatbot.closeChat") : t("chatbot.openChat")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span className="hidden sm:inline">{open ? t("chatbot.close") : t("chatbot.contactMe")}</span>
      </button>
    </>
  );
}
