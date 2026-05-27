import { FormEvent, useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ErrorMessage } from "../ui/ErrorMessage";
import { contactApi } from "../../api/contact";
import { toast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import React from "react";

interface Props {
  prefillSubject?: string;
  prefillMessage?: string;
}

export function ContactForm({ prefillSubject, prefillMessage }: Props) {
  const { t } = useTranslation();

  const SUBJECTS = [
    t("contact.subjectTechnical"),
    t("contact.subjectSubscription"),
    t("contact.subjectGeneral"),
    t("contact.subjectOther"),
  ];

  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState(prefillSubject ?? "");
  const [message, setMessage] = useState(prefillMessage ?? "");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const validate = (): string | null => {
    if (!email || !subject || !message) return t("contact.formErrorAll");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("contact.formErrorEmail");
    if (!SUBJECTS.includes(subject)) return t("contact.formErrorSubject");
    if (message.trim().length < 10) return t("contact.formErrorMinLength");
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
      toast(t("contact.formToastSent"), "success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("contact.formErrorSend"));
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
        <h3 className="text-white font-bold text-lg">{t("contact.formSentTitle")}</h3>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          {t("contact.formSentDesc", { email })}
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); setSubject(""); setMessage(""); }}
          className="text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors mt-2"
        >
          {t("contact.formSendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>

      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-gray-300">
          {t("contact.formEmail")} <span className="text-red-400">*</span>
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
          {t("contact.formSubject")} <span className="text-red-400">*</span>
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-11 w-full bg-gray-900 border border-gray-800 text-gray-200 text-sm px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all duration-150"
        >
          <option value="" disabled>{t("contact.formSubjectPlaceholder")}</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-gray-300">
          {t("contact.formMessage")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
          <textarea
            id="contact-message"
            rows={5}
            placeholder={t("contact.formMessagePlaceholder")}
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
        {loading ? t("contact.formSending") : (
          <>
            {t("contact.formSend")}
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
