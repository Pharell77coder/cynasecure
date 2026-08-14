import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { paymentService } from './src/services/api';
import { colors, typography } from './src/theme';

// Remplace ton composant App par cette version plus robuste :
export default function App() {
  const [publishableKey, setPublishableKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paymentService.getConfig()
      .then((data) => {
        if (data && data.publishable_key) {
          setPublishableKey(data.publishable_key);
        } else {
          setError('La clé Stripe est manquante sur le serveur.');
        }
      })
      .catch(() => setError('Impossible de contacter le serveur Cyna.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !publishableKey) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Clé Stripe non valide'}</Text>
        <Text style={styles.errorHint}>Vérifiez votre fichier .env Flask et que l'API tourne.</Text>
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