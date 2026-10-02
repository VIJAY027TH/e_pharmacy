import API from './api';

export const cartService = {
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },

  addItem: async (medicineId, quantity = 1) => {
    const response = await API.post('/cart/items', { medicineId, quantity });
    return response.data;
  },

  updateQuantity: async (itemId, quantity) => {
    const response = await API.put(`/cart/items/${itemId}?quantity=${quantity}`);
    return response.data;
  },

  removeItem: async (itemId) => {
    const response = await API.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await API.delete('/cart/clear');
    return response.data;
  }
};
