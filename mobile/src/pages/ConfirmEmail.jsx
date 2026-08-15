import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';

export default function ConfirmEmail() {
  const { params } = useRoute();
  const token = params?.token;
  const navigation = useNavigation();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    authService.confirmEmail(token)
      .then((data) => { setStatus('success'); setMessage(data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.message); });
  }, [token]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-950 p-4">
      <View className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 items-center">
        {status === 'loading' && <Text className="text-gray-300">Confirmation en cours...</Text>}
        {status === 'success' && (
          <>
            <Text className="mb-4 text-center font-semibold text-green-400">{message}</Text>
            <Text className="text-blue-400 underline" onPress={() => navigation.navigate('AccountTab')}>Se connecter</Text>
          </>
        )}
        {status === 'error' && (
          <>
            <Text className="mb-4 text-center font-semibold text-red-400">{message}</Text>
            <Text className="text-blue-400 underline" onPress={() => navigation.navigate('AccountTab')}>Retour à la connexion</Text>
          </>
        )}
      </View>
    </View>
  );
}