import { useContext } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

export default function Cart() {
  const { cart, cartTotal, unitPriceFor, updateQuantity, updateBillingPeriod, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  if (cart.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 px-4 py-24">
        <Text className="text-4xl">🛒</Text>
        <Text className="mt-4 text-xl font-bold text-white">Votre panier est vide</Text>
        <Text className="mt-2 text-gray-400">Découvrez nos solutions de sécurité SaaS</Text>
        <View className="mt-6">
          <Button variant="primary" size="lg" onPress={() => navigation.navigate('CatalogueTab')}>
            Voir le catalogue
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 py-10">
      <Text className="text-2xl font-bold text-white">Mon panier</Text>

      <View className="mt-8" style={{ gap: 16 }}>
        {cart.map((item) => {
          const unitPrice = unitPriceFor(item);
          const icon = item.name.includes('SOC') ? '🛡️' : item.name.includes('EDR') ? '💻' : '🔍';
          return (
            <View key={`${item.id}-${item.billing_period}`} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <View className="flex-row items-center gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-lg bg-gray-800">
                  <Text className="text-2xl">{icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-white">{item.name}</Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center gap-3">
                <View className="flex-1 rounded-lg border border-gray-700 bg-gray-800">
                  <Picker
                    selectedValue={item.billing_period}
                    onValueChange={(v) => updateBillingPeriod(item.id, item.billing_period, v)}
                    style={{ color: '#fff' }}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item label="Mensuel" value="monthly" />
                    <Picker.Item label="Annuel (−17%)" value="annual" />
                  </Picker>
                </View>

                <View className="flex-row items-center gap-3 rounded-lg border border-gray-700 px-3 py-1.5">
                  <Text className="text-sm text-gray-500" onPress={() => updateQuantity(item.id, item.billing_period, item.quantity - 1)}>−</Text>
                  <Text className="text-white">{item.quantity}</Text>
                  <Text className="text-sm text-gray-500" onPress={() => updateQuantity(item.id, item.billing_period, item.quantity + 1)}>+</Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center justify-between border-t border-gray-800 pt-3">
                <Text className="text-sm text-gray-500">
                  {item.billing_period === 'annual' ? `${unitPrice} € / an` : `${unitPrice} € / mois`}
                </Text>
                <Text className="font-semibold text-white">{unitPrice * item.quantity} €</Text>
              </View>
              <Text className="mt-1 text-xs text-red-400" onPress={() => removeFromCart(item.id, item.billing_period)}>
                Supprimer
              </Text>
            </View>
          );
        })}
      </View>

      <View className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <Text className="mb-4 text-lg font-semibold text-white">Récapitulatif</Text>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-400">Sous-total</Text>
          <Text className="text-sm text-gray-400">{cartTotal} €</Text>
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-sm text-gray-400">TVA (20%)</Text>
          <Text className="text-sm text-gray-400">{Math.round(cartTotal * 0.2)} €</Text>
        </View>
        <View className="mt-4 flex-row justify-between border-t border-gray-800 pt-4">
          <Text className="font-semibold text-white">Total TTC</Text>
          <Text className="font-semibold text-white">{Math.round(cartTotal * 1.2)} €</Text>
        </View>

        {!user && (
          <View className="mt-4 rounded-lg border border-blue-800/40 bg-blue-950/30 p-3">
            <Text className="text-xs text-blue-300">
              💡 Connectez-vous pour finaliser votre commande.
            </Text>
          </View>
        )}

        <View className="mt-6">
          <Button
            variant="primary" size="lg" fullWidth
            onPress={() => navigation.navigate(user ? 'Checkout' : 'AccountTab')}
          >
            Passer à la caisse →
          </Button>
        </View>
        <Text className="mt-4 text-center text-sm text-gray-400" onPress={() => navigation.navigate('CatalogueTab')}>
          ← Continuer mes achats
        </Text>
      </View>
    </ScrollView>
  );
}