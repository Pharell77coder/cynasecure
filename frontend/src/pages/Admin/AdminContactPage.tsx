import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Bot, ChevronRight, X, Send, CornerDownRight } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { contactApi, type AdminContactMessage, type AdminConversation, type AdminConversationDetail } from "../../api/contact";
import { toast } from "../../hooks/useToast";
import { Pagination } from "../../components/ui/Pagination";

type Tab = "messages" | "chatbot";

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  read: "Lu",
  answered: "Répondu",
};

const STATUS_COLORS: Record<string, string> = {
  new:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  read:     "bg-gray-500/10 text-gray-400 border-gray-500/20",
  answered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function fmt(d: string) {
  try { return format(new Date(d), "dd MMM yyyy HH:mm", { locale: fr }); }
  catch { return d; }
}

function MessageRow({
  msg,
  onStatusChange,
  onReply,
}: {
  msg: AdminContactMessage;
  onStatusChange: (id: number, status: string) => void;
  onReply: (id: number, reply: string) => Promise<void>;
}) {
  const [open, setOpen]       = useState(false);
  const [reply, setReply]     = useState(msg.adminReply ?? "");
  const [sending, setSending] = useState(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await onReply(msg.id, reply.trim());
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_150px_110px_130px_36px] gap-3 items-center px-6 py-4 hover:bg-gray-800/40 transition-colors cursor-pointer border-b border-gray-800 last:border-0"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <p className="text-sm text-white font-medium">{msg.email}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.message.slice(0, 60)}…</p>
        </div>
        <p className="text-xs text-gray-400">{msg.subject}</p>
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border w-fit ${STATUS_COLORS[msg.status]}`}>
          {STATUS_LABELS[msg.status]}
        </span>
        <p className="text-xs text-gray-500">{fmt(msg.createdAt)}</p>
        <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden="true" />
      </div>

      {open && (
        <div className="px-6 pb-6 bg-gray-900/40 border-b border-gray-800 space-y-5" onClick={(e) => e.stopPropagation()}>

          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap pt-2">{msg.message}</p>

          {msg.adminReply && (
            <div className="border-l-2 border-blue-500/40 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <CornerDownRight className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                <span className="text-blue-400 text-xs font-mono">Réponse envoyée — {msg.repliedAt ? fmt(msg.repliedAt) : ""}</span>
                {msg.replyReadAt
                  ? <span className="text-emerald-400 text-[10px] font-mono">Lu par l'utilisateur</span>
                  : <span className="text-gray-500 text-[10px] font-mono">Pas encore lu</span>}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{msg.adminReply}</p>
            </div>
          )}

          <form onSubmit={submitReply} className="space-y-3">
            <label htmlFor={`reply-${msg.id}`} className="text-xs font-mono text-gray-500 tracking-widest">
              {msg.adminReply ? "MODIFIER LA RÉPONSE" : "RÉPONDRE À CE MESSAGE"}
            </label>
            <textarea
              id={`reply-${msg.id}`}
              ref={textareaRef}
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Votre réponse à l'utilisateur..."
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm px-4 py-3 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-mono">Statut :</span>
                {(["new", "read", "answered"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusChange(msg.id, s)}
                    className={`text-[10px] px-2 py-1 border transition-colors font-mono ${
                      msg.status === s
                        ? STATUS_COLORS[s]
                        : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-semibold px-4 py-2 transition-colors"
              >
                {sending ? "Envoi…" : "Envoyer la réponse"}
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
}

function ConversationDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const [data, setData] = useState<AdminConversationDetail | null>(null);

  useEffect(() => {
    contactApi.admin.getConversation(id).then(setData);
  }, [id]);

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 p-8">
          <p className="text-gray-400 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-950 border border-gray-800 w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Conversation #${data.id}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <p className="text-white font-semibold text-sm">Conversation #{data.id}</p>
            <p className="text-gray-500 text-xs font-mono">{data.email ?? "Anonyme"} — {fmt(data.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Fermer">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {data.messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200 border border-gray-700"
              }`}>
                <p>{m.content}</p>
                <p className="text-[10px] mt-1 opacity-50 font-mono">{fmt(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminContactPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) || "messages";

  const msgPage    = Math.max(1, Number(searchParams.get("msgPage") || 1));
  const msgPerPage = Number(searchParams.get("msgPerPage") || 20);
  const convPage    = Math.max(1, Number(searchParams.get("convPage") || 1));
  const convPerPage = Number(searchParams.get("convPerPage") || 20);

  const [messages, setMessages]       = useState<AdminContactMessage[]>([]);
  const [msgTotal, setMsgTotal]       = useState(0);
  const [convs, setConvs]             = useState<AdminConversation[]>([]);
  const [convTotal, setConvTotal]     = useState(0);
  const [loading, setLoading]         = useState(true);
  const [openConv, setOpenConv]       = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    if (tab === "messages") {
      contactApi.admin.listMessages(msgPage, msgPerPage)
        .then((m) => { setMessages(m.items); setMsgTotal(m.total); })
        .finally(() => setLoading(false));
    } else {
      contactApi.admin.listConversations(convPage, convPerPage)
        .then((c) => { setConvs(c.items); setConvTotal(c.total); })
        .finally(() => setLoading(false));
    }
  }, [tab, msgPage, msgPerPage, convPage, convPerPage]);

  const setTab = (t: Tab) => setSearchParams({ tab: t });

  const setMsgPage    = (p: number) => setSearchParams((prev) => { prev.set("msgPage", String(p)); return prev; });
  const setMsgPerPage = (pp: number) => setSearchParams({ tab: "messages", msgPage: "1", msgPerPage: String(pp) });
  const setConvPage    = (p: number) => setSearchParams((prev) => { prev.set("convPage", String(p)); return prev; });
  const setConvPerPage = (pp: number) => setSearchParams({ tab: "chatbot", convPage: "1", convPerPage: String(pp) });

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await contactApi.admin.updateStatus(id, status);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: updated.status } : m));
      toast("Statut mis à jour", "success");
    } catch {
      toast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleReply = async (id: number, reply: string) => {
    try {
      const updated = await contactApi.admin.reply(id, reply);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, ...updated } : m));
      toast("Réponse envoyée à l'utilisateur", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'envoi", "error");
    }
  };

  if (loading && messages.length === 0 && convs.length === 0) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-7 w-48 bg-gray-800" />
        <div className="h-12 bg-gray-800" />
        <div className="h-72 bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">

      <div>
        <p className="text-[11px] font-mono tracking-widest text-blue-500 mb-1">CONSOLE ADMINISTRATEUR</p>
        <h1 className="text-2xl font-black text-white">Messages contact</h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-800" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "messages"}
          onClick={() => setTab("messages")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "messages"
              ? "text-white border-blue-500"
              : "text-gray-500 border-transparent hover:text-gray-300"
          }`}
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Formulaire
          <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5">{msgTotal}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "chatbot"}
          onClick={() => setTab("chatbot")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "chatbot"
              ? "text-white border-blue-500"
              : "text-gray-500 border-transparent hover:text-gray-300"
          }`}
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
          Chatbot
          <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5">{convTotal}</span>
        </button>
      </div>

      {/* Messages formulaire */}
      {tab === "messages" && (
        <Card className="p-0 overflow-hidden" role="tabpanel">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">Aucun message reçu.</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[1fr_150px_110px_130px_36px] gap-3 px-6 py-2.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800 bg-gray-950">
                <span>Expéditeur / Aperçu</span>
                <span>Sujet</span>
                <span>Statut</span>
                <span>Date</span>
                <span />
              </div>
              <div>
                {messages.map((m) => (
                  <MessageRow key={m.id} msg={m} onStatusChange={handleStatusChange} onReply={handleReply} />
                ))}
              </div>
              <div className="px-6 pb-4 border-t border-gray-800 pt-3">
                <Pagination
                  page={msgPage}
                  total={msgTotal}
                  perPage={msgPerPage}
                  onChange={setMsgPage}
                  onPerPageChange={setMsgPerPage}
                />
              </div>
            </>
          )}
        </Card>
      )}

      {/* Conversations chatbot */}
      {tab === "chatbot" && (
        <Card className="p-0 overflow-hidden" role="tabpanel">
          {convs.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">Aucune conversation.</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[1fr_200px_80px_130px] gap-3 px-6 py-2.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800 bg-gray-950">
                <span>Session</span>
                <span>Email</span>
                <span>Messages</span>
                <span>Date</span>
              </div>
              <div className="divide-y divide-gray-800">
                {convs.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_200px_80px_130px] gap-3 items-center px-6 py-4 hover:bg-gray-800/40 transition-colors cursor-pointer"
                    onClick={() => setOpenConv(c.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setOpenConv(c.id)}
                    aria-label={`Voir la conversation #${c.id}`}
                  >
                    <p className="text-sm font-mono text-gray-400 truncate">{c.sessionId}</p>
                    <p className="text-sm text-gray-300">{c.email ?? <span className="text-gray-500">Anonyme</span>}</p>
                    <p className="text-sm text-white font-semibold">{c.messages}</p>
                    <p className="text-xs text-gray-500">{fmt(c.createdAt)}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-4 border-t border-gray-800 pt-3">
                <Pagination
                  page={convPage}
                  total={convTotal}
                  perPage={convPerPage}
                  onChange={setConvPage}
                  onPerPageChange={setConvPerPage}
                />
              </div>
            </>
          )}
        </Card>
      )}

      {openConv !== null && (
        <ConversationDetail id={openConv} onClose={() => setOpenConv(null)} />
      )}
    </div>
  );
}
