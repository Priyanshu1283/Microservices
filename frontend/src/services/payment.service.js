import api from './api';

export const paymentService = {
  createPayment: async (orderId) => {
    const response = await api.post(`/payments/create/${orderId}`);
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    // paymentData should contain: razorpayOrderId, paymentId, signature
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  }
};
