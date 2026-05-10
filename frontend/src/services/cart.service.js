import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addItem: async (productId, qty = 1) => {
    const response = await api.post('/cart/items', { productId, qty });
    return response.data;
  },

  updateItemQuantity: async (productId, qty) => {
    const response = await api.patch(`/cart/items/${productId}`, { qty });
    return response.data;
  }
};
