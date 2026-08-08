import { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme';

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
export const LoginScreen = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.goBack();
    } catch {
      Alert.alert('Connexion impossible', 'E-mail ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgLight }} contentContainerStyle={{ flexGrow: 1 }}>

        {/* Header */}
        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.authHeader}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.authTitle}>Connexion</Text>
          <Text style={styles.authSubtitle}>Accédez à vos services Cyna</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          <Field label="Adresse e-mail" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" placeholder="vous@entreprise.com" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword}
            secureTextEntry placeholder="••••••••" />

          {/* Se souvenir de moi */}
          <TouchableOpacity style={styles.checkRow} onPress={() => setRemember(!remember)}>
            <View style={[styles.checkbox, remember && styles.checkboxActive]}>
              {remember && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>Se souvenir de moi</Text>
          </TouchableOpacity>

          <Button onPress={handleLogin} variant="primary" size="lg" fullWidth loading={loading} style={{ marginTop: spacing[2] }}>
            Se connecter
          </Button>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} /><Text style={styles.dividerText}>ou</Text><View style={styles.divider} />
          </View>

          <Button onPress={() => navigation.navigate('Register')} variant="outline" size="lg" fullWidth>
            Créer un compte
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ════════════════════════════════════════
   REGISTER
════════════════════════════════════════ */
export const RegisterScreen = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const { register } = useContext(AuthContext);
  const navigation = useNavigation();

  const rules = [
    { ok: password.length >= 8,          l: '8 caractères minimum' },
    { ok: /[A-Z]/.test(password),        l: 'Une majuscule' },
    { ok: /[0-9]/.test(password),        l: 'Un chiffre' },
    { ok: /[^A-Za-z0-9]/.test(password), l: 'Un caractère spécial' },
  ];
  const allValid = rules.every(r => r.ok);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.'); return;
    }
    if (!allValid) {
      Alert.alert('Mot de passe trop faible', 'Respectez toutes les règles de sécurité.'); return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      setSent(true);
    } catch {
      Alert.alert('Erreur', 'Cet e-mail est déjà utilisé.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.sentWrap}>
        <Text style={{ fontSize: 60 }}>✅</Text>
        <Text style={styles.sentTitle}>Compte créé !</Text>
        <Text style={styles.sentText}>
          Un e-mail de confirmation a été envoyé à {email}. Cliquez sur le lien pour activer votre compte.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} variant="primary" size="lg" fullWidth style={{ marginTop: spacing[6] }}>
          Retour à la connexion
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgLight }} contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.authHeader}>
          <View style={styles.logoBox}><Text style={styles.logoText}>C</Text></View>
          <Text style={styles.authTitle}>Créer un compte</Text>
          <Text style={styles.authSubtitle}>Rejoignez Cyna – secure your future</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Jean Dupont" />
          <Field label="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="vous@entreprise.com" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          {/* Règles mot de passe */}
          {password.length > 0 && (
            <View style={styles.rulesWrap}>
              {rules.map((r, i) => (
                <View key={i} style={styles.ruleRow}>
                  <Text style={[styles.ruleDot, r.ok && styles.ruleDotOk]}>{r.ok ? '✓' : '○'}</Text>
                  <Text style={[styles.ruleText, r.ok && styles.ruleTextOk]}>{r.l}</Text>
                </View>
              ))}
            </View>
          )}

          <Button onPress={handleRegister} variant="primary" size="lg" fullWidth loading={loading}
            disabled={loading || !allValid} style={{ marginTop: spacing[4] }}>
            Créer mon compte
          </Button>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ── Field helper ── */
const Field = ({ label, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const styles = StyleSheet.create({
  authHeader: { padding: spacing[8], alignItems: 'center', gap: spacing[3] },
  logoBox: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText:    { fontSize: 30, fontWeight: '900', color: 'white' },
  authTitle:   { fontSize: typography['3xl'], fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  authSubtitle:{ fontSize: typography.base, color: 'rgba(255,255,255,0.6)' },

  form: { padding: spacing[6], gap: spacing[1] },

  field: { marginBottom: spacing[4] },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[1] },
  input: {
    borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing[3],
    fontSize: typography.base,
    color: colors.textPrimary,
    backgroundColor: colors.bgWhite,
  },

  checkRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginVertical: spacing[2] },
  checkbox:    { width: 20, height: 20, borderWidth: 2, borderColor: colors.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  checkmark:   { color: 'white', fontSize: 12, fontWeight: '700' },
  checkLabel:  { fontSize: typography.sm, color: colors.textMuted },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginVertical: spacing[4] },
  divider:     { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: typography.sm, color: colors.textMuted },

  linkBtn: { alignItems: 'center', paddingVertical: spacing[3] },
  link:    { fontSize: typography.sm, color: colors.secondary, fontWeight: '600' },

  rulesWrap: { backgroundColor: colors.bgLight, borderRadius: radius.md, padding: spacing[3], gap: spacing[2] },
  ruleRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  ruleDot:   { fontWeight: '700', color: colors.textMuted, fontSize: typography.sm },
  ruleDotOk: { color: colors.success },
  ruleText:  { fontSize: typography.sm, color: colors.textMuted },
  ruleTextOk:{ color: colors.success },

  sentWrap:  { flex: 1, padding: spacing[8], alignItems: 'center', justifyContent: 'center', gap: spacing[4], backgroundColor: colors.bgLight },
  sentTitle: { fontSize: typography['3xl'], fontWeight: '900', color: colors.primary },
  sentText:  { fontSize: typography.base, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
