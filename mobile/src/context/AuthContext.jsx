import { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restaure la session au démarrage */
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('cyna_user');
        const token  = await SecureStore.getItemAsync('cyna_token');
        if (stored && token) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // session invalide
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const { token, user: userData } = data;

    await SecureStore.setItemAsync('cyna_token', token);
    await SecureStore.setItemAsync('cyna_user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('cyna_token');
    await SecureStore.deleteItemAsync('cyna_user');
    setUser(null);
  };

  const register = async (name, email, password) => {
    return authService.register(name, email, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
