import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleSubmit = async () => {
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          await AsyncStorage.setItem('token', data.token);
          router.push('/dashboard');
        } else {
          alert("Inscrit ! Vous pouvez vous connecter.");
          setIsLogin(true);
        }
      } else {
        alert(data.error || "Erreur lors de l'opération");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 300 }}>
        <Text style={{ textAlign: 'center', fontSize: 20, marginBottom: 10 }}>
          {isLogin ? 'Connexion' : 'Inscription'}
        </Text>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={{ width: '100%', marginBottom: 10, padding: 8, color: 'black', borderWidth: 1, borderColor: '#ccc' }}
        />
        <TextInput
          placeholder="Mot de passe"
          secureTextEntry
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          style={{ width: '100%', marginBottom: 10, padding: 8, color: 'black', borderWidth: 1, borderColor: '#ccc' }}
        />
        <TouchableOpacity onPress={handleSubmit} style={{ width: '100%', padding: 10, backgroundColor: '#ddd' }}>
          <Text style={{ textAlign: 'center' }}>
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={{ color: 'blue', marginTop: 15, textAlign: 'center' }}>
            {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Auth;