import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { contactApi } from "../../api/contact";
import React from "react";

interface Message {
  sender: "user" | "bot";
  content: string;
}

interface Props {
  onEscalate: (message: string) => void;
}

const WELCOME = "Bonjour ! Je suis l'assistant CynaSecure. Posez-moi votre question — abonnement, paiement, support, déploiement…";

function generateSessionId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function ChatbotWidget({ onEscalate }: Props) {
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", content: WELCOME },
  ]);

  const sessionId  = useRef(generateSessionId());
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { sender: "user", content: text }]);
    setLoading(true);

    try {
      const res = await contactApi.chatbot({ sessionId: sessionId.current, message: text });
      setMessages((prev) => [...prev, { sender: "bot", content: res.reply }]);

      if (!res.matched) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            content: "__escalate__",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", content: "Une erreur est survenue. Veuillez réessayer." },
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

  return (
    <>
      {/* Fenêtre de chat */}
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-gray-950 border border-gray-800 shadow-2xl z-50 flex flex-col"
          style={{ maxHeight: "520px" }}
          role="dialog"
          aria-label="Chat support CynaSecure"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-white text-sm font-semibold">Assistant CynaSecure</span>
              <span className="text-gray-600 font-mono text-[10px] tracking-widest">EN LIGNE</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Fermer le chat"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            aria-live="polite"
            aria-label="Historique de la conversation"
          >
            {messages.map((msg, i) => {
              if (msg.content === "__escalate__") {
                return (
                  <div key={i} className="flex justify-start">
                    <button
                      onClick={handleEscalate}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 transition-colors font-medium"
                    >
                      Transférer ma demande au support
                    </button>
                  </div>
                );
              }

              return (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-200 border border-gray-700"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 px-3 py-2 text-gray-500 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="border-t border-gray-800 flex items-center gap-2 px-3 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              maxLength={500}
              disabled={loading}
              aria-label="Votre message"
              className="flex-1 bg-transparent text-gray-200 text-sm placeholder:text-gray-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="text-blue-400 hover:text-blue-300 disabled:text-gray-700 transition-colors"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:right-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 shadow-lg transition-colors z-50 font-medium text-sm"
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat support"}
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span className="hidden sm:inline">{open ? "Fermer" : "Contact Me"}</span>
      </button>
    </>
  );
}
