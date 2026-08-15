import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';

export default function NotFound() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center bg-gray-950 px-4">
      <Text className="text-sm font-semibold text-blue-500">404</Text>
      <Text className="mt-2 text-3xl font-bold text-white">Page introuvable</Text>
      <Text className="mt-3 max-w-xs text-center text-gray-400">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </Text>

      <View className="mt-8 flex-row gap-3">
        <Button variant="primary" size="lg" onPress={() => navigation.navigate('HomeTab')}>
          Retour à l'accueil
        </Button>
        <Button variant="outline" size="lg" onPress={() => navigation.navigate('CatalogueTab')}>
          Voir le catalogue
        </Button>
      </View>

      <View className="mt-8 flex-row flex-wrap justify-center gap-4">
        <Text className="text-sm text-gray-500" onPress={() => navigation.navigate('AccountTab')}>Se connecter</Text>
        <Text className="text-sm text-gray-500" onPress={() => navigation.navigate('Contact')}>Contacter le support</Text>
        <Text className="text-sm text-gray-500" onPress={() => navigation.navigate('Search')}>Rechercher un service</Text>
      </View>
    </View>
  );
}