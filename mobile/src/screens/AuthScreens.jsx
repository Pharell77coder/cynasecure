import { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme';

const Field = ({ label, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const AuthHeader = ({ title, subtitle }) => (
  <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.authHeader}>
    <View style={styles.logoBox}><Text style={styles.logoText}>C</Text></View>
    <Text style={styles.authTitle}>{title}</Text>
    <Text style={styles.authSubtitle}>{subtitle}</Text>
  </LinearGradient>
);

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      Alert.alert('Connexion impossible', err.message || 'E-mail ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgLight }} contentContainerStyle={{ flexGrow: 1 }}>
        <AuthHeader title="Connexion" subtitle="Accédez à vos services Cyna" />

        <View style={styles.form}>
          <Field label="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="vous@entreprise.com" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register } = useContext(AuthContext);
  const navigation = useNavigation();

  const rules = [
    { ok: password.length >= 8, l: '8 caractères minimum' },
    { ok: /[A-Z]/.test(password), l: 'Une majuscule' },
    { ok: /[a-z]/.test(password), l: 'Une minuscule' },
    { ok: /[0-9]/.test(password), l: 'Un chiffre' },
  ];
  const allValid = rules.every((r) => r.ok);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }
    if (!allValid) {
      Alert.alert('Mot de passe trop faible', 'Respectez toutes les règles de sécurité.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      setSent(true);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Cet e-mail est peut-être déjà utilisé.');
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
        <AuthHeader title="Créer un compte" subtitle="Rejoignez Cyna – secure your future" />

        <View style={styles.form}>
          <Field label="Nom complet" value={name} onChangeText={setName} placeholder="Jean Dupont" />
          <Field label="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="vous@entreprise.com" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

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

          <Button onPress={handleRegister} variant="primary" size="lg" fullWidth loading={loading} disabled={loading || !allValid} style={{ marginTop: spacing[4] }}>
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

/* ════════════════════════════════════════
   MOT DE PASSE OUBLIÉ
════════════════════════════════════════ */
export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Erreur', 'Veuillez saisir votre e-mail.'); return; }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgLight }} contentContainerStyle={{ flexGrow: 1 }}>
        <AuthHeader title="Mot de passe oublié" subtitle="On vous envoie un lien de réinitialisation" />
        <View style={styles.form}>
          {sent ? (
            <View style={styles.sentBanner}>
              <Text style={styles.sentBannerText}>
                ✅ Si un compte existe pour {email}, un lien de réinitialisation vient de lui être envoyé.
              </Text>
            </View>
          ) : (
            <>
              <Text style={{ color: colors.textMuted, marginBottom: spacing[4] }}>
                Entrez votre e-mail pour recevoir un lien de réinitialisation.
              </Text>
              <Field label="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="vous@entreprise.com" />
              <Button onPress={handleSubmit} variant="primary" size="lg" fullWidth loading={loading}>
                Envoyer le lien
              </Button>
            </>
          )}
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>← Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ════════════════════════════════════════
   RÉINITIALISATION DU MOT DE PASSE
   Ouvert via le lien de l'e-mail (deep link cyna://reset-password?token=...)
   → configurer le deep linking Expo (app.json "scheme": "cyna") pour que
   ce screen reçoive automatiquement route.params.token.
════════════════════════════════════════ */
export const ResetPasswordScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { resetPassword } = useContext(AuthContext);

  const [token, setToken] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (route.params?.token) setToken(route.params.token);
  }, [route.params?.token]);

  const handleSubmit = async () => {
    if (!token) { Alert.alert('Erreur', 'Jeton de réinitialisation manquant.'); return; }
    if (password !== confirm) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { Alert.alert('Erreur', 'Le mot de passe doit faire au moins 8 caractères.'); return; }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Le jeton est invalide ou a expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.sentWrap}>
        <Text style={{ fontSize: 60 }}>✅</Text>
        <Text style={styles.sentTitle}>Mot de passe réinitialisé</Text>
        <Text style={styles.sentText}>Vous allez être redirigé vers la connexion...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgLight }} contentContainerStyle={{ flexGrow: 1 }}>
        <AuthHeader title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe" />
        <View style={styles.form}>
          {!route.params?.token && (
            <Field label="Jeton de réinitialisation" value={token} onChangeText={setToken} placeholder="Collé depuis l'e-mail reçu" autoCapitalize="none" />
          )}
          <Field label="Nouveau mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <Field label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="••••••••" />
          <Button onPress={handleSubmit} variant="primary" size="lg" fullWidth loading={loading}>
            Réinitialiser mon mot de passe
          </Button>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>← Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ════════════════════════════════════════
   VÉRIFICATION D'E-MAIL
   Ouvert via le lien de l'e-mail (deep link cyna://verify-email?token=...)
════════════════════════════════════════ */
export const VerifyEmailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { verifyEmail } = useContext(AuthContext);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = route.params?.token;
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide (jeton manquant).');
      return;
    }
    verifyEmail(token)
      .then((data) => { setStatus('success'); setMessage(data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.message); });
  }, [route.params?.token]);

  return (
    <View style={styles.sentWrap}>
      {status === 'loading' && <ActivityIndicator color={colors.primary} size="large" />}
      {status !== 'loading' && (
        <>
          <Text style={{ fontSize: 50 }}>{status === 'success' ? '✅' : '❌'}</Text>
          <Text style={[styles.sentTitle, status === 'error' && { color: colors.danger }]}>{message}</Text>
          <Button onPress={() => navigation.navigate('Login')} variant="primary" size="lg" fullWidth style={{ marginTop: spacing[6] }}>
            Aller à la connexion
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  authHeader: { padding: spacing[8], alignItems: 'center', gap: spacing[3] },
  logoBox: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 30, fontWeight: '900', color: 'white' },
  authTitle: { fontSize: typography['3xl'], fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  authSubtitle: { fontSize: typography.base, color: 'rgba(255,255,255,0.6)' },

  form: { padding: spacing[6], gap: spacing[1] },

  field: { marginBottom: spacing[4] },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[1] },
  input: { borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, padding: spacing[3], fontSize: typography.base, color: colors.textPrimary, backgroundColor: colors.bgWhite },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginVertical: spacing[4] },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: typography.sm, color: colors.textMuted },

  linkBtn: { alignItems: 'center', paddingVertical: spacing[3] },
  link: { fontSize: typography.sm, color: colors.secondary, fontWeight: '600' },

  rulesWrap: { backgroundColor: colors.bgLight, borderRadius: radius.md, padding: spacing[3], gap: spacing[2] },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  ruleDot: { fontWeight: '700', color: colors.textMuted, fontSize: typography.sm },
  ruleDotOk: { color: colors.success },
  ruleText: { fontSize: typography.sm, color: colors.textMuted },
  ruleTextOk: { color: colors.success },

  sentWrap: { flex: 1, padding: spacing[8], alignItems: 'center', justifyContent: 'center', gap: spacing[4], backgroundColor: colors.bgLight },
  sentTitle: { fontSize: typography['2xl'], fontWeight: '900', color: colors.primary, textAlign: 'center' },
  sentText: { fontSize: typography.base, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  sentBanner: { backgroundColor: '#D1FAE5', borderRadius: radius.md, padding: spacing[4], marginBottom: spacing[4] },
  sentBannerText: { color: '#065F46', fontSize: typography.sm, lineHeight: 20 },
});
