import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from './Button';
import { CATEGORY_ICONS } from '../constants/categories';

/**
 * Carte produit SaaS (accueil, catalogue, recherche).
 * @param {object} product - { id, name, price_monthly, available, category_id, categorySlug }
 * @param {string} categoryIcon - icône déjà résolue (évite de refaire le lookup à chaque carte)
 * @param {string} variant - 'grid' | 'list'
 */
export default function ProductCard({ product, categoryIcon, variant = 'grid' }) {
  const navigation = useNavigation();
  const { id, name, price_monthly, available = true } = product;
  const icon = categoryIcon || CATEGORY_ICONS[product.categorySlug] || '🔒';
  const isList = variant === 'list';

  const goToProduct = () =>
    navigation.navigate('CatalogueTab', { screen: 'Product', params: { id } });

  return (
    <TouchableOpacity
      onPress={goToProduct}
      activeOpacity={0.8}
      className={`rounded-xl border border-gray-800 bg-gray-900 ${
        isList ? 'flex-row items-center gap-4 p-4' : 'flex-col p-6'
      } ${!available ? 'opacity-60' : ''}`}
    >
      <View
        className={`items-center justify-center rounded-lg bg-gray-800 ${
          isList ? 'h-16 w-16' : 'mb-4 h-20 w-20 self-start'
        }`}
      >
        <Text className="text-3xl">{icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-white">{name}</Text>

        {!available && (
          <View className="mt-1 self-start rounded border border-red-800/40 bg-red-950/50 px-2 py-0.5">
            <Text className="text-xs text-red-400">Stock épuisé</Text>
          </View>
        )}

        <View className="mt-2">
          {available ? (
            <Text>
              <Text className="text-xl font-bold text-white">{price_monthly} €</Text>
              <Text className="text-sm text-gray-500"> / mois</Text>
            </Text>
          ) : (
            <Text className="text-sm text-gray-500">Indisponible</Text>
          )}
        </View>

        {isList && (
          <View className="mt-3">
            <Button variant="primary" size="sm" onPress={goToProduct}>
              Voir le service
            </Button>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}