import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session au démarrage en interrogeant le back (cookie httpOnly, pas de token en JS).
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

  const register = async (name, email, password) => {
    return authService.register(name, email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const data = await authService.updateProfile(updates);
    setUser(data.user);
    return data.user;
  };

  const changePassword = (currentPassword, newPassword) =>
    authService.changePassword(currentPassword, newPassword);

  // Ajouté pour AuthScreens.jsx (mobile) : le web appelait authService.forgotPassword
  // directement depuis Login.jsx, mais AuthScreens.jsx passe par le contexte.
  const forgotPassword = (email) => authService.forgotPassword(email);

  // Ajouté pour AuthScreens.jsx (mobile), idem : web appelait authService.resetPassword
  // directement depuis ResetPassword.jsx.
  const resetPassword = (token, password) => authService.resetPassword(token, password);

  // Ajouté pour AuthScreens.jsx (mobile). Attention au nom : api.js expose
  // `confirmEmail`, pas `verifyEmail` — AuthScreens.jsx appelle verifyEmail(token),
  // donc on garde ce nom ici côté contexte et on le fait pointer vers confirmEmail.
  const verifyEmail = (token) => authService.confirmEmail(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};