import { View, Text, ScrollView } from 'react-native';

export default function About() {
  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 py-16">
      <Text className="text-3xl font-bold text-white">À propos de Cyna</Text>
      <View className="mt-6" style={{ gap: 16 }}>
        <Text className="text-gray-400">
          Cyna accompagne les entreprises dans la sécurisation de leur infrastructure grâce à des
          services SaaS de cybersécurité managés : SOC, EDR et XDR.
        </Text>
        <Text className="text-gray-400">
          Notre équipe d'experts surveille, détecte et répond aux menaces 24/7, pour que vous
          puissiez vous concentrer sur votre activité.
        </Text>
      </View>
    </ScrollView>
  );
}