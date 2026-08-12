import { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services/api';
import Button from '../components/Button';
import { colors, spacing, typography, radius } from '../theme';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

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
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    if (user) {
      orderService.list().then((orders) => setOrderCount(orders.length)).catch(() => {});
    }
  }, [user]);

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

  const initials = (user.username || 'U').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient colors={['#0D0B3B', '#1E1B74']} style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <Text style={styles.profileName}>{user.username}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {user.role === 'admin' && (
            <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Administrateur</Text></View>
          )}
          {!user.is_verified && (
            <View style={styles.unverifiedBadge}><Text style={styles.unverifiedBadgeText}>⚠️ E-mail non vérifié</Text></View>
          )}
        </LinearGradient>

        <Section title="🧾 Commandes & facturation">
          <MenuItem
            icon="📦"
            label="Historique des commandes"
            value={orderCount !== null ? `${orderCount} commande${orderCount > 1 ? 's' : ''}` : undefined}
            onPress={() => navigation.navigate('Orders')}
          />
          <MenuItem icon="🏠" label="Carnet d'adresses" onPress={() => {}} />
          <MenuItem icon="💳" label="Méthodes de paiement" onPress={() => {}} />
        </Section>

        <Section title="⚙️ Mon compte">
          <MenuItem icon="👤" label="Nom d'utilisateur" value={user.username} onPress={() => {}} />
          <MenuItem icon="✉️" label="Adresse e-mail" value={user.email} onPress={() => {}} />
          <MenuItem icon="🔒" label="Changer le mot de passe" onPress={() => {}} />
        </Section>

        <Section title="ℹ️ Informations">
          <MenuItem icon="📄" label="CGU" onPress={() => {}} />
          <MenuItem icon="⚖️" label="Mentions légales" onPress={() => {}} />
          <MenuItem icon="💬" label="Contact" onPress={() => navigation.navigate('ContactTab')} />
        </Section>

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

  profileHeader: { alignItems: 'center', padding: spacing[8], gap: spacing[2] },
  avatar: { width: 72, height: 72, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  avatarText: { fontSize: typography['3xl'], fontWeight: '900', color: 'white' },
  profileName: { fontSize: typography['2xl'], fontWeight: '800', color: 'white', letterSpacing: -0.3 },
  profileEmail: { fontSize: typography.sm, color: 'rgba(255,255,255,0.6)' },
  adminBadge: { backgroundColor: 'rgba(123,63,228,0.4)', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4, marginTop: spacing[2] },
  adminBadgeText: { color: 'white', fontSize: typography.xs, fontWeight: '700' },
  unverifiedBadge: { backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 4, marginTop: spacing[2] },
  unverifiedBadgeText: { color: '#FCD34D', fontSize: typography.xs, fontWeight: '700' },

  section: { backgroundColor: colors.bgWhite, marginVertical: spacing[1] },
  sectionTitle: { fontSize: typography.sm, fontWeight: '700', color: colors.textMuted, padding: spacing[4], paddingBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4], borderTopWidth: 1, borderColor: colors.border, gap: spacing[3] },
  menuIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: typography.base, fontWeight: '500', color: colors.textPrimary },
  menuValue: { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },
  menuArrow: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },

  notLoggedIn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8], gap: spacing[3] },
  nlTitle: { fontSize: typography['2xl'], fontWeight: '800', color: colors.primary },
  nlText: { fontSize: typography.base, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});

export default AccountScreen;
