import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/users/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return setUser(null);
        const data = await res.json();
        // Le back office n'accepte que les comptes admin, même si la session existe.
        setUser(data.user.role === 'admin' ? data.user : null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    if (data.user.role !== 'admin') {
      // On ferme la session serveur ouverte par erreur pour ce compte non-admin.
      await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
      throw new Error("Ce compte n'a pas accès au back office.");
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
