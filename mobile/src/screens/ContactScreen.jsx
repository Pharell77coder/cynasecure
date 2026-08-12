import { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { contactService } from '../services/api';
import { colors, spacing, typography, radius, shadow } from '../theme';

const FAQ = [
  { q: 'Comment gérer mon abonnement ?', a: 'Rendez-vous dans "Mon compte" > commandes pour consulter vos services actifs.' },
  { q: 'Quels modes de paiement ?', a: 'Nous acceptons Visa, Mastercard et American Express via Stripe (PCI-DSS).' },
  { q: "Qu'est-ce que le SOC ?", a: 'Notre SOC surveille votre SI 24/7. Nos experts détectent et répondent aux incidents.' },
  { q: 'Différence EDR et XDR ?', a: "L'EDR protège vos endpoints. Le XDR corrèle les menaces sur endpoint, réseau et cloud." },
];

const CHATBOT_RESPONSES = {
  abonnement: 'Rendez-vous dans "Mon compte" > commandes pour consulter vos services Cyna.',
  paiement: 'Nous acceptons Visa, Mastercard et American Express via Stripe (PCI-DSS).',
  soc: 'Notre SOC surveille votre SI 24/7. Nos experts détectent et répondent aux incidents en temps réel.',
  edr: 'Notre EDR protège vos endpoints par IA comportementale.',
  xdr: 'Notre XDR corrèle les menaces sur endpoint, réseau et cloud.',
  bonjour: "Bonjour ! Posez-moi vos questions sur nos services SOC, EDR, XDR ou votre compte.",
  merci: 'De rien ! N\'hésitez pas si vous avez d\'autres questions. 😊',
};

const Field = ({ label, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const Bubble = ({ msg }) => (
  <View style={[styles.bubble, msg.isBot ? styles.bubbleBot : styles.bubbleUser]}>
    {msg.isBot && <Text style={styles.bubbleBotIcon}>🤖</Text>}
    <View style={[styles.bubbleContent, msg.isBot ? styles.bubbleContentBot : styles.bubbleContentUser]}>
      <Text style={[styles.bubbleText, msg.isBot && styles.bubbleTextBot]}>{msg.text}</Text>
    </View>
  </View>
);

const ContactScreen = () => {
  const [tab, setTab] = useState('form');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant Cyna. Comment puis-je vous aider ?", isBot: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef(null);

  const handleSend = async () => {
    if (!email || !subject || !message) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    if (message.length < 10) {
      Alert.alert('Message trop court', 'Le message doit faire au moins 10 caractères.');
      return;
    }
    setSending(true);
    try {
      await contactService.send(email, subject, message);
      Alert.alert('Message envoyé !', 'Nous vous répondrons sous 24h.', [
        { text: 'OK', onPress: () => { setEmail(''); setSubject(''); setMessage(''); } },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.message || "L'envoi du message a échoué.");
    } finally {
      setSending(false);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: chatInput, isBot: false }]);
    const q = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let reply = null;
      for (const [keyword, response] of Object.entries(CHATBOT_RESPONSES)) {
        if (q.includes(keyword)) { reply = response; break; }
      }
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: reply || 'Je ne peux pas répondre à cette question. Utilisez le formulaire de contact pour joindre notre équipe.',
        isBot: true,
      }]);
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.header}>
          <Text style={styles.headerTitle}>Contact & Support</Text>
          <Text style={styles.headerSub}>Nous sommes là pour vous aider</Text>
        </LinearGradient>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'form' && styles.tabActive]} onPress={() => setTab('form')}>
            <Text style={[styles.tabText, tab === 'form' && styles.tabTextActive]}>📧 Formulaire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'chatbot' && styles.tabActive]} onPress={() => setTab('chatbot')}>
            <Text style={[styles.tabText, tab === 'chatbot' && styles.tabTextActive]}>🤖 Chatbot</Text>
          </TouchableOpacity>
        </View>

        {tab === 'form' && (
          <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: spacing[8] }}>
            <Field label="Adresse e-mail *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="vous@entreprise.com" />
            <Field label="Sujet *" value={subject} onChangeText={setSubject} placeholder="Problème technique, question…" />
            <View style={styles.field}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Décrivez votre demande…"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            <Button onPress={handleSend} variant="primary" size="lg" fullWidth loading={sending} style={{ marginTop: spacing[2] }}>
              Envoyer le message
            </Button>

            <Text style={styles.faqTitle}>Questions fréquentes</Text>
            {FAQ.map((item, i) => (
              <View key={i} style={styles.faqItem}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Text style={styles.faqA}>{item.a}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {tab === 'chatbot' && (
          <>
            <ScrollView
              ref={chatRef}
              style={styles.chat}
              contentContainerStyle={{ padding: spacing[4], paddingBottom: spacing[2] }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Posez votre question…"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={handleChatSend}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleChatSend}>
                <LinearGradient colors={['#1E1B74', '#7B3FE4']} style={styles.chatSendGradient}>
                  <Text style={styles.chatSendIcon}>↑</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgLight },
  header: { padding: spacing[6], paddingBottom: spacing[5] },
  headerTitle: { fontSize: typography['2xl'], fontWeight: '900', color: 'white', letterSpacing: -0.3 },
  headerSub: { fontSize: typography.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  tabs: { flexDirection: 'row', backgroundColor: colors.bgWhite, borderBottomWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing[3], alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: typography.base, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },

  form: { flex: 1, padding: spacing[4] },
  field: { marginBottom: spacing[4] },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[1] },
  input: { borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, padding: spacing[3], fontSize: typography.base, color: colors.textPrimary, backgroundColor: colors.bgWhite },
  textarea: { minHeight: 120, textAlignVertical: 'top' },

  faqTitle: { fontSize: typography.lg, fontWeight: '800', color: colors.primary, marginTop: spacing[6], marginBottom: spacing[3] },
  faqItem: { padding: spacing[4], backgroundColor: colors.bgWhite, borderRadius: radius.md, marginBottom: spacing[2], ...shadow.sm },
  faqQ: { fontSize: typography.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  faqA: { fontSize: typography.sm, color: colors.textMuted, lineHeight: 18 },

  chat: { flex: 1, backgroundColor: colors.bgLight },
  bubble: { flexDirection: 'row', marginBottom: spacing[3], alignItems: 'flex-end', gap: spacing[2] },
  bubbleBot: { justifyContent: 'flex-start' },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleBotIcon: { fontSize: 24, marginBottom: 4 },
  bubbleContent: { maxWidth: '75%', borderRadius: radius.lg, padding: spacing[3] },
  bubbleContentBot: { backgroundColor: colors.bgWhite, borderBottomLeftRadius: radius.sm, ...shadow.sm },
  bubbleContentUser: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  bubbleText: { fontSize: typography.base, color: colors.textPrimary, lineHeight: 20 },
  bubbleTextBot: { color: colors.textPrimary },

  chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], padding: spacing[3], backgroundColor: colors.bgWhite, borderTopWidth: 1, borderColor: colors.border },
  chatInput: { flex: 1, backgroundColor: colors.bgLight, borderRadius: radius.full, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: typography.base, color: colors.textPrimary },
  chatSendBtn: {},
  chatSendGradient: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  chatSendIcon: { fontSize: typography.xl, fontWeight: '900', color: 'white' },
});

export default ContactScreen;
