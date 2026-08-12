import { createContext, useState, useEffect, useContext } from 'react';
import { authService, clearSessionCookie } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restaure la session au démarrage en interrogeant le back
     (cookie de session Flask rejoué automatiquement par api.js). */
  useEffect(() => {
    authService.me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const register = (name, email, password) => authService.register(name, email, password);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // même si l'appel échoue, on nettoie la session locale
    }
    await clearSessionCookie();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const data = await authService.updateProfile(updates);
    setUser(data.user);
    return data.user;
  };

  const changePassword = (currentPassword, newPassword) =>
    authService.changePassword(currentPassword, newPassword);

  const forgotPassword = (email) => authService.forgotPassword(email);
  const resetPassword = (token, password) => authService.resetPassword(token, password);
  const verifyEmail = (token) => authService.verifyEmail(token);

  return (
    <AuthContext.Provider
      value={{
        user, loading,
        login, register, logout,
        updateProfile, changePassword,
        forgotPassword, resetPassword, verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
