import { useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import { colors, spacing, typography, radius, shadow } from '../theme';

/* ── Section card ── */
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

/* ── Menu item ── */
const MenuItem = ({ icon, label, value, onPress, danger = false }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <View style={styles.menuInfo}>
      <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const AccountScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notLoggedIn}>
          <Text style={{ fontSize: 60 }}>👤</Text>
          <Text style={styles.nlTitle}>Non connecté</Text>
          <Text style={styles.nlText}>Connectez-vous pour accéder à votre espace client.</Text>
          <Button onPress={() => navigation.navigate('Login')} variant="primary" size="lg" fullWidth style={{ marginTop: spacing[5] }}>
            Se connecter
          </Button>
          <Button onPress={() => navigation.navigate('Register')} variant="outline" size="md" fullWidth style={{ marginTop: spacing[3] }}>
            Créer un compte
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = (user.name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header profil */}
        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {user.roles?.includes('ROLE_ADMIN') && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrateur</Text>
            </View>
          )}
        </LinearGradient>

        {/* Abonnements actifs */}
        <Section title="📋 Mes abonnements actifs">
          {[
            { name: 'Cyna SOC Essential', status: 'Actif', renewal: 'Renouvellement le 01/08/2026' },
            { name: 'Cyna EDR Pro',       status: 'Actif', renewal: 'Renouvellement le 15/08/2026' },
          ].map((sub, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.subIcon}>
                <Text style={{ fontSize: 20 }}>{sub.name.includes('SOC') ? '🛡️' : '💻'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subName}>{sub.name}</Text>
                <Text style={styles.subRenewal}>{sub.renewal}</Text>
              </View>
              <View style={styles.subStatus}>
                <Text style={styles.subStatusText}>{sub.status}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* Mon compte */}
        <Section title="⚙️ Mon compte">
          <MenuItem icon="👤" label="Informations personnelles" value={user.name} onPress={() => {}} />
          <MenuItem icon="✉️" label="Adresse e-mail"           value={user.email} onPress={() => {}} />
          <MenuItem icon="🔒" label="Changer le mot de passe"                     onPress={() => {}} />
        </Section>

        {/* Commandes & facturation */}
        <Section title="🧾 Commandes & facturation">
          <MenuItem icon="📦" label="Historique des commandes" onPress={() => navigation.navigate('Orders')} />
          <MenuItem icon="🏠" label="Carnet d'adresses"         onPress={() => {}} />
          <MenuItem icon="💳" label="Méthodes de paiement"      onPress={() => {}} />
        </Section>

        {/* Informations */}
        <Section title="ℹ️ Informations">
          <MenuItem icon="📄" label="CGU"            onPress={() => {}} />
          <MenuItem icon="⚖️" label="Mentions légales" onPress={() => {}} />
          <MenuItem icon="💬" label="Contact"         onPress={() => navigation.navigate('ContactTab')} />
        </Section>

        {/* Déconnexion */}
        <View style={{ padding: spacing[5] }}>
          <Button onPress={handleLogout} variant="danger" size="lg" fullWidth>
            Se déconnecter
          </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgLight },

  /* Header */
  profileHeader: { alignItems: 'center', padding: spacing[8], gap: spacing[2] },
  avatar: {
    width: 72, height: 72, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[2],
  },
  avatarText:   { fontSize: typography['3xl'], fontWeight: '900', color: 'white' },
  profileName:  { fontSize: typography['2xl'], fontWeight: '800', color: 'white', letterSpacing: -0.3 },
  profileEmail: { fontSize: typography.sm, color: 'rgba(255,255,255,0.6)' },
  adminBadge:   { backgroundColor: 'rgba(123,63,228,0.4)', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4, marginTop: spacing[2] },
  adminBadgeText: { color: 'white', fontSize: typography.xs, fontWeight: '700' },

  /* Sections */
  section:      { backgroundColor: colors.bgWhite, marginVertical: spacing[1] },
  sectionTitle: { fontSize: typography.sm, fontWeight: '700', color: colors.textMuted, padding: spacing[4], paddingBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Menu items */
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
    borderTopWidth: 1, borderColor: colors.border, gap: spacing[3],
  },
  menuIcon:  { fontSize: 18, width: 24, textAlign: 'center' },
  menuInfo:  { flex: 1 },
  menuLabel: { fontSize: typography.base, fontWeight: '500', color: colors.textPrimary },
  menuValue: { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },
  menuArrow: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },

  /* Abonnements */
  subCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderTopWidth: 1, borderColor: colors.border, gap: spacing[3],
  },
  subIcon:   { width: 40, height: 40, backgroundColor: colors.bgLight, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  subName:   { fontSize: typography.base, fontWeight: '600', color: colors.textPrimary },
  subRenewal:{ fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  subStatus: { backgroundColor: '#D1FAE5', borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 3 },
  subStatusText: { fontSize: typography.xs, fontWeight: '700', color: '#065F46' },

  /* Not logged in */
  notLoggedIn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8], gap: spacing[3] },
  nlTitle:     { fontSize: typography['2xl'], fontWeight: '800', color: colors.primary },
  nlText:      { fontSize: typography.base, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});

export default AccountScreen;
