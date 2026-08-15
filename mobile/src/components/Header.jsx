import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Header() {
  const { user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    if (search.trim()) {
      navigation.navigate('Search', { q: search.trim() });
      setSearch('');
    }
  };

  const initials = user ? user.username.slice(0, 1).toUpperCase() : null;

  return (
    <View className="flex-row items-center justify-between gap-2 border-b border-gray-800 bg-gray-950 px-3 py-2">
      <TouchableOpacity onPress={() => navigation.navigate('Home')} className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Text className="font-bold text-white">C</Text>
        </View>
        <Text className="text-lg font-bold text-white">Cynasecure</Text>
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5">
        <Text className="text-gray-500">🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          placeholder="Rechercher..."
          placeholderTextColor="#6b7280"
          returnKeyType="search"
          className="flex-1 text-sm text-white"
        />
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} className="relative">
          <Text className="text-xl">🛒</Text>
          {cartCount > 0 && (
            <View className="absolute -right-2 -top-2 h-4 w-4 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-[10px] text-white">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {user ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Account')}
            className="h-7 w-7 items-center justify-center rounded-full bg-blue-600"
          >
            <Text className="text-xs font-bold text-white">{initials}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="rounded-lg bg-blue-600 px-3 py-1.5"
          >
            <Text className="text-sm font-medium text-white">Connexion</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}