import { View, Text, ScrollView } from 'react-native';

export default function LegalNotice() {
  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 py-16">
      <Text className="text-3xl font-bold text-white">Mentions légales</Text>
      <View className="mt-6" style={{ gap: 24 }}>
        <View>
          <Text className="mb-2 font-semibold text-white">Éditeur du site</Text>
          <Text className="text-sm text-gray-400">
            Cyna — [raison sociale à compléter]{'\n'}[adresse à compléter]{'\n'}Contact : support@cyna.fr
          </Text>
        </View>
        <View>
          <Text className="mb-2 font-semibold text-white">Hébergement</Text>
          <Text className="text-sm text-gray-400">[hébergeur à compléter]</Text>
        </View>
        <View>
          <Text className="mb-2 font-semibold text-white">Directeur de la publication</Text>
          <Text className="text-sm text-gray-400">[nom à compléter]</Text>
        </View>
      </View>
      <Text className="mt-8 text-xs text-gray-600">
        Cette page est un modèle à compléter avec les informations légales réelles de votre société avant mise en production.
      </Text>
    </ScrollView>
  );
}