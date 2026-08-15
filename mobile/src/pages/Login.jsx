import { useState, useContext } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('AccountMain');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setForgotError('');
    setForgotLoading(true);
    try {
      await authService.forgotPassword(email);
      setResetSent(true);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  if (forgot) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-950">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
          <View className="w-full max-w-md self-center rounded-xl border border-gray-800 bg-gray-900 p-8">
            <View className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Text className="font-bold text-white">C</Text>
            </View>
            <Text className="text-xl font-bold text-white">Mot de passe oublié</Text>

            {resetSent ? (
              <View className="mt-4 rounded-lg border border-green-500/50 bg-green-950/40 p-3">
                <Text className="text-sm text-green-400">
                  ✅ Si un compte existe pour {email}, un lien de réinitialisation vient de lui être envoyé.
                </Text>
              </View>
            ) : (
              <View className="mt-4" style={{ gap: 16 }}>
                <Text className="text-sm text-gray-400">Entrez votre e-mail pour recevoir un lien de réinitialisation.</Text>
                <View>
                  <Text className="mb-1 text-sm text-gray-400">Adresse e-mail</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                    placeholderTextColor="#6b7280"
                  />
                </View>
                {forgotError && (
                  <View className="rounded-lg border border-red-500/50 bg-red-950/40 p-3">
                    <Text className="text-sm text-red-400">{forgotError}</Text>
                  </View>
                )}
                <Button variant="primary" size="lg" fullWidth loading={forgotLoading} onPress={handleForgot}>
                  Envoyer le lien
                </Button>
              </View>
            )}

            <Text
              className="mt-4 text-sm text-blue-400"
              onPress={() => { setForgot(false); setResetSent(false); setForgotError(''); }}
            >
              ← Retour à la connexion
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <View className="w-full max-w-md self-center rounded-xl border border-gray-800 bg-gray-900 p-8">
          <View className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Text className="font-bold text-white">C</Text>
          </View>
          <Text className="text-xl font-bold text-white">Connexion</Text>
          <Text className="mt-1 text-sm text-gray-400">Accédez à vos services Cyna</Text>

          <View className="mt-6" style={{ gap: 16 }}>
            <View>
              <Text className="mb-1 text-sm text-gray-400">Adresse e-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                placeholderTextColor="#6b7280"
              />
            </View>
            <View>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm text-gray-400">Mot de passe</Text>
                <Text className="text-xs text-blue-400" onPress={() => setForgot(true)}>Mot de passe oublié ?</Text>
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                placeholderTextColor="#6b7280"
              />
            </View>

            {error && (
              <View className="rounded-lg border border-red-500/50 bg-red-950/40 p-3">
                <Text className="text-sm text-red-400">{error}</Text>
              </View>
            )}

            <Button variant="primary" size="lg" fullWidth loading={loading} onPress={handleLogin}>
              Se connecter
            </Button>
          </View>

          <Text className="mt-6 text-center text-sm text-gray-400">
            Pas encore de compte ?{' '}
            <Text className="text-blue-400 underline" onPress={() => navigation.navigate('Register')}>
              Créer un compte
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}