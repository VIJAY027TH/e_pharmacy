import API from './api';

export const medicineService = {
  getAllMedicines: async () => {
    const response = await API.get('/medicines');
    return response.data;
  },

  getMedicineById: async (id) => {
    const response = await API.get(`/medicines/${id}`);
    return response.data;
  },

  searchMedicines: async (params) => {
    const response = await API.get('/medicines/search', { params });
    return response.data;
  },

  getCategories: async () => {
    const response = await API.get('/categories');
    return response.data;
  },

  getReviews: async (medicineId) => {
    const response = await API.get(`/medicines/${medicineId}/reviews`);
    return response.data;
  },

  addReview: async (reviewData) => {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  }
};
