import { useState, useRef } from 'react';
import Button from '../components/Button.jsx';
import { contactService } from '../services/api.js';

const FAQ = [
  { q: 'Comment modifier mon abonnement ?', a: 'Rendez-vous dans "Mon compte" > "Commandes" pour consulter vos services actifs.' },
  { q: 'Quels modes de paiement sont acceptés ?', a: 'Nous acceptons les cartes Visa, Mastercard et American Express, via Stripe (PCI-DSS).' },
  { q: "Qu'est-ce que le SOC Cyna ?", a: 'Notre SOC surveille votre SI 24/7. Nos experts détectent et répondent aux incidents en temps réel.' },
  { q: 'Quelle est la différence EDR / XDR ?', a: "L'EDR protège vos endpoints. Le XDR étend la détection à l'ensemble de votre infrastructure : réseau, cloud et applications." }
];

const CHATBOT_RESPONSES = {
  abonnement: 'Rendez-vous dans "Mon compte" > "Commandes" pour consulter vos services Cyna.',
  paiement: 'Nous acceptons Visa, Mastercard et American Express via Stripe (PCI-DSS). Aucune donnée carte n\'est stockée chez nous.',
  facture: 'Le détail de vos commandes est disponible dans "Mon compte" > "Commandes".',
  soc: 'Notre SOC surveille votre SI 24/7. Nos experts détectent et répondent aux incidents en temps réel.',
  edr: 'Notre EDR protège vos endpoints par IA comportementale avec confinement automatique des menaces.',
  xdr: 'Notre XDR corrèle les menaces sur endpoint, réseau et cloud pour une vision unifiée de votre sécurité.',
  bonjour: "Bonjour ! Je suis l'assistant Cyna. Posez-moi vos questions sur nos services SOC, EDR, XDR ou votre compte.",
  merci: 'De rien ! N\'hésitez pas si vous avez d\'autres questions. 😊',
  prix: 'Nos tarifs varient selon le service. Consultez notre catalogue pour voir les prix détaillés.'
};

const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!email) e.email = "L'e-mail est requis.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format d'e-mail invalide.";
    if (!subject) e.subject = 'Le sujet est requis.';
    if (!message || message.length < 10) e.message = 'Le message doit faire au moins 10 caractères.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await contactService.send(email, subject, message);
      setSent(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-green-800/40 bg-green-950/20 p-6 text-center">
        <span className="text-3xl">✅</span>
        <h3 className="mt-2 font-semibold text-white">Message envoyé !</h3>
        <p className="mt-1 text-sm text-gray-400">Nous avons bien reçu votre message et vous répondrons sous 24 heures.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSent(false); setEmail(''); setSubject(''); setMessage(''); }}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-400">Adresse e-mail <span className="text-red-400">*</span></label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white focus:outline-none ${errors.email ? 'border-red-600' : 'border-gray-700'}`} />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-400">Sujet <span className="text-red-400">*</span></label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white focus:outline-none ${errors.subject ? 'border-red-600' : 'border-gray-700'}`}>
          <option value="">Choisir un sujet…</option>
          <option value="support">Support technique</option>
          <option value="billing">Facturation / Paiement</option>
          <option value="subscriptions">Abonnements</option>
          <option value="sales">Question commerciale</option>
          <option value="other">Autre</option>
        </select>
        {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-400">Message <span className="text-red-400">*</span></label>
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre demande en détail…"
          className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white focus:outline-none ${errors.message ? 'border-red-600' : 'border-gray-700'}`} />
        <p className="mt-1 text-xs text-gray-500">{message.length} caractères</p>
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
      </div>

      {apiError && <p className="text-sm text-red-400">{apiError}</p>}

      <Button type="submit" size="lg" fullWidth loading={loading}>Envoyer le message</Button>
    </form>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant Cyna. Comment puis-je vous aider aujourd'hui ?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: input.trim(), isBot: false }]);
    const q = input.toLowerCase();
    setInput('');
    setTyping(true);

    let reply = null;
    for (const [keyword, response] of Object.entries(CHATBOT_RESPONSES)) {
      if (q.includes(keyword)) { reply = response; break; }
    }

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: reply || "Je n'ai pas pu répondre à cette question. Utilisez le formulaire de contact pour être mis en relation avec notre équipe.",
        isBot: true,
        escalate: !reply
      }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 700);
  };

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
            {msg.isBot && <span className="text-xl">🤖</span>}
            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.isBot ? 'bg-gray-800 text-gray-200' : 'bg-blue-600 text-white'}`}>
              <p>{msg.text}</p>
              {msg.escalate && (
                <button onClick={() => document.getElementById('contact-form-tab')?.click()} className="mt-2 text-xs text-blue-300 underline">
                  → Ouvrir le formulaire de contact
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && <div className="text-sm text-gray-500">🤖 en train d'écrire...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-gray-800 p-3">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Posez votre question…"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
        />
        <button onClick={sendMessage} className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500" aria-label="Envoyer">→</button>
      </div>
    </div>
  );
};

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-800 py-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left text-sm text-gray-200">
        <span>{question}</span><span className="text-gray-500">{open ? '▲' : '▼'}</span>
      </button>
      {open && <p className="mt-2 text-sm text-gray-500">{answer}</p>}
    </div>
  );
};

const Contact = () => {
  const [tab, setTab] = useState('form');

  return (
    <div>
      <div className="border-b border-gray-800 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-white">Contact & Support</h1>
        <p className="mt-2 text-gray-400">Notre équipe est disponible du lundi au vendredi, 9h–18h. Le chatbot répond 24/7.</p>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-6 flex gap-2 border-b border-gray-800">
              <button id="contact-form-tab" onClick={() => setTab('form')}
                className={`px-4 py-2 text-sm font-medium ${tab === 'form' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500'}`}>
                📧 Formulaire
              </button>
              <button onClick={() => setTab('chatbot')}
                className={`px-4 py-2 text-sm font-medium ${tab === 'chatbot' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500'}`}>
                🤖 Chatbot (24/7)
              </button>
            </div>
            {tab === 'form' ? <ContactForm /> : <Chatbot />}
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="mb-4 font-semibold text-white">Nous contacter</h2>
              {[
                { icon: '✉️', label: 'E-mail', value: 'support@cyna.fr' },
                { icon: '📍', label: 'Adresse', value: '10 rue de la Paix, 75001 Paris' },
                { icon: '⏰', label: 'Horaires', value: 'Lun–Ven, 9h–18h' }
              ].map((item) => (
                <div key={item.label} className="mb-3 flex items-start gap-3 text-sm">
                  <span>{item.icon}</span>
                  <div>
                    <p className="text-gray-500">{item.label}</p>
                    <p className="text-gray-200">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="mb-2 font-semibold text-white">Questions fréquentes</h2>
              {FAQ.map((item, i) => <FaqItem key={i} question={item.q} answer={item.a} />)}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
