import api from './api';

export const orderService = {
  createOrder: async (shippingAddress) => {
    const response = await api.post('/orders', { shippingAddress });
    return response.data;
  },

  getMyOrders: async (params = { page: 1, limit: 20 }) => {
    const response = await api.get('/orders/me', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  updateShippingAddress: async (id, shippingAddress) => {
    const response = await api.patch(`/orders/${id}/address`, { shippingAddress });
    return response.data;
  }
};
