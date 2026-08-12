import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/* ════════════════════════════════════════
   Config réseau
   - Android émulateur : localhost de la machine hôte = 10.0.2.2
   - iOS simulateur     : localhost fonctionne directement
   - Téléphone physique : remplace par l'IP LAN de ta machine
     (ex. '192.168.1.23'), localhost ne marchera jamais.
════════════════════════════════════════ */
const HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

// ⚠️ À adapter si tu testes sur un vrai téléphone
export const API_URL = `http://${HOST}:5000`;

const COOKIE_KEY = 'cyna_session_cookie';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // pas d'effet sur natif, utile si build Expo Web
});

/* ── Rejoue le cookie de session Flask sur chaque requête ──
   Flask utilise `session['user_id']` (cookie httpOnly), pas de JWT.
   React Native n'a pas de "jar" de cookies automatique fiable comme
   un navigateur : on capture le Set-Cookie renvoyé au login/register
   et on le renvoie nous-mêmes en header Cookie sur les requêtes
   suivantes, en le persistant dans SecureStore. */
api.interceptors.request.use(async (config) => {
  const cookie = await SecureStore.getItemAsync(COOKIE_KEY);
  if (cookie) config.headers.Cookie = cookie;
  return config;
});

api.interceptors.response.use(
  async (response) => {
    const setCookie = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    if (setCookie) {
      const raw = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
      const sessionPair = raw.split(';')[0]; // ex: "session=eyJ..."
      if (sessionPair) await SecureStore.setItemAsync(COOKIE_KEY, sessionPair);
    }
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(COOKIE_KEY);
    }
    if (!error.response) {
      return Promise.reject({ message: 'Impossible de contacter le serveur. Vérifiez votre connexion.' });
    }
    return Promise.reject(error.response.data || { message: 'Erreur serveur.' });
  }
);

export const clearSessionCookie = () => SecureStore.deleteItemAsync(COOKIE_KEY);

/* ════════════════════════════════════════
   Auth — routes réelles de routes/users.py
════════════════════════════════════════ */
export const authService = {
  register:       (name, email, password) => api.post('/api/users/register', { name, email, password }),
  verifyEmail:    (token) => api.get(`/api/users/verify/${token}`),
  login:          (email, password) => api.post('/api/users/login', { email, password }),
  logout:         () => api.post('/api/users/logout'),
  me:             () => api.get('/api/users/me'),
  updateProfile:  (updates) => api.put('/api/users/me', updates),
  changePassword: (current_password, new_password) =>
    api.put('/api/users/me/password', { current_password, new_password }),
  forgotPassword: (email) => api.post('/api/users/forgot-password', { email }),
  resetPassword:  (token, password) => api.post('/api/users/reset-password', { token, password }),
};

/* ════════════════════════════════════════
   Catalogue — routes/products.py, routes/categories.py
════════════════════════════════════════ */
export const catalogService = {
  getCategories: () => api.get('/api/categories'),
  getProducts:   () => api.get('/api/products'),
  getProduct:    (id) => api.get(`/api/products/${id}`),
};

/* ════════════════════════════════════════
   Adresses — routes/addresses.py
════════════════════════════════════════ */
export const addressService = {
  list:   () => api.get('/api/addresses'),
  get:    (id) => api.get(`/api/addresses/${id}`),
  create: (data) => api.post('/api/addresses', data),
  update: (id, data) => api.put(`/api/addresses/${id}`, data),
  remove: (id) => api.delete(`/api/addresses/${id}`),
};

/* ════════════════════════════════════════
   Commandes — routes/orders.py
════════════════════════════════════════ */
export const orderService = {
  list: () => api.get('/api/orders'),
  get:  (id) => api.get(`/api/orders/${id}`),
};

/* ════════════════════════════════════════
   Moyens de paiement — routes/payment_methods.py
   (jamais créés/modifiés à la main : uniquement via le webhook Stripe)
════════════════════════════════════════ */
export const paymentMethodService = {
  list:       () => api.get('/api/payment-methods'),
  remove:     (id) => api.delete(`/api/payment-methods/${id}`),
  setDefault: (id) => api.put(`/api/payment-methods/${id}/default`),
};

/* ════════════════════════════════════════
   Paiement Stripe — routes/payments.py
════════════════════════════════════════ */
export const paymentService = {
  getConfig:           () => api.get('/api/payments/config'),
  createPaymentIntent: (items, billing_address_id) =>
    api.post('/api/payments/create-payment-intent', { items, billing_address_id }),
  createSetupIntent:   () => api.post('/api/payments/create-setup-intent'),
};

/* ════════════════════════════════════════
   Contact — routes/contact.py
════════════════════════════════════════ */
export const contactService = {
  send: (email, subject, message) => api.post('/api/contact', { email, subject, message }),
};

export default api;
