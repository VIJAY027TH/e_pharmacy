import API from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  getUserOrders: async () => {
    const response = await API.get('/orders');
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await API.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  getDeliveryTracking: async (orderId) => {
    const response = await API.get(`/delivery/${orderId}`);
    return response.data;
  }
};
