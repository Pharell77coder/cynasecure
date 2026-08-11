import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { paymentService } from './src/services/api';
import { colors, typography } from './src/theme';

export default function App() {
  const [publishableKey, setPublishableKey] = useState(null);
  const [error, setError] = useState(null);

  /* La clé publishable Stripe n'est pas codée en dur côté app : on la
     récupère au démarrage depuis /api/payments/config, exactement comme
     le fait Checkout.jsx côté web. */
  useEffect(() => {
    paymentService.getConfig()
      .then((data) => setPublishableKey(data.publishable_key))
      .catch(() => setError('Impossible de contacter le serveur Cyna.'));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>Vérifiez que le backend Flask tourne et que l'URL dans src/services/api.js est correcte.</Text>
      </View>
    );
  }

  if (!publishableKey) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={publishableKey} urlScheme="cyna" merchantIdentifier="merchant.com.cyna">
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgLight, padding: 24, gap: 12 },
  errorText: { fontSize: typography.lg, fontWeight: '700', color: colors.danger, textAlign: 'center' },
  errorHint: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center' },
});
