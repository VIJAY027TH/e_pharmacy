import API from './api';

export const prescriptionService = {
  upload: async (formData) => {
    const response = await API.post('/prescriptions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserPrescriptions: async () => {
    const response = await API.get('/prescriptions');
    return response.data;
  }
};
