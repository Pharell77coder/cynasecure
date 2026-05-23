import { FormEvent, useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ErrorMessage } from "../ui/ErrorMessage";
import { contactApi } from "../../api/contact";
import { toast } from "../../hooks/useToast";
import React from "react";

const SUBJECTS = [
  "Problème technique",
  "Question abonnement",
  "Assistance générale",
  "Autre",
];

interface Props {
  prefillSubject?: string;
  prefillMessage?: string;
}

export function ContactForm({ prefillSubject, prefillMessage }: Props) {
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState(prefillSubject ?? "");
  const [message, setMessage] = useState(prefillMessage ?? "");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const validate = (): string | null => {
    if (!email || !subject || !message) return "Tous les champs sont obligatoires.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Adresse email invalide.";
    if (!SUBJECTS.includes(subject)) return "Veuillez sélectionner un sujet valide.";
    if (message.trim().length < 10) return "Le message doit contenir au moins 10 caractères.";
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await contactApi.send({ email, subject, message });
      setSent(true);
      toast("Message envoyé — nous répondons sous 4h ouvrées.", "success");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 border border-emerald-500/30 bg-emerald-500/10">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-white font-bold text-lg">Message envoyé</h3>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          Notre équipe vous répondra à <span className="text-white font-medium">{email}</span> sous
          4 heures ouvrées.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); setSubject(""); setMessage(""); }}
          className="text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors mt-2"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>

      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-gray-300">
          Email <span className="text-red-400">*</span>
        </label>
        <Input
          id="contact-email"
          type="email"
          placeholder="vous@entreprise.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium text-gray-300">
          Sujet <span className="text-red-400">*</span>
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-11 w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all duration-150"
        >
          <option value="" disabled>Sélectionnez un sujet</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-gray-300">
          Message <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Décrivez votre demande en détail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm pl-10 pr-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all duration-150 resize-none"
          />
        </div>
        <p className="mt-1 text-xs text-gray-600 text-right">{message.length} / 5000</p>
      </div>

      <ErrorMessage message={error} />

      <Button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-none gap-2 w-full sm:w-auto"
      >
        {loading ? "Envoi en cours..." : (
          <>
            Envoyer le message
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
