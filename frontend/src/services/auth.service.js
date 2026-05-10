import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAddresses: async () => {
    const response = await api.get('/auth/users/me/addresses');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/auth/users/me/addresses', addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/auth/users/me/addresses/${id}`);
    return response.data;
  }
};
