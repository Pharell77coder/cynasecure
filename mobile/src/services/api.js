import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/* ── Injection automatique du JWT ── */
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('cyna_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Gestion globale des erreurs ── */
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('cyna_token');
      await SecureStore.deleteItemAsync('cyna_user');
    }
    return Promise.reject(error.response?.data || error);
  }
);

/* ════════════════════════════════════════
   Auth
════════════════════════════════════════ */
export const authService = {
  login:           (email, password) => api.post('/auth/login', { email, password }),
  register:        (name, email, password) => api.post('/auth/register', { name, email, password }),
  forgotPassword:  (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:   (token, password) => api.post('/auth/reset-password', { token, password }),
  confirmEmail:    (token) => api.get(`/auth/confirm/${token}`),
  me:              () => api.get('/auth/me'),
};

/* ════════════════════════════════════════
   Produits
════════════════════════════════════════ */
export const productService = {
  getAll:      (params = {}) => api.get('/products', { params }),
  getById:     (id) => api.get(`/products/${id}`),
  search:      (params = {}) => api.get('/products/search', { params }),
  getFeatured: () => api.get('/products/featured'),
  getSimilar:  (id) => api.get(`/products/${id}/similar`),
};

/* ════════════════════════════════════════
   Catégories
════════════════════════════════════════ */
export const categoryService = {
  getAll:  () => api.get('/categories'),
  getById: (slug) => api.get(`/categories/${slug}`),
};

/* ════════════════════════════════════════
   Commandes
════════════════════════════════════════ */
export const orderService = {
  create:     (data) => api.post('/orders', data),
  getAll:     (params = {}) => api.get('/orders', { params }),
  getById:    (id) => api.get(`/orders/${id}`),
  confirm:    (id, data) => api.post(`/orders/${id}/confirm`, data),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

/* ════════════════════════════════════════
   Compte utilisateur
════════════════════════════════════════ */
export const userService = {
  getProfile:      () => api.get('/user/profile'),
  updateProfile:   (data) => api.put('/user/profile', data),
  changePassword:  (data) => api.post('/user/change-password', data),
  getAddresses:    () => api.get('/user/addresses'),
  addAddress:      (data) => api.post('/user/addresses', data),
  deleteAddress:   (id) => api.delete(`/user/addresses/${id}`),
  getSubscriptions: () => api.get('/user/subscriptions'),
  cancelSubscription: (id) => api.delete(`/user/subscriptions/${id}`),
};

/* ════════════════════════════════════════
   Contact
════════════════════════════════════════ */
export const contactService = {
  send:    (data) => api.post('/contact', data),
  chatbot: (message, history = []) => api.post('/chatbot', { message, history }),
};

export default api;