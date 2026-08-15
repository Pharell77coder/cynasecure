import { View, Text, ScrollView } from 'react-native';

export default function Terms() {
  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 py-16">
      <Text className="text-3xl font-bold text-white">Conditions générales d'utilisation</Text>
      <View className="mt-6" style={{ gap: 24 }}>
        <View>
          <Text className="mb-2 font-semibold text-white">1. Objet</Text>
          <Text className="text-sm text-gray-400">Les présentes conditions régissent l'utilisation des services Cyna souscrits via ce site.</Text>
        </View>
        <View>
          <Text className="mb-2 font-semibold text-white">2. Abonnements et facturation</Text>
          <Text className="text-sm text-gray-400">Les abonnements sont facturés mensuellement ou annuellement selon l'option choisie à la souscription.</Text>
        </View>
        <View>
          <Text className="mb-2 font-semibold text-white">3. Résiliation</Text>
          <Text className="text-sm text-gray-400">Vous pouvez résilier votre abonnement à tout moment depuis votre espace "Mon compte".</Text>
        </View>
      </View>
      <Text className="mt-8 text-xs text-gray-600">
        Cette page est un modèle à compléter avec vos CGU réelles avant mise en production.
      </Text>
    </ScrollView>
  );
}