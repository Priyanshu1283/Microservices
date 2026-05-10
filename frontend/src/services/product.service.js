import api from './api';

export const productService = {
  // Public Routes
  getProducts: async (params = {}) => {
    // params can include q, minprice, maxprice, skip, limit
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Seller Routes
  getSellerProducts: async (params = {}) => {
    const response = await api.get('/products/seller', { params });
    return response.data;
  },

  createProduct: async (productData) => {
    // Note: productData should be FormData to support image uploads
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
