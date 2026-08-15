import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.42:5000';

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem('token');

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');
  return data;
}

export const authService = {
  login: async (email, password) => {
    const data = await request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) await AsyncStorage.setItem('token', data.token);
    return data;
  },

  register: (name, email, password) =>
    request('/api/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  logout: async () => {
    await AsyncStorage.removeItem('token');
    return request('/api/users/logout', { method: 'POST' });
  },

  me: () => request('/api/users/me'),

  confirmEmail: (token) => request(`/api/users/verify/${token}`),

  forgotPassword: (email) =>
    request('/api/users/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token, password) =>
    request('/api/users/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),

  updateProfile: (updates) =>
    request('/api/users/me', { method: 'PUT', body: JSON.stringify(updates) }),

  changePassword: (currentPassword, newPassword) =>
    request('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    })
};

export const catalogService = {
  getProducts: () => request('/api/products'),
  getProduct: (id) => request(`/api/products/${id}`),
  getCategories: () => request('/api/categories')
};

export const addressService = {
  list: () => request('/api/addresses'),
  create: (address) => request('/api/addresses', { method: 'POST', body: JSON.stringify(address) }),
  update: (id, address) => request(`/api/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
  remove: (id) => request(`/api/addresses/${id}`, { method: 'DELETE' })
};

export const orderService = {
  list: () => request('/api/orders'),
  get: (id) => request(`/api/orders/${id}`)
};

export const paymentMethodService = {
  list: () => request('/api/payment-methods'),
  remove: (id) => request(`/api/payment-methods/${id}`, { method: 'DELETE' }),
  setDefault: (id) => request(`/api/payment-methods/${id}/default`, { method: 'PUT' })
};

export const paymentService = {
  getConfig: () => request('/api/payments/config'),
  createPaymentIntent: (items, billingAddressId) =>
    request('/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ items, billing_address_id: billingAddressId })
    }),
  createSetupIntent: () => request('/api/payments/create-setup-intent', { method: 'POST' })
};

export const contactService = {
  send: (email, subject, message) =>
    request('/api/contact', { method: 'POST', body: JSON.stringify({ email, subject, message }) })
};