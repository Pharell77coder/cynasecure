import { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Button from '../components/Button';
import { contactService } from '../services/api';

const FAQ = [
  { q: 'Comment modifier mon abonnement ?', a: 'Rendez-vous dans "Mon compte" > "Commandes" pour consulter vos services actifs.' },
  { q: 'Quels modes de paiement sont acceptés ?', a: 'Nous acceptons les cartes Visa, Mastercard et American Express, via Stripe (PCI-DSS).' },
  { q: "Qu'est-ce que le SOC Cyna ?", a: 'Notre SOC surveille votre SI 24/7. Nos experts détectent et répondent aux incidents en temps réel.' },
  { q: 'Quelle est la différence EDR / XDR ?', a: "L'EDR protège vos endpoints. Le XDR étend la détection à l'ensemble de votre infrastructure : réseau, cloud et applications." }
];

const CHATBOT_RESPONSES = {
  abonnement: 'Rendez-vous dans "Mon compte" > "Commandes" pour consulter vos services Cyna.',
  paiement: "Nous acceptons Visa, Mastercard et American Express via Stripe (PCI-DSS). Aucune donnée carte n'est stockée chez nous.",
  facture: 'Le détail de vos commandes est disponible dans "Mon compte" > "Commandes".',
  soc: 'Notre SOC surveille votre SI 24/7. Nos experts détectent et répondent aux incidents en temps réel.',
  edr: 'Notre EDR protège vos endpoints par IA comportementale avec confinement automatique des menaces.',
  xdr: 'Notre XDR corrèle les menaces sur endpoint, réseau et cloud pour une vision unifiée de votre sécurité.',
  bonjour: "Bonjour ! Je suis l'assistant Cyna. Posez-moi vos questions sur nos services SOC, EDR, XDR ou votre compte.",
  merci: "De rien ! N'hésitez pas si vous avez d'autres questions. 😊",
  prix: 'Nos tarifs varient selon le service. Consultez notre catalogue pour voir les prix détaillés.'
};

function ContactForm() {
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

  const handleSubmit = async () => {
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
      <View className="items-center rounded-xl border border-green-800/40 bg-green-950/20 p-6">
        <Text className="text-3xl">✅</Text>
        <Text className="mt-2 font-semibold text-white">Message envoyé !</Text>
        <Text className="mt-1 text-center text-sm text-gray-400">Nous avons bien reçu votre message et vous répondrons sous 24 heures.</Text>
        <View className="mt-4">
          <Button variant="outline" size="sm" onPress={() => { setSent(false); setEmail(''); setSubject(''); setMessage(''); }}>
            Envoyer un autre message
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text className="mb-1 text-sm text-gray-400">Adresse e-mail *</Text>
        <TextInput
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
          className={`rounded-lg border bg-gray-800 px-3 py-2 text-white ${errors.email ? 'border-red-600' : 'border-gray-700'}`}
          placeholderTextColor="#6b7280"
        />
        {errors.email && <Text className="mt-1 text-xs text-red-400">{errors.email}</Text>}
      </View>

      <View>
        <Text className="mb-1 text-sm text-gray-400">Sujet *</Text>
        <View className={`rounded-lg border bg-gray-800 ${errors.subject ? 'border-red-600' : 'border-gray-700'}`}>
          <Picker selectedValue={subject} onValueChange={setSubject} style={{ color: '#fff' }} dropdownIconColor="#fff">
            <Picker.Item label="Choisir un sujet…" value="" />
            <Picker.Item label="Support technique" value="support" />
            <Picker.Item label="Facturation / Paiement" value="billing" />
            <Picker.Item label="Abonnements" value="subscriptions" />
            <Picker.Item label="Question commerciale" value="sales" />
            <Picker.Item label="Autre" value="other" />
          </Picker>
        </View>
        {errors.subject && <Text className="mt-1 text-xs text-red-400">{errors.subject}</Text>}
      </View>

      <View>
        <Text className="mb-1 text-sm text-gray-400">Message *</Text>
        <TextInput
          multiline numberOfLines={5} value={message} onChangeText={setMessage}
          placeholder="Décrivez votre demande en détail…" placeholderTextColor="#6b7280"
          className={`rounded-lg border bg-gray-800 px-3 py-2 text-white ${errors.message ? 'border-red-600' : 'border-gray-700'}`}
          style={{ textAlignVertical: 'top', minHeight: 100 }}
        />
        <Text className="mt-1 text-xs text-gray-500">{message.length} caractères</Text>
        {errors.message && <Text className="mt-1 text-xs text-red-400">{errors.message}</Text>}
      </View>

      {apiError && <Text className="text-sm text-red-400">{apiError}</Text>}

      <Button size="lg" fullWidth loading={loading} onPress={handleSubmit}>Envoyer le message</Button>
    </View>
  );
}

function Chatbot({ onEscalate }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant Cyna. Comment puis-je vous aider aujourd'hui ?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

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
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }, 700);
  };

  return (
    <View className="rounded-xl border border-gray-800 bg-gray-900" style={{ height: 420 }}>
      <ScrollView ref={scrollRef} className="flex-1 p-4" style={{ gap: 12 }}>
        {messages.map((msg) => (
          <View key={msg.id} className={`mb-3 flex-row gap-2 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
            {msg.isBot && <Text className="text-xl">🤖</Text>}
            <View className={`max-w-[75%] rounded-lg px-3 py-2 ${msg.isBot ? 'bg-gray-800' : 'bg-blue-600'}`}>
              <Text className={`text-sm ${msg.isBot ? 'text-gray-200' : 'text-white'}`}>{msg.text}</Text>
              {msg.escalate && (
                <Text className="mt-2 text-xs text-blue-300 underline" onPress={onEscalate}>
                  → Ouvrir le formulaire de contact
                </Text>
              )}
            </View>
          </View>
        ))}
        {typing && <Text className="text-sm text-gray-500">🤖 en train d'écrire...</Text>}
      </ScrollView>
      <View className="flex-row gap-2 border-t border-gray-800 p-3">
        <TextInput
          value={input} onChangeText={setInput} onSubmitEditing={sendMessage}
          placeholder="Posez votre question…" placeholderTextColor="#6b7280"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
        />
        <Text className="rounded-lg bg-blue-600 px-3 py-2 text-white" onPress={sendMessage}>→</Text>
      </View>
    </View>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="border-b border-gray-800 py-3">
      <View className="flex-row items-center justify-between" onTouchEnd={() => setOpen(!open)}>
        <Text className="flex-1 text-sm text-gray-200">{question}</Text>
        <Text className="text-gray-500">{open ? '▲' : '▼'}</Text>
      </View>
      {open && <Text className="mt-2 text-sm text-gray-500">{answer}</Text>}
    </View>
  );
}

export default function Contact() {
  const [tab, setTab] = useState('form');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-950">
      <ScrollView>
        <View className="border-b border-gray-800 px-4 py-12">
          <Text className="text-center text-2xl font-bold text-white">Contact & Support</Text>
          <Text className="mt-2 text-center text-gray-400">
            Notre équipe est disponible du lundi au vendredi, 9h–18h. Le chatbot répond 24/7.
          </Text>
        </View>

        <View className="px-4 py-10">
          <View className="mb-6 flex-row gap-2 border-b border-gray-800">
            <Text
              onPress={() => setTab('form')}
              className={`px-4 py-2 text-sm font-medium ${tab === 'form' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500'}`}
            >
              📧 Formulaire
            </Text>
            <Text
              onPress={() => setTab('chatbot')}
              className={`px-4 py-2 text-sm font-medium ${tab === 'chatbot' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500'}`}
            >
              🤖 Chatbot (24/7)
            </Text>
          </View>

          {tab === 'form' ? <ContactForm /> : <Chatbot onEscalate={() => setTab('form')} />}

          <View className="mt-10" style={{ gap: 32 }}>
            <View>
              <Text className="mb-4 font-semibold text-white">Nous contacter</Text>
              {[
                { icon: '✉️', label: 'E-mail', value: 'support@cyna.fr' },
                { icon: '📍', label: 'Adresse', value: '10 rue de la Paix, 75001 Paris' },
                { icon: '⏰', label: 'Horaires', value: 'Lun–Ven, 9h–18h' }
              ].map((item) => (
                <View key={item.label} className="mb-3 flex-row items-start gap-3">
                  <Text>{item.icon}</Text>
                  <View>
                    <Text className="text-sm text-gray-500">{item.label}</Text>
                    <Text className="text-sm text-gray-200">{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View>
              <Text className="mb-2 font-semibold text-white">Questions fréquentes</Text>
              {FAQ.map((item, i) => <FaqItem key={i} question={item.q} answer={item.a} />)}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}