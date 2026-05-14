import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)/login" options={{ title: 'Connexion', headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Accueil', headerShown: false }} />
    </Stack>
  );
}