import { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

const validatePassword = (pwd) => [
  { ok: pwd.length >= 8, label: '8 caractères minimum' },
  { ok: /[A-Z]/.test(pwd), label: 'Une majuscule' },
  { ok: /[a-z]/.test(pwd), label: 'Une minuscule' },
  { ok: /[0-9]/.test(pwd), label: 'Un chiffre' },
  { ok: /[^A-Za-z0-9]/.test(pwd), label: 'Un caractère spécial' }
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register } = useContext(AuthContext);
  const navigation = useNavigation();
  const rules = validatePassword(password);
  const allValid = rules.every((r) => r.ok);

  const handleSubmit = async () => {
    if (!allValid) {
      setError('Le mot de passe ne respecte pas les règles de sécurité.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 p-4">
        <View className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 items-center">
          <View className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Text className="font-bold text-white">C</Text>
          </View>
          <View className="rounded-lg border border-green-500/50 bg-green-950/40 p-4">
            <Text className="text-center text-sm text-green-400">
              ✅ Un e-mail de confirmation a été envoyé à {email}.
            </Text>
          </View>
          <View className="mt-6 w-full">
            <Button variant="primary" fullWidth onPress={() => navigation.navigate('AccountTab')}>
              Retour à la connexion
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <View className="w-full max-w-md self-center rounded-xl border border-gray-800 bg-gray-900 p-8">
          <View className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Text className="font-bold text-white">C</Text>
          </View>
          <Text className="text-xl font-bold text-white">Créer un compte</Text>
          <Text className="mt-1 text-sm text-gray-400">Rejoignez Cyna et sécurisez votre entreprise</Text>

          <View className="mt-6" style={{ gap: 16 }}>
            <View>
              <Text className="mb-1 text-sm text-gray-400">Nom complet</Text>
              <TextInput value={name} onChangeText={setName}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white" placeholderTextColor="#6b7280" />
            </View>
            <View>
              <Text className="mb-1 text-sm text-gray-400">Adresse e-mail</Text>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white" placeholderTextColor="#6b7280" />
            </View>
            <View>
              <Text className="mb-1 text-sm text-gray-400">Mot de passe</Text>
              <TextInput value={password} onChangeText={setPassword} secureTextEntry
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white" placeholderTextColor="#6b7280" />
              {password.length > 0 && (
                <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1">
                  {rules.map((r, i) => (
                    <Text key={i} className={`text-xs ${r.ok ? 'text-green-400' : 'text-gray-500'}`}>
                      {r.ok ? '✓' : '○'} {r.label}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {error && (
              <View className="rounded-lg border border-red-500/50 bg-red-950/40 p-3">
                <Text className="text-sm text-red-400">{error}</Text>
              </View>
            )}

            <Button variant="primary" size="lg" fullWidth loading={loading} disabled={!allValid} onPress={handleSubmit}>
              Créer mon compte
            </Button>
          </View>

          <Text className="mt-6 text-center text-sm text-gray-400">
            Déjà un compte ?{' '}
            <Text className="text-blue-400 underline" onPress={() => navigation.navigate('AccountTab')}>
              Se connecter
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}