import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Bot, ChevronRight, X } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { contactApi, type AdminContactMessage, type AdminConversation, type AdminConversationDetail } from "../../api/contact";
import { toast } from "../../hooks/useToast";

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
}: {
  msg: AdminContactMessage;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_150px_110px_130px_36px] gap-3 items-center px-6 py-4 hover:bg-gray-800/40 transition-colors cursor-pointer border-b border-gray-800 last:border-0"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="text-sm text-white font-medium">{msg.email}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.message.slice(0, 60)}…</p>
        </div>
        <p className="text-xs text-gray-400">{msg.subject}</p>
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border w-fit ${STATUS_COLORS[msg.status]}`}>
          {STATUS_LABELS[msg.status]}
        </span>
        <p className="text-xs text-gray-600">{fmt(msg.createdAt)}</p>
        <ChevronRight className={`h-4 w-4 text-gray-600 transition-transform ${open ? "rotate-90" : ""}`} />
      </div>

      {open && (
        <div className="px-6 pb-5 bg-gray-900/40 border-b border-gray-800">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{msg.message}</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs font-mono">Changer le statut :</span>
            {(["new", "read", "answered"] as const).map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onStatusChange(msg.id, s); }}
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
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <p className="text-white font-semibold text-sm">Conversation #{data.id}</p>
            <p className="text-gray-500 text-xs font-mono">{data.email ?? "Anonyme"} — {fmt(data.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
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
  const [tab, setTab]             = useState<Tab>("messages");
  const [messages, setMessages]   = useState<AdminContactMessage[]>([]);
  const [convs, setConvs]         = useState<AdminConversation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [openConv, setOpenConv]   = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      contactApi.admin.listMessages(),
      contactApi.admin.listConversations(),
    ]).then(([m, c]) => {
      setMessages(m.items);
      setConvs(c);
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await contactApi.admin.updateStatus(id, status);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: updated.status } : m));
      toast("Statut mis à jour", "success");
    } catch {
      toast("Erreur lors de la mise à jour", "error");
    }
  };

  if (loading) {
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
      <div className="flex gap-1 border-b border-gray-800">
        <button
          onClick={() => setTab("messages")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "messages"
              ? "text-white border-blue-500"
              : "text-gray-500 border-transparent hover:text-gray-300"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Formulaire
          <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5">{messages.length}</span>
        </button>
        <button
          onClick={() => setTab("chatbot")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "chatbot"
              ? "text-white border-blue-500"
              : "text-gray-500 border-transparent hover:text-gray-300"
          }`}
        >
          <Bot className="h-4 w-4" />
          Chatbot
          <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5">{convs.length}</span>
        </button>
      </div>

      {/* Messages formulaire */}
      {tab === "messages" && (
        <Card className="p-0 overflow-hidden">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">Aucun message reçu.</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[1fr_150px_110px_130px_36px] gap-3 px-6 py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider border-b border-gray-800 bg-gray-950">
                <span>Expéditeur / Aperçu</span>
                <span>Sujet</span>
                <span>Statut</span>
                <span>Date</span>
                <span />
              </div>
              <div>
                {messages.map((m) => (
                  <MessageRow key={m.id} msg={m} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Conversations chatbot */}
      {tab === "chatbot" && (
        <Card className="p-0 overflow-hidden">
          {convs.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 py-10 text-center">Aucune conversation.</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[1fr_200px_80px_130px] gap-3 px-6 py-2.5 text-[10px] font-medium text-gray-600 uppercase tracking-wider border-b border-gray-800 bg-gray-950">
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
                  >
                    <p className="text-sm font-mono text-gray-400 truncate">{c.sessionId}</p>
                    <p className="text-sm text-gray-300">{c.email ?? <span className="text-gray-600">Anonyme</span>}</p>
                    <p className="text-sm text-white font-semibold">{c.messages}</p>
                    <p className="text-xs text-gray-600">{fmt(c.createdAt)}</p>
                  </div>
                ))}
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
