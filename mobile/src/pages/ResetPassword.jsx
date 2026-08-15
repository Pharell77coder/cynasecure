import { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import Button from '../components/Button';

export default function ResetPassword() {
  const { params } = useRoute();
  const token = params?.token;
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setStatus('loading');
    try {
      await authService.resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigation.navigate('AccountTab'), 2500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 p-4">
        <View className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 items-center">
          <Text className="text-xl font-bold text-white">Mot de passe réinitialisé ✅</Text>
          <Text className="mt-2 text-sm text-gray-400">Vous allez être redirigé vers la connexion...</Text>
          <Text className="mt-4 text-blue-400 underline" onPress={() => navigation.navigate('AccountTab')}>
            Se connecter maintenant
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <View className="w-full max-w-md self-center rounded-xl border border-gray-800 bg-gray-900 p-8">
          <Text className="text-xl font-bold text-white">Nouveau mot de passe</Text>
          <Text className="mt-1 text-sm text-gray-400">Choisissez un nouveau mot de passe pour votre compte.</Text>

          <View className="mt-6" style={{ gap: 16 }}>
            <View>
              <Text className="mb-1 text-sm text-gray-400">Nouveau mot de passe</Text>
              <TextInput value={password} onChangeText={setPassword} secureTextEntry
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white" placeholderTextColor="#6b7280" />
            </View>
            <View>
              <Text className="mb-1 text-sm text-gray-400">Confirmer le mot de passe</Text>
              <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white" placeholderTextColor="#6b7280" />
            </View>

            {errorMessage && (
              <View className="rounded-lg border border-red-500/50 bg-red-950/40 p-3">
                <Text className="text-sm text-red-400">{errorMessage}</Text>
              </View>
            )}

            <Button variant="primary" size="lg" fullWidth loading={status === 'loading'} onPress={handleSubmit}>
              Réinitialiser mon mot de passe
            </Button>
          </View>

          <Text className="mt-6 text-center text-sm text-blue-400 underline" onPress={() => navigation.navigate('AccountTab')}>
            Retour à la connexion
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}